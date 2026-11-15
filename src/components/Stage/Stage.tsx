/**
 * Stage — the pinned, full-screen part of the page.
 *
 * A tall scroll track holds a sticky viewport containing the 3D canvas and the
 * three text panels (hero, yoga, paint). Scrolling the track swaps islands and
 * cross-fades the panels; when the track ends the whole stage scrolls away and
 * the rest of the page follows normally.
 */
import { lazy, Suspense, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { FEATURES } from '@/content/site'
import { cancelExplore } from '@/lib/explore'
import { scrollToSection } from '@/lib/scroll'
import { SECTION_IDS, stage, useUi } from '@/lib/stage'
import { ArrowDownIcon } from '@/components/ui/Icons'
import HeroPanel from './HeroPanel'
import FeaturePanel from './FeaturePanel'
import ExploreOverlay from './ExploreOverlay'
import { useStageScroll } from './useStageScroll'

// three.js and the scene load as a separate chunk, after the page shell.
const Experience = lazy(() => import('@/scene/Experience'))

const DOT_LABELS = ['Home', 'Puppy Yoga', 'Sip & Paint']

export default function Stage() {
  const track = useRef<HTMLElement>(null)
  const panels = useRef<(HTMLElement | null)[]>([])
  const loaded = useUi((s) => s.loaded)
  const active = useUi((s) => s.activeSection)
  const exploring = useUi((s) => s.exploring)

  useStageScroll(track, panels)

  // Never leave the page frozen in explore mode when navigating away.
  useEffect(() => cancelExplore, [])

  // Intro: the hero island rises into place and the copy follows.
  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      gsap.to(stage, { intro: 1, duration: 2, ease: 'none', delay: 0.25 })
      gsap.from('[data-intro]', {
        y: 26,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.55,
      })
    }, track)
    return () => ctx.revert()
  }, [loaded])

  return (
    <section id="experience" ref={track} className="stage-track" aria-label="Paws & Poses experiences">
      <div className="stage" data-exploring={exploring || undefined}>
        <div className="stage-glow" aria-hidden="true" />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>

        <HeroPanel ref={(el) => void (panels.current[0] = el)} />
        {FEATURES.map((feature, i) => (
          <FeaturePanel key={feature.id} feature={feature} ref={(el) => void (panels.current[i + 1] = el)} />
        ))}

        <ExploreOverlay />

        <nav className="stage-dots" aria-label="Sections">
          {SECTION_IDS.map((id, i) => (
            <button
              key={id}
              type="button"
              className="stage-dot"
              aria-label={DOT_LABELS[i]}
              aria-current={active === i ? 'true' : undefined}
              onClick={() => scrollToSection(id)}
            />
          ))}
        </nav>

        <div className="scroll-hint" data-hidden={active !== 0 || undefined} aria-hidden="true">
          <span className="scroll-hint__circle">
            <ArrowDownIcon />
          </span>
          Scroll to explore
        </div>
      </div>
    </section>
  )
}
