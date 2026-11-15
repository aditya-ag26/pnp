/**
 * Flowers and ground cover — clean clay plants that replace the weakest
 * details of the AI-generated meshes. Each flower sways gently in the scene.
 */
import { CylinderGeometry, Group } from 'three'
import { blob, CLAY, part, swaying } from './clay'

const STEM = new CylinderGeometry(0.82, 1, 1, 14)

/** A stem rising from the origin with a gentle lean. */
function stem(height: number, radius: number, color = CLAY.leaf) {
  const mesh = part(STEM, color, radius, height, radius)
  mesh.position.y = height / 2
  return mesh
}

/** A leaf growing out of the origin; `angle` turns it around the stem. */
function leaf(length: number, angle: number, lift = 0.75, color = CLAY.sage) {
  const pivot = new Group()
  const mesh = blob(color, length * 0.3, length * 0.085, length * 0.5)
  mesh.position.z = length * 0.5
  pivot.add(mesh)
  pivot.rotation.set(-lift, angle, 0, 'YXZ')
  return pivot
}

export interface FlowerOptions {
  height: number
  size: number
  color: string
  centre?: string
  /** Lean of the whole flower, radians (x: towards the viewer, z: sideways). */
  lean?: [number, number]
}

/** Open flower: a ring of plump petals around a round centre. */
export function daisy({ height, size, color, centre = CLAY.butter, lean = [0, 0] }: FlowerOptions) {
  const flower = swaying(new Group())
  flower.add(stem(height, size * 0.085))
  flower.add(leaf(size * 0.95, 0.9), leaf(size * 0.8, -2.2, 0.6))

  const head = new Group()
  head.position.y = height
  head.rotation.x = 1.08 // face the viewer, tipped slightly up
  const petals = 6
  for (let i = 0; i < petals; i++) {
    const ring = new Group()
    ring.rotation.y = (i / petals) * Math.PI * 2
    const petal = blob(color, size * 0.3, size * 0.12, size * 0.21)
    petal.position.set(size * 0.36, size * 0.02, 0)
    petal.rotation.z = 0.28
    ring.add(petal)
    head.add(ring)
  }
  const middle = blob(centre, size * 0.22, size * 0.17, size * 0.22)
  middle.position.y = size * 0.06
  head.add(middle)
  flower.add(head)

  flower.rotation.set(lean[0], 0, lean[1])
  return flower
}

/** Closed flower: three overlapping petals forming a soft cup. */
export function tulip({ height, size, color, lean = [0, 0] }: FlowerOptions) {
  const flower = swaying(new Group())
  flower.add(stem(height, size * 0.09))
  flower.add(leaf(size * 1.5, 0.4, 1.25), leaf(size * 1.25, 2.9, 1.2))

  const bud = new Group()
  bud.position.y = height
  for (let i = 0; i < 3; i++) {
    const ring = new Group()
    ring.rotation.y = (i / 3) * Math.PI * 2 + 0.5
    const petal = blob(color, size * 0.3, size * 0.5, size * 0.24)
    petal.position.set(size * 0.14, size * 0.3, 0)
    petal.rotation.z = -0.2
    ring.add(petal)
    bud.add(ring)
  }
  flower.add(bud)

  flower.rotation.set(lean[0], 0, lean[1])
  return flower
}

/** Round bud on a stem — echoes the island's egg-shaped tree. */
export function pompom({ height, size, color, lean = [0, 0] }: FlowerOptions) {
  const flower = swaying(new Group(), 0.8)
  flower.add(stem(height, size * 0.1))
  flower.add(leaf(size * 1.1, -0.6, 0.9))
  const ball = blob(color, size * 0.42, size * 0.46, size * 0.42)
  ball.position.y = height + size * 0.25
  flower.add(ball)
  flower.rotation.set(lean[0], 0, lean[1])
  return flower
}

/** Low cushion of leaves. */
export function tuft(size: number, color = CLAY.sage) {
  const group = new Group()
  for (let i = 0; i < 4; i++) group.add(leaf(size * (0.85 + (i % 2) * 0.25), i * 1.6 + 0.3, 0.55 + (i % 2) * 0.3, color))
  return group
}

/** Soft mound that seats a planting on the ground (and hides the cut beneath). */
export function mound(radius: number, color = CLAY.ground) {
  const mesh = blob(color, radius, radius * 0.3, radius * 0.92)
  mesh.castShadow = false
  return mesh
}

/** A nearly flat patch of ground, used to close a hole left by a cut. */
export function patch(radius: number, color = CLAY.ground) {
  const mesh = blob(color, radius, radius * 0.16, radius)
  mesh.castShadow = false
  return mesh
}

/**
 * A stone resting on the ground: a smooth rounded lump, a little flattened,
 * like the ones on the paint island. `radius` is its footprint; `turn` and
 * `squash` vary the shape from stone to stone.
 */
export function stone(radius: number, color: string, turn = 0, squash = 0.6) {
  const mesh = blob(color, radius, radius * squash, radius * 0.86)
  mesh.position.y = radius * squash * 0.55
  mesh.rotation.y = turn
  return mesh
}

/** A small rounded pebble, like the ones already dotted over the islands. */
export function pebble(radius: number, color: string) {
  const mesh = blob(color, radius, radius * 0.62, radius * 0.9)
  mesh.position.y = radius * 0.2
  return mesh
}
