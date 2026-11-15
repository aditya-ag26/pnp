/**
 * Converts the canvas size into world-space layout numbers at the stage
 * plane (z = 0), so composition stays the same on every screen.
 */
import { MathUtils } from 'three'
import { CAMERA, LAYOUT, MOTION } from './config'

export interface StageLayout {
  /** Visible world width / height at z = 0. */
  vw: number
  vh: number
  /** Resting position of the active island. */
  focusX: number
  focusY: number
  /** Radius of the active island. */
  slot: number
  /** Radius of an island opened up in explore mode (it sits at the centre). */
  exploreSlot: number
  /** Radius of the wheel the islands travel on (its hub sits off-screen right). */
  wheel: number
}

const layout: StageLayout = { vw: 1, vh: 1, focusX: 0, focusY: 0, slot: 1, exploreSlot: 1, wheel: 1 }
let key = ''

export function getLayout(width: number, height: number): StageLayout {
  const k = `${width}x${height}`
  if (k === key) return layout
  key = k

  const aspect = width / height
  const vh = 2 * CAMERA.distance * Math.tan(MathUtils.degToRad(CAMERA.fov / 2))
  const vw = vh * aspect
  const l = aspect < 0.95 ? LAYOUT.portrait : LAYOUT.desktop

  layout.vw = vw
  layout.vh = vh
  layout.focusX = vw * l.x
  layout.focusY = vh * l.y
  layout.slot = Math.min(vw * l.width, vh * l.height) / 2
  layout.exploreSlot = Math.min(vw * LAYOUT.explore.width, vh * LAYOUT.explore.height) / 2
  // Big enough that an island one full section away (shrunk by then) is off-screen.
  layout.wheel = (vh / 2 + Math.abs(layout.focusY) + layout.slot * 0.62) / Math.sin(MOTION.wheelStep)
  return layout
}
