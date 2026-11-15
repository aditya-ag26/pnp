/**
 * Loads the GLB once and splits its flat node list into islands + clouds.
 *
 * Every island is re-centred on its own origin and normalised to a radius of 1,
 * so the scene can place, scale and spin each one without knowing anything
 * about where it happened to sit in the Blender file.
 */
import { useGLTF } from '@react-three/drei'
import { Box3, Group, Mesh, Vector3, type MeshStandardMaterial, type Object3D } from 'three'
import { CLOUD_BEDS, CLOUD_PREFIX, ISLANDS, MODEL_URL } from './config'
import { isAnimated } from './props/animate'
import { PLANTINGS } from './props/plantings'

export interface IslandModel {
  islands: Group[]
  clouds: Group[]
  /** Hand-built props that move: flowers sway, the heart floats (see props/animate.ts). */
  animatedProps: Object3D[]
}

const cache = new WeakMap<Object3D, IslandModel>()

type Kind = 'island' | 'cloud'

function prepareMesh(obj: Object3D, kind: Kind) {
  obj.traverse((child) => {
    const mesh = child as Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = mesh.receiveShadow = kind === 'island'

    // The hero island's baked gloss reads as wet and glassy; give it a soft matte clay finish.
    if (kind === 'island' && obj.name.toLowerCase().startsWith('hero')) {
      const material = (mesh.material as MeshStandardMaterial).clone()
      material.roughnessMap = null
      material.metalnessMap = null
      material.roughness = 1
      material.metalness = 0
      material.normalScale.setScalar(0.18)
      mesh.material = material
    }

    if (kind === 'cloud') {
      // Lift the peach cloud texture towards a soft cream so clouds stay airy.
      const material = (mesh.material as MeshStandardMaterial).clone()
      material.color.setScalar(0.5)
      material.emissive.set('#fff0e4')
      material.emissiveIntensity = 0.6
      material.normalMap = null
      mesh.material = material
    }
  })
}

/** Wraps nodes in a group whose origin is their centre and whose radius is 1. */
function normalise(nodes: Object3D[], kind: Kind): Group {
  const holder = new Group()
  nodes.forEach((n) => {
    prepareMesh(n, kind)
    holder.add(n)
  })
  holder.updateMatrixWorld(true)

  const box = new Box3().setFromObject(holder)
  const centre = box.getCenter(new Vector3())
  const size = box.getSize(new Vector3())
  const radius = Math.max(size.x, size.y, size.z) / 2 || 1

  holder.position.copy(centre).multiplyScalar(-1 / radius)
  holder.scale.setScalar(1 / radius)

  const group = new Group()
  group.add(holder)
  return group
}

function build(scene: Object3D): IslandModel {
  const nodes = [...scene.children]
  const named = (prefixes: string[]) =>
    nodes.filter((n) => prefixes.some((p) => n.name.toLowerCase().startsWith(p)))

  const clouds = named([CLOUD_PREFIX]).map((node) => {
    const group = normalise([node], 'cloud')
    group.name = node.name
    return group
  })

  const animatedProps: Object3D[] = []
  const islands = ISLANDS.map((cfg) => {
    const group = normalise(named(cfg.prefixes), 'island')
    group.name = `${cfg.id}-island`

    // Hand-built props live in the same space as the island's own meshes.
    const props = PLANTINGS[cfg.id]?.()
    if (props) {
      group.children[0].add(props)
      props.traverse((child) => {
        if (isAnimated(child)) animatedProps.push(child)
      })
    }

    // A bed of clouds beneath the island.
    for (const [source, x, y, z, size] of CLOUD_BEDS[cfg.id] ?? []) {
      const cloud = clouds[source % clouds.length].clone()
      cloud.position.set(x, y, z)
      cloud.scale.setScalar(size)
      cloud.rotation.y = -cfg.yaw
      group.children[0].add(cloud)
    }
    return group
  })

  return { islands, clouds, animatedProps }
}

export function useIslandModel(): IslandModel {
  const { scene } = useGLTF(MODEL_URL)
  let model = cache.get(scene)
  if (!model) {
    model = build(scene)
    cache.set(scene, model)
  }
  return model
}

useGLTF.preload(MODEL_URL)
