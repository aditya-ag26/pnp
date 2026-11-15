/**
 * Puppy animation.
 *
 * The puppies are single unrigged meshes, so there are no bones to move.
 * Instead a tiny addition to the material's vertex shader bends soft regions
 * of the mesh — the head, the ears, the tail — around a pivot.
 *
 * At rest a puppy only breathes and sways its head a touch, enough to feel
 * alive. A hover (or a cue from the page) plays ONE short action — a head
 * tilt, perked ears, a little hop, a tail wag — and then it settles back to
 * idle until the pointer leaves and comes back.
 *
 * Regions are fractions of the mesh's bounding box (0–1 on each axis; the
 * puppies face +z), measured from the source models.
 */
import { Euler, Mesh, MeshStandardMaterial, Quaternion, Vector2, Vector3, type Object3D } from 'three'

export type Trick = 'tilt' | 'ears' | 'hop' | 'wag'

export interface PuppyRig {
  /** Tail: pivot, and the soft box it lives in (fade-in ranges on y and z). */
  tail: { pivot: [number, number, number]; y: [number, number]; z: [number, number] }
  /** Head and floppy ears, if the pose shows them. */
  head?: { neck: [number, number, number]; band: [number, number]; earPivotY: number; earPivotZ: number }
}

/** Sitting puppy (hero + paint islands). */
export const SITTING: PuppyRig = {
  tail: { pivot: [0.5, 0.3, 0.15], y: [0.3, 0.46], z: [0.22, 0.13] },
  head: { neck: [0.5, 0.47, 0.6], band: [0.4, 0.56], earPivotY: 0.87, earPivotZ: 0.65 },
}

/** Play-bow puppy (yoga island): only its tail is free to move. */
export const BOWING: PuppyRig = {
  tail: { pivot: [0.5, 0.74, 0.1], y: [0.74, 0.86], z: [0.32, 0.2] },
}

/** How long each action lasts, in seconds. */
const DURATION: Record<Trick, number> = { tilt: 2.2, ears: 1.8, hop: 1.1, wag: 2.6 }

interface State {
  rest: { position: Vector3; quaternion: Quaternion; scale: Vector3; feet: Vector3 }
  uniforms: Record<'uTail' | 'uHead' | 'uEarL' | 'uEarR', { value: number }>
  action?: { trick: Trick; start: number; side: number }
  wasHovered: boolean
  cue: number
}

const euler = new Euler()
const twist = new Quaternion()
const scale = new Vector3()
const before = new Vector3()
const after = new Vector3()

function setup(puppy: Object3D, rig: PuppyRig, cue: number): State {
  let mesh!: Mesh
  puppy.traverse((child) => {
    if (!mesh && (child as Mesh).isMesh) mesh = child as Mesh
  })
  mesh.geometry.computeBoundingBox()
  const bounds = mesh.geometry.boundingBox!
  const min = bounds.min.clone()
  const size = bounds.getSize(new Vector3())
  const at = (f: [number, number, number]) => new Vector3(...f).multiply(size).add(min)

  const feet = at([0.5, 0, 0.5])
  if (mesh !== puppy) feet.applyMatrix4(mesh.matrix)

  const uniforms = { uTail: { value: 0 }, uHead: { value: 0 }, uEarL: { value: 0 }, uEarR: { value: 0 } }
  const material = (mesh.material as MeshStandardMaterial).clone()
  const head = rig.head
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, {
      uMin: { value: min },
      uSize: { value: size },
      uTailPivot: { value: at(rig.tail.pivot) },
      uTailY: { value: new Vector2(...rig.tail.y) },
      uTailZ: { value: new Vector2(...rig.tail.z) },
      uNeck: { value: at(head?.neck ?? [0, 0, 0]) },
      uHeadBand: { value: new Vector2(...(head?.band ?? [2, 3])) },
      uEarPivotL: { value: at([0.27, head?.earPivotY ?? 0, head?.earPivotZ ?? 0]) },
      uEarPivotR: { value: at([0.73, head?.earPivotY ?? 0, head?.earPivotZ ?? 0]) },
    })
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTail, uHead, uEarL, uEarR;
        uniform vec3 uMin, uSize, uTailPivot, uNeck, uEarPivotL, uEarPivotR;
        uniform vec2 uTailY, uTailZ, uHeadBand;
        // Rotate p around a front-to-back axis through pivot.
        vec3 bend(vec3 p, vec3 pivot, float angle) {
          vec2 d = p.xy - pivot.xy;
          float c = cos(angle), s = sin(angle);
          return vec3(pivot.xy + vec2(c * d.x - s * d.y, s * d.x + c * d.y), p.z);
        }`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec3 f = (position - uMin) / uSize;
        float tailW = smoothstep(uTailY.x, uTailY.y, f.y) * smoothstep(uTailZ.x, uTailZ.y, f.z);
        transformed = bend(transformed, uTailPivot, uTail * tailW);
        ${
          head
            ? `float earBand = smoothstep(0.46, 0.56, f.y);
        transformed = bend(transformed, uEarPivotL, uEarL * earBand * smoothstep(0.27, 0.15, f.x));
        transformed = bend(transformed, uEarPivotR, uEarR * earBand * smoothstep(0.73, 0.85, f.x));
        transformed = bend(transformed, uNeck, uHead * smoothstep(uHeadBand.x, uHeadBand.y, f.y));`
            : ''
        }`,
      )
  }
  mesh.material = material

  return {
    rest: { position: puppy.position.clone(), quaternion: puppy.quaternion.clone(), scale: puppy.scale.clone(), feet },
    uniforms,
    wasHovered: false,
    cue,
  }
}

