/**
 * Experience — the single Canvas, single scene, single camera.
 * Rendering pauses whenever the stage is scrolled out of view.
 */
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { NeutralToneMapping, PCFSoftShadowMap } from 'three'
import { setUi } from '@/lib/stage'
import { CAMERA } from './config'
import { useIslandModel } from './useIslandModel'
import Islands from './Islands'
import Clouds from './Clouds'
import CameraRig from './CameraRig'
import Lighting from './Lighting'

function World() {
  const model = useIslandModel()
  // The model has resolved once this mounts: let the loader go and the intro play.
  useEffect(() => setUi({ loaded: true }), [])
  return (
    <>
      <Islands model={model} />
      <Clouds model={model} />
    </>
  )
}

export default function Experience() {
  const wrapper = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(true)
  const [maxDpr, setMaxDpr] = useState(1.75)

  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={wrapper} className="stage-canvas" aria-hidden="true">
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        camera={{ fov: CAMERA.fov, near: 0.1, far: 60, position: [0, 0, CAMERA.distance] }}
        dpr={[1, maxDpr]}
        shadows={{ type: PCFSoftShadowMap }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
        <CameraRig />
        <Lighting />
        <Suspense fallback={null}>
          <World />
        </Suspense>
      </Canvas>
    </div>
  )
}
