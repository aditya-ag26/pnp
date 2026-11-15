/**
 * Objects — the hand-built clay things that are not plants: the puppy's toys,
 * yoga blocks, the floating heart, and the simple shapes that patch the hero
 * island where parts of the original mesh were cut away.
 */
import { CapsuleGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, Shape, TorusGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { blob, CLAY, clay, floating, part } from './clay'

let heartGeometry: ExtrudeGeometry | undefined
/** A puffy little heart that hovers and turns. `size` is its width. */
export function heart(size: number, color = CLAY.rose) {
  if (!heartGeometry) {
    const shape = new Shape()
    shape.moveTo(0, -0.42)
    shape.bezierCurveTo(-0.62, 0.02, -0.5, 0.52, -0.22, 0.52)
    shape.bezierCurveTo(-0.08, 0.52, 0, 0.42, 0, 0.3)
    shape.bezierCurveTo(0, 0.42, 0.08, 0.52, 0.22, 0.52)
    shape.bezierCurveTo(0.5, 0.52, 0.62, 0.02, 0, -0.42)
    heartGeometry = new ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSize: 0.14,
      bevelThickness: 0.14,
      bevelSegments: 8,
      curveSegments: 20,
    })
    heartGeometry.center()
  }
  const mesh = part(heartGeometry, color, size, size, size)
  mesh.receiveShadow = false
  const holder = floating(new Group())
  holder.add(mesh)
  return holder
}

/**
 * Plain rounded base that closes the bottom of an island disc, matching the
 * simple flat undersides of the yoga and paint islands.
 */
export function baseDisc(radius: number, thickness: number, color = CLAY.ground) {
  const mesh = part(new CylinderGeometry(1, 0.965, 1, 72), color, radius, thickness, radius)
  mesh.position.y = -thickness / 2
  mesh.castShadow = false
  const holder = new Group()
  holder.add(mesh)
  return holder
}

/** A tall rounded pillar standing on the ground, like the islands' own backdrop pillars. */
export function pillar(width: number, height: number, depth: number, color: string) {
  const radius = Math.min(width, depth) * 0.42
  const mesh = new Mesh(new RoundedBoxGeometry(width, height, depth, 8, radius), clay(color))
  mesh.castShadow = mesh.receiveShadow = true
  mesh.position.y = height / 2
  const holder = new Group()
  holder.add(mesh)
  return holder
}

/** A foam yoga block. */
export function block(size: number, color = CLAY.lilac) {
  const mesh = part(new RoundedBoxGeometry(1, 1, 1, 4, 0.16), color, size, size * 0.38, size * 0.62)
  mesh.position.y = size * 0.19
  const holder = new Group()
  holder.add(mesh)
  return holder
}

/** A food bowl with a little heap of kibble. */
export function bowl(radius: number, color = CLAY.mint) {
  const group = new Group()
  const dish = part(new CylinderGeometry(1, 0.78, 1, 28), color, radius, radius * 0.62, radius)
  dish.position.y = radius * 0.31
  const rim = part(new TorusGeometry(1, 0.13, 12, 32), color, radius, radius, radius)
  rim.rotation.x = Math.PI / 2
  rim.position.y = radius * 0.62
  const food = blob(CLAY.kibble, radius * 0.82, radius * 0.3, radius * 0.82)
  food.position.y = radius * 0.6
  group.add(dish, rim, food)
  return group
}

/** A chew bone lying on the ground. */
export function bone(length: number, color = CLAY.cream) {
  const group = new Group()
  const r = length * 0.11
  const bar = part(new CapsuleGeometry(1, 1, 6, 14), color, r, length * 0.24, r)
  bar.rotation.z = Math.PI / 2
  group.add(bar)
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const knob = blob(color, r * 1.45)
      knob.position.set(x * length * 0.42, 0, z * r * 0.95)
      group.add(knob)
    }
  }
  group.position.y = r * 1.2
  const holder = new Group()
  holder.add(group)
  return holder
}

/** A play ball with a stripe. */
export function ball(radius: number, color = CLAY.mint, stripe = CLAY.cream) {
  const group = new Group()
  const body = blob(color, radius)
  const band = part(new TorusGeometry(1, 0.16, 12, 36), stripe, radius * 0.93, radius * 0.93, radius * 0.93)
  band.rotation.set(1.1, 0, 0.5)
  group.add(body, band)
  group.position.y = radius
  const holder = new Group()
  holder.add(group)
  return holder
}
