/**
 * Mesh surgery: removes triangles from a primitive by region.
 * Regions are described in settings.mjs (CUTS, SLICE_BELOW).
 */

/** Cylinder cuts leave a small lip above their measured ground. */
const GROUND_MARGIN = 0.014
/** Cuts only apply to the top side of an island, never its underside. */
const UNDERSIDE = -0.3

function setTriangles(doc, prim, indices) {
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)))
}

/** Removes everything standing inside the given regions. */
export function cutDetails(doc, prim, cuts, label) {
  const pos = prim.getAttribute('POSITION').getArray()
  const index = prim.getIndices().getArray()

  // Which region (if any) each vertex belongs to, and the heights seen in each region.
  const which = new Int8Array(pos.length / 3).fill(-1)
  const heights = cuts.map(() => [])
  for (let v = 0; v < which.length; v++) {
    const x = pos[v * 3]
    const y = pos[v * 3 + 1]
    const z = pos[v * 3 + 2]
    if (y < UNDERSIDE) continue

    for (let c = 0; c < cuts.length; c++) {
      const cut = cuts[c]
      const hit = cut.r
        ? Math.hypot(x - cut.x, z - cut.z) < cut.r
        : x > cut.min[0] && x < cut.max[0] && z > cut.min[1] && z < cut.max[1]
      if (!hit) continue

      heights[c].push(y)
      // A vertex inside several regions belongs to the first one that would cut it.
      const current = which[v] < 0 ? undefined : cuts[which[v]]
      const cutsHere = cut.above !== undefined && y > cut.above
      const currentSpares = current?.above !== undefined && y <= current.above
      if (!current || (cutsHere && currentSpares)) which[v] = c
    }
  }

  // Cut level per region: given for rectangles, measured (a low percentile) for cylinders.
  const level = heights.map((h, c) => {
    if (cuts[c].above !== undefined) return cuts[c].above
    const ground = h.sort((a, b) => a - b)[Math.floor(h.length * 0.2)] ?? 0
    return ground + GROUND_MARGIN
  })

  const kept = []
  let removed = 0
  for (let t = 0; t < index.length; t += 3) {
    let above = 0
    for (let j = 0; j < 3; j++) {
      const v = index[t + j]
      if (which[v] >= 0 && pos[v * 3 + 1] > level[which[v]]) above++
    }
    if (above === 3) removed++
    else kept.push(index[t], index[t + 1], index[t + 2])
  }

  setTriangles(doc, prim, kept)
  console.log(`  cut ${removed} triangles from ${label}`)
}

/** Inverse of a 4x4 matrix (column-major, as glTF stores them). */
function invert(m) {
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10
  const b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12
  const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30
  const b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32
  const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06)
  return [
    (a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det,
    (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
    (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det,
    (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
    (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det,
    (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
    (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det,
    (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det,
  ]
}

const transform = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
]

/**
 * Presses flat every bump of `node`'s mesh that lies underneath one of the
 * `covers` (other nodes sitting on it), so nothing pokes up through them.
 */
export function flattenUnder(prim, node, covers) {
  const position = prim.getAttribute('POSITION')
  const pos = position.getArray()
  const toWorld = node.getWorldMatrix()

  for (const cover of covers) {
    const fromWorld = invert(cover.getWorldMatrix())
    const bounds = cover.getMesh().listPrimitives()[0].getAttribute('POSITION')
    const min = bounds.getMin([])
    const max = bounds.getMax([])

    // Vertices of the top surface that fall inside the cover's footprint.
    const under = []
    for (let v = 0; v < pos.length; v += 3) {
      if (pos[v + 1] < UNDERSIDE) continue
      const [x, , z] = transform(fromWorld, ...transform(toWorld, pos[v], pos[v + 1], pos[v + 2]))
      if (x > min[0] && x < max[0] && z > min[2] && z < max[2]) under.push(v)
    }
    // Ground there = a low percentile of their heights; everything higher is pressed down to it.
    const ground = under.map((v) => pos[v + 1]).sort((a, b) => a - b)[Math.floor(under.length * 0.2)] ?? 0
    let moved = 0
    for (const v of under) {
      if (pos[v + 1] > ground) {
        pos[v + 1] = ground
        moved++
      }
    }
    console.log(`  flattened ${moved} vertices of ${node.getName()} under ${cover.getName()}`)
  }
  position.setArray(pos)
}

/** Removes everything below a height. */
export function sliceBelow(doc, prim, level, label) {
  const pos = prim.getAttribute('POSITION').getArray()
  const index = prim.getIndices().getArray()
  const kept = []
  for (let t = 0; t < index.length; t += 3) {
    const below = [0, 1, 2].every((j) => pos[index[t + j] * 3 + 1] < level)
    if (!below) kept.push(index[t], index[t + 1], index[t + 2])
  }
  console.log(`  sliced ${(index.length - kept.length) / 3} triangles off the underside of ${label}`)
  setTriangles(doc, prim, kept)
}
