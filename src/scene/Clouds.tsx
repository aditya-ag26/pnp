/**
 * Clouds — a handful of instances of the three GLB clouds, drifting slowly
 * at different depths. They slide up past the camera as you scroll, which is
 * what sells the feeling of moving through one continuous sky.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { stage } from '@/lib/stage'
import { getLayout } from './layout'
import type { IslandModel } from './useIslandModel'

interface CloudSpec {
  /** Which GLB cloud to use. */
  source: number
  /** Position as a fraction of the visible width / height (0 = centre). */
  x: number
  y: number
  /** World depth: negative is behind the islands, positive in front. */
  z: number
  /** Size as a fraction of the visible height. */
  size: number
  /** How strongly scroll moves it (screen heights per section). */
  parallax: number
  /** Horizontal drift speed. */
  drift: number
}

const CLOUDS: CloudSpec[] = [
  { source: 0, x: 0.02, y: 0.34, z: -4, size: 0.085, parallax: 0.2, drift: 0.05 },
  { source: 2, x: 0.44, y: 0.38, z: -5, size: 0.075, parallax: 0.15, drift: -0.04 },
  { source: 1, x: 0.47, y: -0.28, z: 1.2, size: 0.06, parallax: 0.46, drift: 0.06 },
  { source: 1, x: -0.46, y: 0.42, z: -5, size: 0.06, parallax: 0.12, drift: 0.045 },
  { source: 2, x: 0.05, y: -0.6, z: -4, size: 0.08, parallax: 0.24, drift: -0.05 },
  { source: 0, x: 0.42, y: -0.95, z: -5, size: 0.09, parallax: 0.32, drift: 0.04 },
  { source: 1, x: -0.02, y: -1.2, z: -3, size: 0.065, parallax: 0.4, drift: -0.045 },
  { source: 2, x: 0.36, y: -1.5, z: 1, size: 0.06, parallax: 0.58, drift: 0.05 },
]

export default function Clouds({ model }: { model: IslandModel }) {
  const refs = useRef<(Group | null)[]>([])

  const instances = useMemo(
    () => CLOUDS.map((spec) => model.clouds[spec.source % model.clouds.length].clone()),
    [model],
  )

  useFrame(({ size, clock }) => {
    const l = getLayout(size.width, size.height)
    const t = clock.elapsedTime

    CLOUDS.forEach((spec, i) => {
      const cloud = refs.current[i]
      if (!cloud) return
      cloud.position.set(
        l.vw * (spec.x + Math.sin(t * spec.drift + i * 1.7) * 0.035),
        l.vh * (spec.y + stage.progress * spec.parallax) + Math.sin(t * 0.4 + i) * 0.05,
        spec.z,
      )
      // Clouds in front of the islands step aside while one is being explored.
      cloud.scale.setScalar(l.vh * spec.size * (spec.z > 0 ? 1 - stage.explore : 1))
      cloud.rotation.y = Math.sin(t * 0.12 + i * 2) * 0.25
    })
  })

  return (
    <>
      {instances.map((cloud, i) => (
        <primitive key={i} object={cloud} ref={(g: Group | null) => void (refs.current[i] = g)} />
      ))}
    </>
  )
}
