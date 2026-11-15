/**
 * OwnerSection — "Meet the heart behind Paws & Poses".
 * Copy on the left, a tilted collage of rounded photo cards on the right.
 */
import { Link } from 'react-router-dom'
import { OWNER } from '@/content/site'
import { ArrowRightIcon, HeartIcon } from '@/components/ui/Icons'

export default function OwnerSection() {
  return (
    <section id="owner" className="owner">
      <div className="owner__inner">
        <div className="owner__copy">
          <span className="badge" data-reveal>
            {OWNER.number}
          </span>
          <h2 className="title" data-reveal>
            {OWNER.titleLines.map((line, i) => (
              <span key={line}>
                {line}
                {i < OWNER.titleLines.length - 1 ? <br /> : ' '}
              </span>
            ))}
            <em>{OWNER.titleAccent}</em>
          </h2>
          {OWNER.paragraphs.map((text) => (
            <p key={text} className="lead" data-reveal>
              {text}
            </p>
          ))}
          <div data-reveal>
            <Link to={OWNER.cta.to} className="button">
              {OWNER.cta.label}
              <span className="button__icon">
                <ArrowRightIcon />
              </span>
            </Link>
          </div>
        </div>

        <div className="collage">
          {OWNER.photos.map((photo, i) => (
            <div key={photo.src} className={`collage__slot collage__slot--${i + 1}`} data-reveal>
              <figure className="collage__card">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </figure>
            </div>
          ))}
          <HeartIcon className="collage__heart collage__heart--1" />
          <HeartIcon className="collage__heart collage__heart--2" />
        </div>
      </div>
    </section>
  )
}
