/**
 * Explore mode — opens the current island up at the centre of the screen so
 * it can be spun and zoomed. Page scrolling is frozen while it is open.
 */
import { gsap } from 'gsap'
import { lockScroll } from './scroll'
import { getUi, orbit, setUi, stage, ZOOM_RANGE } from './stage'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * The angle the island opens at in explore mode (and returns to on reset):
 * turned a little to show the side of the cottage, seen from lower down.
 */
const EXPLORE_START = { yaw: 0.58, pitch: -0.2, zoom: 1 }

export function enterExplore() {
  if (getUi().exploring) return
  stage.exploreIndex = Math.round(stage.progress)
  resetOrbit(EXPLORE_START)
  setUi({ exploring: true })
  lockScroll(true)
  gsap.to(stage, { explore: 1, duration: 1.3, ease: 'power3.inOut', overwrite: 'auto' })
}

export function exitExplore() {
  if (!getUi().exploring) return
  setUi({ exploring: false, closeup: false })
  gsap.to(stage, { closeup: 0, duration: 1, ease: 'power3.inOut', overwrite: 'auto' })
  resetOrbit()
  gsap.to(stage, {
    explore: 0,
    duration: 1.2,
    ease: 'power3.inOut',
    overwrite: 'auto',
    onComplete: () => lockScroll(false),
  })
}

/** Leaves explore mode immediately (used when the stage unmounts). */
export function cancelExplore() {
  gsap.killTweensOf(stage, 'explore,closeup')
  stage.explore = 0
  stage.closeup = 0
  resetOrbit()
  orbit.yawEased = orbit.pitchEased = 0
  orbit.zoomEased = 1
  setUi({ exploring: false, closeup: false })
  lockScroll(false)
}

/** How far to turn the hero island so its puppy looks straight at the camera. */
const PUPPY_FACING = { yaw: 0.42, pitch: -0.22 }

/** Brings the camera face to face with the puppy, or back out to the island. */
export function toggleCloseup() {
  const closeup = !getUi().closeup
  setUi({ closeup })
  resetOrbit(EXPLORE_START)
  if (closeup) {
    orbit.yaw = PUPPY_FACING.yaw
    orbit.pitch = PUPPY_FACING.pitch
    stage.puppyCue++ // the puppy tilts its head to say hello
  }
  gsap.to(stage, { closeup: closeup ? 1 : 0, duration: 1.5, ease: 'power3.inOut', overwrite: 'auto' })
}

/** Reset button: back to the whole island at its starting angle. */
export function resetView() {
  if (getUi().closeup) toggleCloseup()
  else resetOrbit(EXPLORE_START)
}

/** Sends the island to a given angle (default: its resting one) by the shortest way round. */
export function resetOrbit(pose = { yaw: 0, pitch: 0, zoom: 1 }) {
  const turns = Math.round(orbit.yawEased / (Math.PI * 2)) * Math.PI * 2
  orbit.yawEased -= turns
  orbit.yaw = pose.yaw
  orbit.pitch = pose.pitch
  orbit.zoom = pose.zoom
}

export function rotateBy(dx: number, dy: number) {
  orbit.yaw += dx * 0.008
  orbit.pitch = clamp(orbit.pitch + dy * 0.005, -0.3, 0.75)
}

export function zoomBy(factor: number) {
  orbit.zoom = clamp(orbit.zoom * factor, ZOOM_RANGE.min, ZOOM_RANGE.max)
}
