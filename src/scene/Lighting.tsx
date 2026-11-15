/**
 * Lighting — soft, warm, clay-like.
 *
 * A procedural studio environment (no HDR download) gives the gentle wrapped
 * light; one shadow-casting key light adds shape.
 */
import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { MathUtils, type DirectionalLight } from 'three'
import { stage } from '@/lib/stage'
import { getLayout } from './layout'

export default function Lighting() {
  const key = useRef<DirectionalLight>(null)
  const size = useThree((s) => s.size)

  // Size the shadow frustum to cover an island both at rest and opened up.
  useLayoutEffect(() => {
    const light = key.current
    if (!light) return
    const l = getLayout(size.width, size.height)
    const reach = Math.max(l.slot, l.exploreSlot) * 1.9
    const cam = light.shadow.camera
    cam.left = cam.bottom = -reach
    cam.right = cam.top = reach
    cam.near = 1
    cam.far = 30
    cam.updateProjectionMatrix()
  }, [size])

  // Keep the key light aimed at the island, wherever it currently rests.
  useFrame(() => {
    const light = key.current
    if (!light) return
    const l = getLayout(size.width, size.height)
    const x = MathUtils.lerp(l.focusX, 0, stage.explore)
    const y = MathUtils.lerp(l.focusY, 0, stage.explore)
    light.position.set(x - 4.5, y + 9, 6)
    light.target.position.set(x, y, 0)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <ambientLight intensity={0.22} color="#ffeede" />
      <directionalLight
        ref={key}
        intensity={2.9}
        color="#ffedd8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
      />
      {/* Cool lilac fill from the right and a soft rim from behind give the clay depth. */}
      <directionalLight position={[7, 3, 2]} intensity={0.55} color="#d9ccff" />
      <directionalLight position={[2, 5, -8]} intensity={0.9} color="#ffd9e2" />

      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <color attach="background" args={['#f3e6d8']} />
        <Lightformer form="rect" intensity={2.4} color="#fff6ec" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffe9dc" position={[-6, 2, 4]} rotation-y={Math.PI / 2.5} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#f7dcd6" position={[6, 1, 3]} rotation-y={-Math.PI / 2.5} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#ecd9c8" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
    </>
  )
}
