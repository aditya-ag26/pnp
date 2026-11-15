/**
 * Loader — covers the page until the 3D model is on screen, then fades away.
 * Deliberately free of three.js imports so it paints before the 3D code loads.
 */
import { useEffect, useState } from 'react'
import { useUi } from '@/lib/stage'

export default function Loader() {
  const loaded = useUi((s) => s.loaded)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!loaded) return
    const timer = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(timer)
  }, [loaded])

  if (gone) return null

  return (
    <div className="loader" data-done={loaded || undefined} role="status" aria-live="polite">
      <img src="/images/logo.png" alt="Paws & Poses" width={195} height={159} className="loader__logo" />
      <div className="loader__bar">
        <span />
      </div>
      <p className="loader__text">Fetching the puppies…</p>
    </div>
  )
}
