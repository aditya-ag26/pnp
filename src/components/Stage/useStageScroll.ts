/**
 * Drives the pinned stage: reads scroll through its track (GSAP ScrollTrigger),
 * smooths it into `stage.progress`, and fades / slides the text panels to match.
 * The 3D scene reads the same `stage.progress`, so DOM and canvas stay in sync.
 */
import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, rawToProgress, setUi, stage } from '@/lib/stage'

/** How close (in sections) the scene must be for a panel to be fully hidden. */
const PANEL_FADE = 0.36

export function useStageScroll(
  track: RefObject<HTMLElement | null>,
  panels: RefObject<(HTMLElement | null)[]>,
) {
  useEffect(() => {
    const el = track.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        stage.raw = self.progress
      },
    })
    stage.raw = trigger.progress
    stage.progress = rawToProgress(stage.raw)

    const tick = (_time: number, deltaMs: number) => {
      const target = rawToProgress(stage.raw)
      const k = 1 - Math.exp((-deltaMs / 1000) * 7)
      stage.progress += (target - stage.progress) * k
      if (Math.abs(target - stage.progress) < 0.0004) stage.progress = target

      panels.current.forEach((panel, i) => {
        if (!panel) return
        const d = i - stage.progress
        const visibility = clamp01(1 - Math.abs(d) / PANEL_FADE)
        const opacity = visibility * visibility * (3 - 2 * visibility) * (1 - stage.explore)
        panel.style.opacity = opacity.toFixed(3)
        panel.style.visibility = opacity > 0 ? 'visible' : 'hidden'
        panel.style.setProperty('--d', d.toFixed(4))
        panel.toggleAttribute('data-active', visibility > 0.6 && stage.explore < 0.2)
      })

      setUi({ activeSection: Math.round(stage.progress) })
    }
    gsap.ticker.add(tick)

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      stage.hasPointer = true
      stage.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      stage.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    return () => {
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [track, panels])
}
