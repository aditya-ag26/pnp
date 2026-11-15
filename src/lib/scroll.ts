/**
 * Smooth scrolling (Lenis) wired into GSAP's ticker + ScrollTrigger.
 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SECTION_COUNT, SECTION_IDS, type SectionId } from './stage'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {}

  const instance = new Lenis({ lerp: 0.09, smoothWheel: true })
  lenis = instance
  instance.on('scroll', ScrollTrigger.update)

  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Freeze / release page scrolling (used while exploring an island). */
export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Jump to the top instantly, e.g. after a route change. */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
  ScrollTrigger.refresh()
}

function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

/**
 * Scrolls to a section by id. Hero / yoga / paint live inside the pinned
 * stage, so they map to a position along its scroll track.
 */
export function scrollToSection(id: string) {
  const index = SECTION_IDS.indexOf(id as SectionId)

  if (index >= 0) {
    const track = document.getElementById('experience')
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY
    const distance = track.offsetHeight - window.innerHeight
    scrollToY(top + (distance * index) / (SECTION_COUNT - 1))
    return
  }

  const el = document.getElementById(id)
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY)
}

