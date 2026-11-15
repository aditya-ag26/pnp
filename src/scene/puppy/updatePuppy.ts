/**
 * Per-frame puppy bookkeeping for one island: measures where the puppy is
 * (for the face-to-face camera), works out whether the pointer is over it,
 * then runs its animation.
 */
import { Box3, Vector3, type Camera, type Object3D } from 'three'
import { stage } from '@/lib/stage'
import type { IslandConfig } from '../config'
import { animatePuppy, BOWING, restPuppy, SITTING } from './animatePuppy'

const box = new Box3()
const centre = new Vector3()
const size = new Vector3()
const top = new Vector3()

export interface PuppyFrame {
  /** Index of the island the puppy lives on. */
  index: number
  /** The island's outer group (its world matrix places the puppy). */
  island: Object3D
  camera: Camera
  /** Canvas width / height. */
  aspect: number
  /** Elapsed seconds. */
  time: number
  /** True while this island is opened up in explore mode. */
  exploring: boolean
  /** True while this island is the one on show (not mid-transition). */
  inFocus: boolean
}

export function updatePuppy(puppy: Object3D, config: NonNullable<IslandConfig['puppy']>, frame: PuppyFrame) {
  // Measure the puppy in its resting pose, so the camera and hover area stay steady…
  restPuppy(puppy)
  frame.island.updateWorldMatrix(false, true)
  box.setFromObject(puppy)
  box.getCenter(centre)
  box.getSize(size)

  if (frame.exploring) {
    stage.puppy.x = centre.x
    stage.puppy.y = centre.y + size.y * 0.16
    stage.puppy.z = centre.z
    stage.puppy.size = size.y
  }

  // Is the pointer over the puppy? Compare in screen space.
  let hovered = false
  if (stage.hasPointer && frame.inFocus) {
    top.copy(centre).setY(centre.y + size.y / 2).project(frame.camera)
    centre.project(frame.camera)
    const reach = Math.abs(top.y - centre.y) * 1.25
    const dx = (stage.pointerX - centre.x) * frame.aspect
    const dy = stage.pointerY - centre.y
    hovered = Math.hypot(dx, dy) < reach
  }

  // …then bring it to life.
  animatePuppy(puppy, config.pose === 'sitting' ? SITTING : BOWING, {
    time: frame.time,
    hovered,
    tricks: config.tricks,
    cue: frame.index === stage.exploreIndex ? stage.puppyCue : 0,
    phase: frame.index * 2.4,
  })
}
