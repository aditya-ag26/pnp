/**
 * Scene tuning — everything you'd want to tweak about the 3D world lives here.
 */

import type { Trick } from './puppy/animatePuppy'

export const MODEL_URL = '/models/islands.glb'

export const CAMERA = {
  fov: 30,
  /** Distance from the stage plane (z = 0) where the active island rests. */
  distance: 10,
}

export interface IslandConfig {
  id: string
  /** Nodes in the GLB whose name starts with one of these belong to the island. */
  prefixes: string[]
  /** Rotation (radians) around Y that shows the island's best side at rest. */
  yaw: number
  /** Relative size, 1 = fills the island slot. */
  scale: number
  /** Vertical nudge, in fractions of the island slot. */
  lift: number
  /**
   * The island's puppy: its node name in the GLB, which pose it is in, and the
   * actions a hover can trigger ('tilt' | 'ears' | 'hop' | 'wag'; one plays per hover).
   */
  puppy?: { node: string; pose: 'sitting' | 'bowing'; tricks: Trick[] }
}

/** Order matches the page: hero → yoga → paint. */
export const ISLANDS: IslandConfig[] = [
  { id: 'hero', prefixes: ['hero'], yaw: 0.12, scale: 0.95, lift: 0.19, puppy: { node: 'hero_pup', pose: 'sitting', tricks: [] } },
  { id: 'yoga', prefixes: ['yoga', 'lamp'], yaw: 1.3, scale: 1.3, lift: 0, puppy: { node: 'yoga_puppy', pose: 'bowing', tricks: ['wag'] } },
  { id: 'paint', prefixes: ['paint'], yaw: 1.85, scale: 1.3, lift: 0, puppy: { node: 'paint_pup', pose: 'sitting', tricks: ['ears', 'hop'] } },
]

export const CLOUD_PREFIX = 'cloud'

/**
 * Clouds tucked under an island so it rests on them: [cloud index, x, y, z, size]
 * in island (GLB world) units.
 */
export const CLOUD_BEDS: Record<string, [number, number, number, number, number][]> = {
  hero: [
    [0, -0.52, -0.5, 0.42, 0.5],
    [2, 0.5, -0.56, 0.5, 0.56],
    [1, 0.02, -0.66, 0.78, 0.4],
    [2, -0.78, -0.6, -0.25, 0.38],
    [0, 0.82, -0.62, -0.2, 0.4],
  ],
}

export const MOTION = {
  /** Forward tilt of every island so we look slightly down onto it. */
  tilt: 0.34,
  /** How far (radians) an island turns while travelling between slots. */
  travelSpin: 1.9,
  /** Angle (radians) an island sweeps along the wheel per section. */
  wheelStep: 1.2,
  /** How far back a non-active island sits, in world units. */
  travelDepth: 3,
  /** Idle float. */
  floatHeight: 0.07,
  floatSpeed: 0.55,
  /** Pointer parallax. */
  pointerYaw: 0.14,
  pointerPitch: 0.05,
}

/** Where the active island rests, as fractions of the visible width / height. */
export const LAYOUT = {
  desktop: { x: 0.175, y: -0.03, width: 0.6, height: 0.94 },
  /** Portrait screens: island on top, copy underneath. */
  portrait: { x: 0, y: 0.17, width: 0.98, height: 0.5 },
  /** Explore mode: the island takes centre stage. */
  explore: { width: 0.9, height: 0.9 },
}
