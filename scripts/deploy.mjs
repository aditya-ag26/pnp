/**
 * deploy.mjs — publishes dist/ to AWS: a private S3 bucket behind CloudFront.
 *
 *   npm run deploy        (builds first, then runs this)
 *
 * Needs the AWS CLI, signed in (`aws login`). Safe to run again and again:
 * the first run creates the bucket and the CloudFront distribution, later
 * runs only upload what changed and refresh the cache.
 *
 * Why this setup: it is the cheapest way to host a static site on AWS.
 * CloudFront's always-free allowance (1 TB and 10 million requests a month)
 * covers the traffic, and the bucket holds only a few megabytes.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const REGION = 'ap-south-1' // Mumbai: closest to the audience
const NAME = 'pawsandposes-site'
const DIST = 'dist'

/** AWS's managed "CachingOptimized" policy: cache by path, compress with gzip + brotli. */
const CACHE_POLICY = '658327ea-f89d-4fab-a63d-7e88639e58f6'

const HOUR = 3600
const YEAR = 31536000

function aws(args, { json = true, quiet = false } = {}) {
  try {
    const out = execFileSync('aws', [...args, ...(json ? ['--output', 'json'] : [])], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', quiet ? 'ignore' : 'inherit'],
      shell: process.platform === 'win32',
    })
    return json && out.trim() ? JSON.parse(out) : out
  } catch (error) {
    if (quiet) return null
    throw error
  }
}

/** Writes a JSON document to a temp file and returns a file:// reference for the CLI. */
function jsonFile(name, value) {
  const path = join(mkdtempSync(join(tmpdir(), 'pnp-deploy-')), name)
  writeFileSync(path, JSON.stringify(value))
  return `file://${path.replace(/\\/g, '/')}`
}

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('No build found. Run `npm run deploy` (it builds first), or `npm run build`.')
  process.exit(1)
}

// ── Who are we? ─────────────────────────────────────────────────────────────
const identity = aws(['sts', 'get-caller-identity'], { quiet: true })
if (!identity) {
  console.error('Not signed in to AWS. Run `aws login`, then try again.')
  process.exit(1)
}
const account = identity.Account
const bucket = `${NAME}-${account}`
console.log(`AWS account ${account} · bucket ${bucket} · region ${REGION}`)

// ── Bucket (private: only CloudFront may read it) ───────────────────────────
const bucketExists = aws(['s3api', 'head-bucket', '--bucket', bucket], { quiet: true, json: false }) !== null
if (!bucketExists) {
  console.log('Creating bucket…')
  aws(['s3api', 'create-bucket', '--bucket', bucket, '--region', REGION, '--create-bucket-configuration', `LocationConstraint=${REGION}`])
}
aws(['s3api', 'put-public-access-block', '--bucket', bucket, '--public-access-block-configuration', 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'], { json: false })

// ── Upload ──────────────────────────────────────────────────────────────────
// Hashed build files never change, so browsers may keep them for a year.
// Everything else is checked again after an hour; the page itself every time.
console.log('Uploading…')
const target = `s3://${bucket}`
const sync = (extra) => aws(['s3', 'sync', DIST, target, '--region', REGION, '--only-show-errors', ...extra], { json: false })

sync(['--exclude', '*', '--include', 'assets/*', '--cache-control', `public,max-age=${YEAR},immutable`])
sync(['--exclude', '*', '--include', '*.glb', '--content-type', 'model/gltf-binary', '--cache-control', `public,max-age=${HOUR}`])
sync(['--exclude', 'assets/*', '--exclude', '*.glb', '--exclude', 'index.html', '--cache-control', `public,max-age=${HOUR}`])
aws(['s3', 'cp', join(DIST, 'index.html'), `${target}/index.html`, '--region', REGION, '--only-show-errors', '--cache-control', 'no-cache', '--content-type', 'text/html'], { json: false })
// Remove files that are no longer part of the build.
sync(['--delete', '--size-only', '--exclude', '*.html'])

// ── CloudFront ──────────────────────────────────────────────────────────────
const distributions = aws(['cloudfront', 'list-distributions'])?.DistributionList?.Items ?? []
let distribution = distributions.find((d) => d.Comment === NAME)

if (!distribution) {
  console.log('Creating CloudFront distribution (first deploy only)…')

  const controls = aws(['cloudfront', 'list-origin-access-controls'])?.OriginAccessControlList?.Items ?? []
  const control =
    controls.find((c) => c.Name === NAME) ??
    aws(['cloudfront', 'create-origin-access-control', '--origin-access-control-config', jsonFile('oac.json', {
      Name: NAME,
      SigningProtocol: 'sigv4',
      SigningBehavior: 'always',
      OriginAccessControlOriginType: 's3',
    })]).OriginAccessControl

  // The site uses real URLs (/about, …): any path that is not a file gets index.html.
  const spaFallback = (code) => ({ ErrorCode: code, ResponsePagePath: '/index.html', ResponseCode: '200', ErrorCachingMinTTL: 0 })

  distribution = aws(['cloudfront', 'create-distribution', '--distribution-config', jsonFile('distribution.json', {
    CallerReference: `${NAME}-${Date.now()}`,
    Comment: NAME,
    Enabled: true,
    DefaultRootObject: 'index.html',
    HttpVersion: 'http2and3',
    IsIPV6Enabled: true,
    PriceClass: 'PriceClass_200', // every region except the two priciest; includes India
    Origins: {
      Quantity: 1,
      Items: [{
        Id: 's3',
        DomainName: `${bucket}.s3.${REGION}.amazonaws.com`,
        OriginAccessControlId: control.Id,
        S3OriginConfig: { OriginAccessIdentity: '' },
      }],
    },
    DefaultCacheBehavior: {
      TargetOriginId: 's3',
      ViewerProtocolPolicy: 'redirect-to-https',
      Compress: true,
      CachePolicyId: CACHE_POLICY,
      AllowedMethods: { Quantity: 2, Items: ['GET', 'HEAD'], CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] } },
    },
    CustomErrorResponses: { Quantity: 2, Items: [spaFallback(403), spaFallback(404)] },
  })]).Distribution

  // Let this distribution, and only it, read the bucket.
  aws(['s3api', 'put-bucket-policy', '--bucket', bucket, '--policy', jsonFile('policy.json', {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'CloudFrontRead',
      Effect: 'Allow',
      Principal: { Service: 'cloudfront.amazonaws.com' },
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${bucket}/*`,
      Condition: { StringEquals: { 'AWS:SourceArn': `arn:aws:cloudfront::${account}:distribution/${distribution.Id}` } },
    }],
  })], { json: false })

  console.log('\nFirst deploy: CloudFront takes about 5–15 minutes to go live worldwide.')
} else {
  // One wildcard path counts as a single invalidation (1,000 a month are free).
  aws(['cloudfront', 'create-invalidation', '--distribution-id', distribution.Id, '--paths', '/*'])
  console.log('Cache refreshed; changes are live within a minute or two.')
}

console.log(`\nSite: https://${distribution.DomainName}`)
