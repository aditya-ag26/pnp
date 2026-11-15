/**
 * optimize-model.mjs — turns the raw Blender export into the web-ready GLB.
 *
 *   npm run optimize:model
 *
 * Source : assets/source/full_environment.glb   (~180 MB, ~4 million triangles, 2K textures)
 * Output : public/models/islands.glb            (~5 MB, WebP textures, meshopt-compressed)
 *
 * Steps, per mesh:  repaint texture → flatten / cut weak details → weld → simplify
 * Then, per file:   resize + re-encode textures → prune → quantize → compress
 *
 * What gets cut, repainted and how small things get is all in model/settings.mjs.
 * Node names are preserved: the site groups nodes into islands by name.
 */
import { statSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions'
import { dedup, meshopt, prune, quantize, reorder, simplifyPrimitive, weldPrimitive } from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'
import sharp from 'sharp'
import {
  CUTS,
  DEFAULT_TRIANGLE_BUDGET,
  FLATTEN_UNDER,
  OUTPUT,
  REPAINT,
  SATURATION,
  SLICE_BELOW,
  SOURCE,
  TEXTURE_SIZE,
  TRIANGLE_BUDGET,
} from './model/settings.mjs'
import { repaint } from './model/repaint.mjs'
import { cutDetails, flattenUnder, sliceBelow } from './model/surgery.mjs'

const source = process.argv[2] ?? SOURCE
const output = process.argv[3] ?? OUTPUT

/** First rule whose pattern matches the node name. */
const pick = (rules, name, fallback) => rules.find(([pattern]) => pattern.test(name))?.[1] ?? fallback
const megabytes = (path) => `${(statSync(path).size / 1e6).toFixed(1)} MB`
const triangleCount = (prim) => (prim.getIndices()?.getCount() ?? prim.getAttribute('POSITION').getCount()) / 3

await MeshoptEncoder.ready
await MeshoptSimplifier.ready

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })

console.log(`Reading ${source} …`)
const doc = await io.read(source)
const meshNodes = doc.getRoot().listNodes().filter((node) => node.getMesh())

await doc.transform(dedup())

// Identical meshes are shared between nodes (the yoga and paint platforms are
// one mesh). A node whose shape gets edited needs its own copy of it first.
for (const node of meshNodes) {
  if (!FLATTEN_UNDER[node.getName()]) continue
  const mesh = node.getMesh().clone()
  for (const prim of node.getMesh().listPrimitives()) {
    const copy = prim.clone().setAttribute('POSITION', prim.getAttribute('POSITION').clone())
    mesh.removePrimitive(prim).addPrimitive(copy)
  }
  node.setMesh(mesh)
}

// ── Geometry ────────────────────────────────────────────────────────────────
const done = new Set()
let before = 0
let after = 0

for (const node of meshNodes) {
  const name = node.getName()
  const budget = pick(TRIANGLE_BUDGET, name, DEFAULT_TRIANGLE_BUDGET)

  for (const prim of node.getMesh().listPrimitives()) {
    if (done.has(prim)) continue // meshes can be shared between nodes
    done.add(prim)

    if (REPAINT[name]) await repaint(prim, REPAINT[name], name)
    if (FLATTEN_UNDER[name]) {
      const covers = FLATTEN_UNDER[name].map((cover) => meshNodes.find((n) => n.getName() === cover))
      flattenUnder(prim, node, covers)
    }
    if (CUTS[name]) cutDetails(doc, prim, CUTS[name], name)
    if (SLICE_BELOW[name] !== undefined) sliceBelow(doc, prim, SLICE_BELOW[name], name)

    const start = triangleCount(prim)
    weldPrimitive(prim, {})
    const ratio = Math.min(1, budget / start)
    if (ratio < 1) simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error: 0.02 })
    const end = triangleCount(prim)

    before += start
    after += end
    console.log(`  ${name.padEnd(20)} ${String(Math.round(start)).padStart(7)} → ${String(Math.round(end)).padStart(6)} tris`)
  }
}
console.log(`Triangles: ${Math.round(before).toLocaleString()} → ${Math.round(after).toLocaleString()}`)

// ── Textures ────────────────────────────────────────────────────────────────
doc.createExtension(EXTTextureWebP).setRequired(true)

// texture → { size, slot, saturation }, using the largest size any node asks for.
const plan = new Map()
for (const node of meshNodes) {
  const name = node.getName()
  const [colorSize, normalSize, ormSize] = pick(TEXTURE_SIZE, name)
  for (const prim of node.getMesh().listPrimitives()) {
    const material = prim.getMaterial()
    if (!material) continue
    const slots = [
      [material.getBaseColorTexture(), colorSize, 'color'],
      [material.getNormalTexture(), normalSize, 'normal'],
      [material.getMetallicRoughnessTexture(), ormSize, 'orm'],
    ]
    for (const [texture, size, slot] of slots) {
      if (!texture) continue
      const planned = plan.get(texture)
      plan.set(texture, { size: Math.max(size, planned?.size ?? 0), slot, saturation: pick(SATURATION, name, 1) })
    }
  }
}

for (const [texture, { size, slot, saturation }] of plan) {
  let image = sharp(texture.getImage()).resize(size, size, { fit: 'inside', withoutEnlargement: true })
  if (slot === 'color' && saturation !== 1) image = image.modulate({ saturation })
  const webp = await image.webp({ quality: slot === 'color' ? 86 : 90, effort: 5 }).toBuffer()
  texture.setImage(webp).setMimeType('image/webp')
}
console.log(`Textures: ${plan.size} re-encoded as WebP`)

// ── Pack ────────────────────────────────────────────────────────────────────
await doc.transform(
  prune(),
  reorder({ encoder: MeshoptEncoder }),
  quantize(),
  meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)

await io.write(output, doc)
console.log(`Done: ${source} (${megabytes(source)}) → ${output} (${megabytes(output)})`)
