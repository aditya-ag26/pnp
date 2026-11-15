/**
 * Navbar — logo left, page links centre, booking button right. Turns to
 * frosted glass once the page has scrolled; collapses to a menu button on
 * small screens; steps aside while an island is being explored.
 */
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV_LINKS } from '@/content/site'
import { useUi } from '@/lib/stage'
import BookButton from '@/components/ui/BookButton'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const exploring = useUi((s) => s.exploring)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setOpen(false)

  return (
    <header className="nav" data-scrolled={scrolled || open || undefined} data-hidden={exploring || undefined}>
      <Link to="/" className="nav__logo" onClick={close} aria-label="Paws & Poses — home">
        <img src="/images/logo.png" alt="" width={195} height={159} />
      </Link>

      <nav className="nav__links" data-open={open || undefined} aria-label="Main">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end onClick={close}>
            {link.label}
          </NavLink>
        ))}
        <BookButton small className="nav__book-mobile" onClick={close} />
      </nav>

      <BookButton small className="nav__cta" />

      <button
        type="button"
        className="nav__toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
      </button>
    </header>
  )
}
