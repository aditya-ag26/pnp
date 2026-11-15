/**
 * Clay — the shared building blocks for the hand-built props: one palette,
 * one matte material per colour, and helpers for making soft rounded parts.
 *
 * Sizes are in island (GLB) units, where an island is roughly 2 units across.
 */
import { Mesh, MeshStandardMaterial, SphereGeometry, type BufferGeometry, type Group, type Object3D } from 'three'

export const CLAY = {
  pink: '#f3a9b4',
  rose: '#e98f9c',
  lilac: '#c9b3e6',
  butter: '#f6dc8f',
  cream: '#fbf0e2',
  sage: '#a9c7a1',
  leaf: '#8fb98d',
  mint: '#a6d6cc',
  sky: '#bdd2dc',
  ground: '#f1b6a6',
  /** Stone colours, borrowed from the paint island's pebbles. */
  stones: ['#f9ecd6', '#d8c9ea', '#f4dc9e', '#f6c8ab', '#f3c6d0'],
  kibble: '#8a6250',
}

const SPHERE = new SphereGeometry(1, 28, 20)

const materials = new Map<string, MeshStandardMaterial>()
/** One shared matte material per colour. */
export function clay(color: string) {
  let material = materials.get(color)
  if (!material) {
    material = new MeshStandardMaterial({ color, roughness: 0.74, metalness: 0 })
    materials.set(color, material)
  }
  return material
}

/** A clay mesh from any geometry, scaled per axis. */
export function part(geometry: BufferGeometry, color: string, sx: number, sy: number, sz: number) {
  const mesh = new Mesh(geometry, clay(color))
  mesh.scale.set(sx, sy, sz)
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

/** A rounded blob: a sphere stretched to the given radii. */
export const blob = (color: string, sx: number, sy = sx, sz = sx) => part(SPHERE, color, sx, sy, sz)

/** Positions an object and turns it around the vertical axis. */
export function place<T extends Object3D>(object: T, x: number, y: number, z: number, turn = 0) {
  object.position.set(x, y, z)
  object.rotation.y += turn
  return object
}

/** Marks a group so the scene sways it gently (see animate.ts). */
export function swaying(group: Group, amount = 1) {
  group.userData.sway = amount
  return group
}

/** Marks an object so the scene bobs and turns it gently (see animate.ts). */
export function floating<T extends Object3D>(object: T) {
  object.userData.float = true
  return object
}
