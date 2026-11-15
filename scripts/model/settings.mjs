/**
 * Settings for the model build — everything you would tune lives here.
 * Node names are the object names from Blender ("hero platform", "paint pup", …).
 * Coordinates are in each mesh's own local space (an island is ~2 units across).
 */

export const SOURCE = 'assets/source/full_environment.glb'
export const OUTPUT = 'public/models/islands.glb'

/** Triangle budget per node (first matching rule wins). */
export const TRIANGLE_BUDGET = [
  [/^hero platform/, 70_000],
  [/platform/, 45_000],
  [/pup/, 32_000],
  [/canvas/, 22_000],
  [/lamp/, 12_000],
  [/flower pot/, 10_000],
  [/glass/, 8_000],
  [/palette/, 8_000],
  [/mat/, 6_000],
  [/brush/, 2_500],
  [/cloud/, 5_000],
]
export const DEFAULT_TRIANGLE_BUDGET = 10_000

/** Texture size per node: [baseColor, normal, metallicRoughness]. */
export const TEXTURE_SIZE = [
  [/platform/, [2048, 1024, 512]],
  [/pup|canvas/, [1024, 1024, 512]],
  [/cloud/, [512, 256, 256]],
  [/./, [512, 512, 256]],
]

/** Colour lift per node: the hero island gets a touch more saturation. */
export const SATURATION = [[/^hero/, 1.12]]

/**
 * Pebbles on the hero island's ground, as [x, z, radius, ground height].
 * Keep in step with HERO_STONES in src/scene/props/plantings.ts.
 */
export const HERO_STONES = [
  [-0.487, -0.321, 0.063, -0.125],
  [-0.764, -0.127, 0.12, -0.138],
  [-0.362, -0.167, 0.045, -0.127],
  [-0.688, -0.395, 0.023, -0.137],
  [-0.571, 0.09, 0.033, -0.128],
  [-0.733, 0.165, 0.028, -0.138],
  [0.788, 0.237, 0.125, -0.138],
  [0.797, -0.272, 0.105, -0.149],
  [-0.118, 0.554, 0.03, -0.128],
  [0.5, 0.614, 0.048, -0.137],
  [0.141, 0.643, 0.043, -0.123],
]

/**
 * Cuts: details of the AI-generated meshes that are removed here and replaced
 * by hand-built props in the site (see src/scene/props/plantings.ts — if you
 * change a cut, check the prop that covers it).
 *
 *   { x, z, r }          — a cylinder; everything standing above its ground is cut
 *   { min, max, above }  — an x/z rectangle; everything above height `above` is cut
 */
export const CUTS = {
  'hero platform': [
    { x: -0.537, z: 0.364, r: 0.118 }, // scraggly flower
    { x: -0.474, z: 0.268, r: 0.062 }, // …its stray stem
    { x: -0.392, z: 0.52, r: 0.082 }, // green sprout
    // The house, its steps and the plant on its roof → src/scene/props/cottage.ts
    { min: [-0.275, -0.645], max: [0.415, -0.12], above: -0.085 },
    { min: [-0.3, -0.67], max: [0.412, -0.1], above: 0.12 },
    { min: [-0.04, -0.13], max: [0.41, 0.115], above: -0.085 },
    { min: [0.1, -0.86], max: [0.417, -0.3], above: 0.2 },
    // The blue pillar behind the house: the roof plant was fused into it, so it
    // goes too and is rebuilt cleanly (see heroProps in plantings.ts).
    { min: [0.4, -0.76], max: [0.67, -0.435], above: -0.085 },
    // The pebbles: fused into the ground they read as lumps, so each is cut out
    // and replaced by a separate stone (HERO_STONES in plantings.ts — same list).
    ...HERO_STONES.map(([x, z, r]) => ({ x, z, r: r + 0.02 })),
  ],
}

/**
 * Slices: everything below this height is removed. The hero island's lumpy
 * underside goes, leaving a flat disc like the other two islands (closed by a
 * plain base built in the site).
 */
export const SLICE_BELOW = {
  'hero platform': -0.262,
}

/**
 * Flatten under: bumps on a platform that lie beneath another object are
 * pressed flat, so stones no longer poke up through the thin yoga mats.
 * (The yoga and paint platforms share one mesh; the yoga one gets its own copy.)
 */
export const FLATTEN_UNDER = {
  'yoga platform': ['yoga mat folded', 'yoga mat'],
}

/** Muddy near-black blotches on bouquet petals → warm butter yellow. */
const DARK_PETALS = {
  box: { min: [-2, -0.02, -2], max: [2, 2, 2] },
  from: { maxSaturation: 1.01, minLightness: 0, maxLightness: 0.4, fade: 0.1 },
  to: { hue: 44, saturation: 0.72, lightness: 0.74 },
}

/**
 * Repaints: recolour part of a baked texture. Every texel that belongs to a
 * triangle inside `box` and matches `from` is moved towards the `to` colour.
 *
 *   from.hue [a, b]   — hue range in degrees; [338, 32] wraps around red
 *   from.fade         — soften the edge near maxLightness
 *   to.strength       — 0–1 blend (default 1); below 1 keeps some original shading
 *   to.grain          — random lightness noise, for a felt-like surface
 */
export const REPAINT = {
  'hero platform': [
    {
      // The ground: blotchy, wet-looking pinks → one even, soft peach close to
      // the other two platforms, with a fine felt-like grain.
      box: { min: [-2, -0.275, -2], max: [2, -0.02, 2] },
      from: { hue: [338, 32], minSaturation: 0.22, maxSaturation: 1.01, minLightness: 0.5, maxLightness: 0.95 },
      to: { hue: 14, saturation: 0.66, lightness: 0.8, strength: 0.88, grain: 0.012 },
    },
  ],
  'paint flower pot': [DARK_PETALS],
  'paint flower pot 1': [DARK_PETALS],
}
