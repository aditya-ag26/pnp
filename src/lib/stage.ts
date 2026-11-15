/**
 * Shared state between the scrolling DOM and the 3D scene.
 *
 * Per-frame values live in a plain mutable object (`stage`) so that neither
 * React nor the canvas re-render when they change. The few values React does
 * care about (active section, loaded flag) go through a tiny external store.
 */
import { useSyncExternalStore } from 'react'

export const SECTION_IDS = ['hero', 'yoga', 'paint'] as const
export type SectionId = (typeof SECTION_IDS)[number]
export const SECTION_COUNT = SECTION_IDS.length

export const stage = {
  /** Raw scroll progress through the pinned stage, 0–1. */
  raw: 0,
  /** Smoothed island index, 0 (hero) → 2 (paint). Fractions are mid-transition. */
  progress: 0,
  /** Pointer position in the viewport, −1…1 on both axes. */
  pointerX: 0,
  pointerY: 0,
  /** True once a mouse / pen has actually moved over the page. */
  hasPointer: false,
  /** 0 → 1 once the model is ready and the intro has played. */
  intro: 0,
  /** 0 → 1 while an island is opened up for a closer look. */
  explore: 0,
  /** Which island is being explored. */
  exploreIndex: 0,
  /** 0 → 1 while the camera is face to face with the puppy. */
  closeup: 0,
  /** Where the puppy's face is in the world, and how tall the puppy is (set by the scene). */
  puppy: { x: 0, y: 0, z: 0, size: 1 },
  /** Bumped to ask the explored island's puppy for a hello (a head tilt). */
  puppyCue: 0,
}

/** Explore-mode orbit: targets set by input, eased values used by the scene. */
export const orbit = {
  yaw: 0,
  pitch: 0,
  zoom: 1,
  yawEased: 0,
  pitchEased: 0,
  zoomEased: 1,
}

export const ZOOM_RANGE = { min: 0.6, max: 2.4 }

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/** Fraction of each scroll segment spent resting on an island before moving on. */
const HOLD = 0.2

/**
 * Maps raw scroll (0–1) to an island index (0–2) with a rest at every island,
 * so the scene settles while the copy is readable.
 */
export function rawToProgress(raw: number): number {
  const s = clamp01(raw) * (SECTION_COUNT - 1)
  const i = Math.min(Math.floor(s), SECTION_COUNT - 2)
  const f = s - i
  return i + smootherstep(clamp01((f - HOLD) / (1 - 2 * HOLD)))
}

// ── Tiny React store ────────────────────────────────────────────────────────
interface UiState {
  activeSection: number
  loaded: boolean
  exploring: boolean
  closeup: boolean
}

let ui: UiState = { activeSection: 0, loaded: false, exploring: false, closeup: false }
const listeners = new Set<() => void>()

export function setUi(patch: Partial<UiState>) {
  const next = { ...ui, ...patch }
  if ((Object.keys(next) as (keyof UiState)[]).every((key) => next[key] === ui[key])) return
  ui = next
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const getUi = () => ui

export function useUi<T>(selector: (s: UiState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(ui))
}
