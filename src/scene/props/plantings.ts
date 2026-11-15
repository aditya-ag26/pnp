/**
 * Plantings — where the hand-built props go on each island.
 *
 * Positions are in island (GLB world) units. Several props cover areas cut out
 * of the source meshes by `CUTS` / `SLICE_BELOW` in scripts/model/settings.mjs —
 * if you change one, change the other.
 */
import { Group } from 'three'
import { ISLANDS } from '../config'
import { CLAY, place } from './clay'
import { cottage } from './cottage'
import { daisy, mound, patch, pebble, pompom, stone, tuft, tulip } from './flowers'
import { ball, baseDisc, block, bone, bowl, heart, pillar } from './objects'

/** The hero platform node is scaled by 1.03 in the GLB. */
const HERO = 1.03

/**
 * Stones on the hero island's ground, as [x, z, radius, ground height] in the
 * platform's local units. The original pebbles at these spots are cut out of
 * the mesh — keep this list in step with HERO_STONES in scripts/model/settings.mjs.
 */
const HERO_STONES: [number, number, number, number][] = [
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

/** Names a prop so it can be found in the scene later. */
const named = <T extends Group>(name: string, object: T) => {
  object.name = name
  return object
}

/** The turn that makes an object face the viewer, whatever angle its island rests at. */
const yawOf = (id: string) => -(ISLANDS.find((island) => island.id === id)?.yaw ?? 0)

function heroProps() {
  const props = new Group()

  // Main flower bed, replacing the scraggly AI flower.
  const bed = place(new Group(), -0.53 * HERO, -0.098 * HERO, 0.35 * HERO)
  bed.add(
    mound(0.125),
    place(daisy({ height: 0.25, size: 0.15, color: CLAY.cream, centre: CLAY.butter, lean: [0.04, -0.1] }), -0.015, 0.02, -0.01),
    place(tulip({ height: 0.17, size: 0.105, color: CLAY.rose, lean: [0.12, 0.2] }), 0.07, 0.015, 0.03, 0.8),
    place(pompom({ height: 0.115, size: 0.1, color: CLAY.lilac, lean: [0.1, -0.24] }), -0.075, 0.012, 0.045, -0.5),
    place(tuft(0.085), 0.02, 0.022, 0.075),
    place(pebble(0.026, CLAY.cream), 0.105, 0.0, -0.035),
    place(pebble(0.04, CLAY.butter), -0.118, -0.004, 0.012),
  )

  // Smaller planting, replacing the green sprout.
  const sprout = place(new Group(), -0.39 * HERO, -0.112 * HERO, 0.52 * HERO)
  sprout.add(
    mound(0.085),
    place(tulip({ height: 0.13, size: 0.09, color: CLAY.butter, lean: [0.1, 0.14] }), 0.005, 0.014, 0),
    place(daisy({ height: 0.095, size: 0.085, color: CLAY.pink, centre: CLAY.cream, lean: [0.16, -0.3] }), -0.045, 0.01, 0.03, 0.4),
    place(tuft(0.06, CLAY.leaf), 0.035, 0.016, 0.04),
  )

  // The cottage stands where the AI-generated house was cut out.
  const home = place(cottage(), 0.07 * HERO, -0.092 * HERO, -0.385 * HERO)
  home.scale.setScalar(HERO)

  // A plain base closes the disc where SLICE_BELOW removed the lumpy underside;
  // a bed of clouds sits beneath it (CLOUD_BEDS in ../config.ts).
  const belly = place(baseDisc(0.955 * HERO, 0.13), 0, -0.2 * HERO, 0)

  // The blue backdrop pillar, rebuilt where the original was cut out.
  const bluePillar = place(pillar(0.23 * HERO, 1.08 * HERO, 0.27 * HERO, CLAY.sky), 0.53 * HERO, -0.13 * HERO, -0.585 * HERO)

  // Separate stones where the fused-in pebbles were cut out: a low patch of
  // ground covers the hole, and a small rounded stone sits on it.
  const stones = new Group()
  HERO_STONES.forEach(([x, z, r, ground], i) => {
    const spot = place(new Group(), x * HERO, (ground - 0.004) * HERO, z * HERO)
    const size = Math.min(0.07, Math.max(0.032, r * 0.8)) * HERO
    const color = CLAY.stones[i % CLAY.stones.length]
    const pebble = stone(size, color, i * 1.3, 0.66 + (i % 3) * 0.07)
    pebble.position.y += (r + 0.045) * HERO * 0.1 // rest on top of the patch
    spot.add(patch((r + 0.045) * HERO), pebble)
    stones.add(spot)
  })

  props.add(
    belly,
    bluePillar,
    stones,
    home,
    bed,
    sprout,
    // The puppy's things.
    named('bowl', place(bowl(0.062), 0.2, -0.128, 0.74)),
    named('bone', place(bone(0.13), -0.27, -0.13, 0.83, 0.5)),
    named('ball', place(ball(0.045, CLAY.lilac), 0.36, -0.118, 0.56)),
  )
  return props
}

function yogaProps() {
  const props = new Group()

  // Yoga blocks beside the mat.
  const blocks = place(new Group(), 1.808, -0.5, 3.686, yawOf('yoga') + 0.4)
  blocks.add(place(block(0.13, CLAY.lilac), 0, 0, 0), place(block(0.13, CLAY.cream), 0.02, 0.05, 0.01, 0.5))

  props.add(blocks)
  return props
}

function paintProps() {
  const props = new Group()
  // One little heart, floating above the painter.
  props.add(named('heart', place(heart(0.1), 0.39, 0.2, 6.14, yawOf('paint'))))
  return props
}

/** Extra props per island id (see ISLANDS in ../config.ts). */
export const PLANTINGS: Record<string, (() => Group) | undefined> = {
  hero: heroProps,
  yoga: yogaProps,
  paint: paintProps,
}
