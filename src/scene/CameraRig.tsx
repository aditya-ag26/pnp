/**
 * CameraRig — the one and only camera.
 *
 * It never travels between islands (the islands come to it). It only adds
 * life: a gentle pull-back while islands swap, a slow breath, a little
 * pointer parallax — and, in explore mode, the zoom and the face-to-face
 * close-up with the puppy.
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { orbit, stage } from '@/lib/stage'
import { CAMERA } from './config'

const { lerp } = MathUtils
const target = new Vector3()

export default function CameraRig() {
  const eased = useRef({ x: 0, y: 0 })

  useFrame(({ camera, clock }, delta) => {
    const k = 1 - Math.exp(-delta * 2.5)
    eased.current.x += (stage.pointerX - eased.current.x) * k
    eased.current.y += (stage.pointerY - eased.current.y) * k

    // 0 at rest on an island, 1 halfway between two.
    const between = Math.sin(Math.PI * (stage.progress % 1))
    const t = clock.elapsedTime
    const parallax = 1 - stage.explore
    const breath = Math.sin(t * 0.5) * 0.02

    // The usual view of the stage.
    const x = eased.current.x * 0.28 * parallax
    const y = (eased.current.y * 0.16 + between * 0.25) * parallax + breath
    const z = lerp(CAMERA.distance + between * 0.7, CAMERA.distance / orbit.zoomEased, stage.explore)

    // Face to face: just in front of the puppy, at eye level.
    const c = stage.closeup
    const p = stage.puppy
    const distance = (p.size * 2.5) / orbit.zoomEased

    camera.position.set(lerp(x, p.x, c), lerp(y, p.y + p.size * 0.12 + breath * 0.3, c), lerp(z, p.z + distance, c))
    target.set(p.x, p.y, p.z).multiplyScalar(c)
    camera.lookAt(target)
  })

  return null
}
