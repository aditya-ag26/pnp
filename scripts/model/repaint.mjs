/**
 * Texture repainting: recolours regions of a primitive's base-colour texture.
 * Jobs are described in settings.mjs (REPAINT).
 */
import sharp from 'sharp'

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

/** True when hue `h` lies in [lo, hi]; a range like [338, 32] wraps around red. */
const hueInRange = (h, [lo, hi]) => (lo <= hi ? h >= lo && h <= hi : h >= lo || h <= hi)

/** Marks every texel covered by a triangle that lies wholly inside `box`. */
function maskTexels(prim, box, width, height) {
  const pos = prim.getAttribute('POSITION').getArray()
  const uv = prim.getAttribute('TEXCOORD_0').getArray()
  const index = prim.getIndices().getArray()
  const mask = new Uint8Array(width * height)
  const inside = (v) => [0, 1, 2].every((a) => pos[v * 3 + a] >= box.min[a] && pos[v * 3 + a] <= box.max[a])

  for (let t = 0; t < index.length; t += 3) {
    const [a, b, c] = [index[t], index[t + 1], index[t + 2]]
    if (!inside(a) || !inside(b) || !inside(c)) continue
    const xs = [uv[a * 2] * width, uv[b * 2] * width, uv[c * 2] * width]
    const ys = [uv[a * 2 + 1] * height, uv[b * 2 + 1] * height, uv[c * 2 + 1] * height]
    const x0 = Math.max(0, Math.floor(Math.min(...xs)) - 1)
    const x1 = Math.min(width - 1, Math.ceil(Math.max(...xs)) + 1)
    const y0 = Math.max(0, Math.floor(Math.min(...ys)) - 1)
    const y1 = Math.min(height - 1, Math.ceil(Math.max(...ys)) + 1)
    for (let y = y0; y <= y1; y++) mask.fill(1, y * width + x0, y * width + x1 + 1)
  }
  return mask
}

export async function repaint(prim, jobs, label) {
  const texture = prim.getMaterial().getBaseColorTexture()
  const { data, info } = await sharp(texture.getImage()).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info

  for (const { box, from, to } of jobs) {
    const mask = maskTexels(prim, box, width, height)
    let painted = 0

    for (let i = 0; i < width * height; i++) {
      if (!mask[i]) continue
      const o = i * 3
      const [h, s, l] = rgbToHsl(data[o], data[o + 1], data[o + 2])
      if (from.hue && !hueInRange(h, from.hue)) continue
      if (s < (from.minSaturation ?? 0) || s > from.maxSaturation) continue
      if (l < from.minLightness || l > from.maxLightness) continue

      // Fade the effect in near the limits to avoid hard edges.
      let strength = Math.min(1, (from.maxSaturation - s) / 0.08, from.fade ? (from.maxLightness - l) / from.fade : 1)
      strength *= to.strength ?? 1

      let lightness = to.lightness
      // A partial blend keeps a little of the original shading…
      if (to.strength) lightness += (l - 0.78) * 0.25
      // …and grain adds a fine random texture.
      if (to.grain) lightness += (Math.random() - 0.5) * 2 * to.grain

      const [r, g, b] = hslToRgb(to.hue, to.saturation, lightness)
      data[o] += (r - data[o]) * strength
      data[o + 1] += (g - data[o + 1]) * strength
      data[o + 2] += (b - data[o + 2]) * strength
      painted++
    }
    console.log(`  repainted ${painted.toLocaleString()} texels on ${label}`)
  }

  const png = await sharp(data, { raw: { width, height, channels: 3 } }).png().toBuffer()
  texture.setImage(png).setMimeType('image/png')
}
