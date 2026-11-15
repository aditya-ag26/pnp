/**
 * App — page shell and routes. Sets up smooth scrolling and scroll-reveals;
 * the navbar and footer wrap every page.
 */
import { lazy, Suspense, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initSmoothScroll, prefersReducedMotion, scrollToTop } from '@/lib/scroll'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import Home from '@/pages/Home'

const Experiences = lazy(() => import('@/pages/Experiences'))
const About = lazy(() => import('@/pages/About'))
const Contact = lazy(() => import('@/pages/Contact'))

function NotFound() {
  return (
    <div className="page page--centered">
      <h1 className="display display--page">
        Lost <em>puppy.</em>
      </h1>
      <p className="lead">We couldn't find that page.</p>
      <Link to="/" className="text-link">
        Back home
      </Link>
    </div>
  )
}

/** Runs after each page has rendered: back to the top, then arm the reveals. */
function PageEffects() {
  useEffect(() => {
    scrollToTop()
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.set('[data-reveal]', { opacity: 0, y: 36 })
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }),
      })
    })
    return () => ctx.revert()
  }, [])
  return null
}

/** Keyed by path so its effects re-run on every navigation. */
function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
      <PageEffects />
    </>
  )
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="page page--centered" />}>
          <Routes>
            <Route path="/" element={<Page key={pathname}><Home /></Page>} />
            <Route path="/experiences" element={<Page key={pathname}><Experiences /></Page>} />
            <Route path="/about" element={<Page key={pathname}><About /></Page>} />
            <Route path="/contact" element={<Page key={pathname}><Contact /></Page>} />
            <Route path="*" element={<Page key={pathname}><NotFound /></Page>} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}
