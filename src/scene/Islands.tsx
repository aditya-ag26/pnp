/**
 * Islands — the three floating worlds.
 *
 * They ride an invisible wheel whose hub sits off-screen to the right:
 * scrolling turns the wheel, so the current island lifts away while the next
 * one swings up into place, turning on its own axis as it arrives.
 *
 * In explore mode the current island glides to the centre and follows the
 * visitor's drag (see src/lib/explore.ts).
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group, type Object3D } from 'three'
import { orbit, stage } from '@/lib/stage'
import { ISLANDS, MOTION } from './config'
import { getLayout } from './layout'
import { animateProps } from './props/animate'
import { updatePuppy } from './puppy/updatePuppy'
import type { IslandModel } from './useIslandModel'

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const { lerp } = MathUtils

export default function Islands({ model }: { model: IslandModel }) {
  const outer = useRef<(Group | null)[]>([])
  const spin = useRef<(Group | null)[]>([])
  const pointer = useRef({ x: 0, y: 0 })

  useFrame(({ size, clock, camera }, delta) => {
    const l = getLayout(size.width, size.height)
    const t = clock.elapsedTime
    const intro = easeOutCubic(stage.intro)

    // Ease the pointer and the orbit so nothing ever jitters.
    const k = 1 - Math.exp(-delta * 3)
    pointer.current.x += (stage.pointerX - pointer.current.x) * k
    pointer.current.y += (stage.pointerY - pointer.current.y) * k
    const ko = 1 - Math.exp(-delta * 9)
    orbit.yawEased += (orbit.yaw - orbit.yawEased) * ko
    orbit.pitchEased += (orbit.pitch - orbit.pitchEased) * ko
    orbit.zoomEased += (orbit.zoom - orbit.zoomEased) * ko

    animateProps(model.animatedProps, t)

    ISLANDS.forEach((cfg, i) => {
      const group = outer.current[i]
      const turn = spin.current[i]
      if (!group || !turn) return

      const d = i - stage.progress
      const away = Math.min(1, Math.abs(d))
      group.visible = away < 0.999
      if (!group.visible) return

      // How far this island is into explore mode (0 = normal page, 1 = opened up).
      const e = i === stage.exploreIndex ? stage.explore : 0
      const parallax = 1 - stage.explore

      const angle = d * MOTION.wheelStep
      const float = Math.sin(t * MOTION.floatSpeed + i * 2.1)
      const bob = float * MOTION.floatHeight

      const restY =
        l.focusY - l.wheel * Math.sin(angle) + l.slot * (cfg.lift + bob - (1 - intro) * 0.5)
      const restScale = l.slot * cfg.scale * (1 - 0.45 * away) * (0.82 + 0.18 * intro)

      group.position.set(
        lerp(l.focusX + l.wheel * (1 - Math.cos(angle)), 0, e),
        lerp(restY, l.exploreSlot * (cfg.lift + bob * 0.5), e),
        lerp(-MOTION.travelDepth * away * away, 0, e),
      )
      group.scale.setScalar(lerp(restScale, l.exploreSlot * cfg.scale, e))

      group.rotation.x =
        MOTION.tilt -
        pointer.current.y * MOTION.pointerPitch * parallax +
        float * 0.012 +
        orbit.pitchEased * e
      group.rotation.z = Math.sin(t * MOTION.floatSpeed * 0.7 + i) * 0.014
      turn.rotation.y =
        cfg.yaw +
        d * MOTION.travelSpin +
        (1 - intro) * -0.9 +
        pointer.current.x * MOTION.pointerYaw * parallax +
        Math.sin(t * 0.23 + i) * 0.045 +
        orbit.yawEased * e

      if (cfg.puppy) {
        const puppy = (group.userData.puppy ??= group.getObjectByName(cfg.puppy.node)) as Object3D | undefined
        if (puppy) {
          updatePuppy(puppy, cfg.puppy, {
            index: i,
            island: group,
            camera,
            aspect: size.width / size.height,
            time: t,
            exploring: e > 0,
            inFocus: away < 0.25,
          })
        }
      }
    })
  })

  return (
    <>
      {model.islands.map((island, i) => (
        <group key={island.name} ref={(g) => void (outer.current[i] = g)}>
          <group ref={(g) => void (spin.current[i] = g)}>
            <primitive object={island} />
          </group>
        </group>
      ))}
    </>
  )
}
