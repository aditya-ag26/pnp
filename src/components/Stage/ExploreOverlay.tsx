/**
 * ExploreOverlay — input surface and controls for explore mode.
 * Drag to rotate, wheel / pinch / buttons to zoom, Esc or "Back" to leave.
 */
import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { exitExplore, resetView, rotateBy, toggleCloseup, zoomBy } from '@/lib/explore'
import { useUi } from '@/lib/stage'
import { ArrowLeftIcon, MinusIcon, PawIcon, PlusIcon, ResetIcon } from '@/components/ui/Icons'

export default function ExploreOverlay() {
  const exploring = useUi((s) => s.exploring)
  const closeup = useUi((s) => s.closeup)
  const surface = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef(0)

  // Wheel zoom (needs a non-passive listener) and Esc to close.
  useEffect(() => {
    if (!exploring) return
    const el = surface.current
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomBy(Math.exp(-e.deltaY * 0.0014))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitExplore()
    }
    el?.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      el?.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [exploring])

  const spread = () => {
    const [a, b] = [...pointers.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2) pinch.current = spread()
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const last = pointers.current.get(e.pointerId)
    if (!last) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 1) {
      rotateBy(dx, dy)
    } else if (pointers.current.size === 2) {
      const now = spread()
      if (pinch.current > 0) zoomBy(now / pinch.current)
      pinch.current = now
    }
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId)
    pinch.current = 0
  }

  return (
    <div className="explore" data-open={exploring || undefined} aria-hidden={!exploring}>
      <div
        ref={surface}
        className="explore__surface"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />

      <button type="button" className="button button--small explore__back" onClick={exitExplore} tabIndex={exploring ? 0 : -1}>
        <span className="button__icon">
          <ArrowLeftIcon />
        </span>
        Back
      </button>

      <button type="button" className="button button--small explore__meet" onClick={toggleCloseup} tabIndex={exploring ? 0 : -1}>
        {closeup ? 'See the island' : 'Meet the puppy'}
        <span className="button__icon">
          <PawIcon />
        </span>
      </button>

      <div className="explore__controls">
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.3)} tabIndex={exploring ? 0 : -1}>
          <MinusIcon />
        </button>
        <button type="button" aria-label="Reset view" onClick={resetView} tabIndex={exploring ? 0 : -1}>
          <ResetIcon />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.3)} tabIndex={exploring ? 0 : -1}>
          <PlusIcon />
        </button>
      </div>

      <p className="explore__hint">Drag to rotate · Scroll or pinch to zoom</p>
    </div>
  )
}