/** Puts the puppy back in its resting pose (so it can be measured without the animation). */
export function restPuppy(puppy: Object3D) {
  const s = puppy.userData.state as State | undefined
  if (!s) return
  puppy.position.copy(s.rest.position)
  puppy.quaternion.copy(s.rest.quaternion)
  puppy.scale.copy(s.rest.scale)
}

/** Smooth 0 → 1 → 0 over the action, with a held middle. */
const envelope = (p: number, attack = 0.25) => {
  const up = Math.min(1, p / attack)
  const down = Math.min(1, (1 - p) / attack)
  const e = Math.min(up, down)
  return e * e * (3 - 2 * e)
}

export interface PuppyInput {
  /** Elapsed seconds. */
  time: number
  /** True while the pointer is over the puppy. */
  hovered: boolean
  /** Actions a hover can trigger; one is picked at random each time. */
  tricks: Trick[]
  /** Changes whenever the page asks for a head tilt (the "Meet the puppy" button). */
  cue: number
  /** Offsets the timing so the puppies never move in step. */
  phase: number
}

export function animatePuppy(puppy: Object3D, rig: PuppyRig, input: PuppyInput) {
  const s = (puppy.userData.state ??= setup(puppy, rig, input.cue)) as State
  const time = input.time + input.phase

  // One action per hover: it plays through, then waits for the pointer to leave and return.
  if (input.hovered && !s.wasHovered && !s.action && input.tricks.length) {
    const trick = input.tricks[Math.floor(Math.random() * input.tricks.length)]
    s.action = { trick, start: input.time, side: Math.random() < 0.5 ? -1 : 1 }
  }
  s.wasHovered = input.hovered

  // A cue from the page: say hello with a head tilt, once the camera has arrived.
  if (input.cue !== s.cue) {
    s.cue = input.cue
    if (rig.head) s.action = { trick: 'tilt', start: input.time + 1.2, side: 1 }
  }

  let tilt = 0
  let ears = 0
  let hop = 0
  let wag = 0
  if (s.action) {
    const p = (input.time - s.action.start) / DURATION[s.action.trick]
    if (p >= 1) s.action = undefined
    else if (p > 0) {
      const e = envelope(p)
      if (s.action.trick === 'tilt') tilt = e * 0.3 * s.action.side
      if (s.action.trick === 'ears') ears = e
      if (s.action.trick === 'hop') hop = Math.abs(Math.sin(p * Math.PI * 2)) * envelope(p, 0.15)
      if (s.action.trick === 'wag') wag = Math.sin(p * Math.PI * 2 * 3.5) * envelope(p, 0.3) * 0.26
    }
  }

  // Idle: breathing and the faintest sway of the head.
  const breathe = Math.sin(time * 1.9) * 0.01
  const sway = Math.sin(time * 0.7) * 0.022

  s.uniforms.uTail.value = wag
  s.uniforms.uHead.value = sway + tilt
  s.uniforms.uEarL.value = -ears * 0.3
  s.uniforms.uEarR.value = ears * 0.3

  // Whole body: breathing, plus squash-and-stretch on a hop, pivoting at the feet.
  const stretch = 1 + breathe + hop * 0.05
  euler.set(-hop * 0.03, 0, 0)
  twist.setFromEuler(euler)
  puppy.quaternion.copy(s.rest.quaternion).multiply(twist)
  scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch))
  puppy.scale.copy(s.rest.scale).multiply(scale)

  before.copy(s.rest.feet).multiply(s.rest.scale).applyQuaternion(s.rest.quaternion)
  after.copy(s.rest.feet).multiply(puppy.scale).applyQuaternion(puppy.quaternion)
  puppy.position.copy(s.rest.position).add(before).sub(after)
  puppy.position.y += hop * puppy.scale.y * (Math.abs(s.rest.feet.y) * 0.1 + 0.015)
}
