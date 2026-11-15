import type { Ref } from 'react'
import { HERO } from '@/content/site'
import { enterExplore } from '@/lib/explore'
import { PawIcon } from '@/components/ui/Icons'

export default function HeroPanel({ ref }: { ref: Ref<HTMLElement> }) {
  return (
    <article id="hero" ref={ref} className="panel">
      <div className="panel__inner">
        <p className="eyebrow" data-intro>
          <PawIcon /> {HERO.eyebrow}
        </p>
        <h1 className="display" data-intro>
          {HERO.titleLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < HERO.titleLines.length - 1 ? <br /> : ' '}
            </span>
          ))}
          <em>{HERO.titleAccent}</em>
        </h1>
        <p className="lead" data-intro>
          {HERO.body}
        </p>
        <div data-intro>
          {/* Opens the hero island up so it can be spun and zoomed. */}
          <button type="button" className="button" onClick={enterExplore}>
            {HERO.cta}
            <span className="button__icon">
              <PawIcon />
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
