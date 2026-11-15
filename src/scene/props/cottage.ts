/**
 * Cottage — a hand-built clay house that replaces the AI-generated one on the
 * hero island. Built from rounded boxes so every edge is soft.
 *
 * Its origin is the centre of its footprint at ground level; the door faces +z.
 */
import { ExtrudeGeometry, Group, Mesh, MeshStandardMaterial, Shape, SphereGeometry, TorusGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const COLORS = {
  wall: '#fdf2e6',
  base: '#f5dfd0',
  roof: '#a67c67',
  trim: '#8c6452',
  door: '#7b5544',
  glass: '#f9e2a0',
  knob: '#f6dc8f',
  bloom: '#f3a9b4',
  leaf: '#a9c7a1',
}

const clay = (color: string) => new MeshStandardMaterial({ color, roughness: 0.82, metalness: 0 })

function shadowed<T extends Mesh>(mesh: T) {
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

/** Rounded box centred on its own origin. */
function box(w: number, h: number, d: number, material: MeshStandardMaterial, radius = Math.min(w, h, d) * 0.3) {
  return shadowed(new Mesh(new RoundedBoxGeometry(w, h, d, 5, radius), material))
}

export function cottage() {
  const house = new Group()
  const wall = clay(COLORS.wall)
  const roofClay = clay(COLORS.roof)
  const trim = clay(COLORS.trim)
  // Windows glow a little, as if someone is home.
  const glass = clay(COLORS.glass)
  glass.emissive.set(COLORS.glass)
  glass.emissiveIntensity = 0.28

  const W = 0.6 // width (x)
  const D = 0.44 // depth (z)
  const H = 0.33 // wall height
  const FLOOR = 0.035

  // Foundation and walls.
  const base = box(W + 0.12, 0.07, D + 0.12, clay(COLORS.base), 0.03)
  base.position.y = 0
  const walls = box(W, H, D, wall, 0.045)
  walls.position.y = FLOOR + H / 2
  house.add(base, walls)

  // Gable roof: a soft triangular prism with a generous overhang.
  const profile = new Shape()
  const half = D / 2 + 0.06
  const rise = 0.24
  profile.moveTo(-half, 0)
  profile.lineTo(half, 0)
  profile.lineTo(0, rise)
  profile.closePath()
  const roofGeometry = new ExtrudeGeometry(profile, {
    depth: W + 0.08,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    bevelSegments: 8,
  })
  roofGeometry.center()
  const roof = shadowed(new Mesh(roofGeometry, roofClay))
  roof.rotation.y = Math.PI / 2
  roof.position.y = FLOOR + H + rise / 2 - 0.012
  house.add(roof)

  // Ridge cap and eave trims give the roof some definition.
  const ridge = box(W + 0.17, 0.045, 0.06, trim, 0.02)
  ridge.position.y = FLOOR + H + rise + 0.012
  house.add(ridge)
  for (const side of [-1, 1]) {
    const eave = box(W + 0.165, 0.04, 0.05, trim, 0.018)
    eave.position.set(0, FLOOR + H - 0.004, side * (half + 0.012))
    house.add(eave)
  }

  // Chimney.
  const chimney = box(0.075, 0.15, 0.075, wall, 0.018)
  chimney.position.set(-0.19, FLOOR + H + 0.15, 0.1)
  const cap = box(0.1, 0.035, 0.1, trim, 0.014)
  cap.position.set(-0.19, FLOOR + H + 0.235, 0.1)
  house.add(chimney, cap)

  // Arched front door.
  const doorShape = new Shape()
  const dw = 0.058
  const dh = 0.105
  doorShape.moveTo(-dw, 0)
  doorShape.lineTo(dw, 0)
  doorShape.lineTo(dw, dh)
  doorShape.absarc(0, dh, dw, 0, Math.PI, false)
  doorShape.lineTo(-dw, 0)
  const doorGeometry = new ExtrudeGeometry(doorShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.008,
    bevelSegments: 4,
    curveSegments: 18,
  })
  const door = shadowed(new Mesh(doorGeometry, clay(COLORS.door)))
  door.position.set(0.14, FLOOR + 0.004, D / 2)
  const knob = shadowed(new Mesh(new SphereGeometry(0.011, 16, 12), clay(COLORS.knob)))
  knob.position.set(0.172, FLOOR + 0.085, D / 2 + 0.026)
  house.add(door, knob)

  // Front step and porch.
  const porch = box(0.34, 0.05, 0.24, clay(COLORS.base), 0.022)
  porch.position.set(0.14, -0.006, D / 2 + 0.13)
  const step = box(0.19, 0.04, 0.09, wall, 0.016)
  step.position.set(0.14, FLOOR + 0.002, D / 2 + 0.05)
  house.add(porch, step)

  // Front window with a flower box.
  const front = new Group()
  front.position.set(-0.14, FLOOR + 0.165, D / 2)
  const pane = box(0.15, 0.125, 0.03, glass, 0.012)
  const barV = box(0.013, 0.125, 0.04, wall, 0.005)
  const barH = box(0.15, 0.013, 0.04, wall, 0.005)
  const frameTop = box(0.175, 0.018, 0.045, trim, 0.007)
  frameTop.position.y = 0.068
  const planter = box(0.18, 0.04, 0.06, trim, 0.014)
  planter.position.set(0, -0.085, 0.022)
  front.add(pane, barV, barH, frameTop, planter)
  const blooms = [COLORS.bloom, COLORS.glass, COLORS.bloom]
  blooms.forEach((color, i) => {
    const bloom = shadowed(new Mesh(new SphereGeometry(0.022, 16, 12), clay(color)))
    bloom.position.set((i - 1) * 0.052, -0.055 + (i % 2) * 0.008, 0.03)
    const leaf = shadowed(new Mesh(new SphereGeometry(0.016, 12, 10), clay(COLORS.leaf)))
    leaf.position.set((i - 1) * 0.052 + 0.024, -0.066, 0.034)
    front.add(bloom, leaf)
  })
  house.add(front)

  // Round windows on the side walls, so the house reads from every angle.
  for (const side of [-1, 1]) {
    const round = new Group()
    round.position.set((side * W) / 2, FLOOR + 0.17, 0)
    round.rotation.y = (side * Math.PI) / 2
    const disc = shadowed(new Mesh(new SphereGeometry(0.052, 24, 16), glass))
    disc.scale.z = 0.22
    const ring = shadowed(new Mesh(new TorusGeometry(0.055, 0.012, 10, 28), trim))
    round.add(disc, ring)
    house.add(round)
  }

  // A round attic window under the gable is too fussy; a little heart is enough.
  return house
}
