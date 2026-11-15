import { ABOUT_PAGE as PAGE, INSTAGRAM_URL, OWNER, OWNER_INSTAGRAM_URL } from '@/content/site'
import PageHeader from '@/components/Page/PageHeader'
import BookButton from '@/components/ui/BookButton'
import { HeartIcon, InstagramIcon } from '@/components/ui/Icons'

export default function About() {
  return (
    <div className="page">
      <PageHeader {...PAGE} />

      <section className="story">
        <div className="collage" aria-hidden="true">
          {OWNER.photos.map((photo, i) => (
            <div key={photo.src} className={`collage__slot collage__slot--${i + 1}`} data-reveal>
              <figure className="collage__card">
                <img src={photo.src} alt="" loading="lazy" />
              </figure>
            </div>
          ))}
          <HeartIcon className="collage__heart collage__heart--1" />
          <HeartIcon className="collage__heart collage__heart--2" />
        </div>

        <div className="story__copy">
          {PAGE.story.map((text) => (
            <p key={text} className="lead lead--wide" data-reveal>
              {text}
            </p>
          ))}
          <p className="story__signature" data-reveal>
            — Riya Bedi, founder
          </p>
          <div data-reveal>
            <a href={OWNER_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-link">
              <InstagramIcon /> @riya_bedii
            </a>
          </div>
        </div>
      </section>

      <section className="notes">
        <h2 className="title title--small" data-reveal>
          What we care about
        </h2>
        <div className="card-grid">
          {PAGE.values.map((value) => (
            <div key={value.title} className="card" data-reveal>
              <h3>{value.title}</h3>
              <p>{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="banner" data-reveal>
        <div>
          <h2 className="title title--small">{PAGE.closing.title}</h2>
          <p className="lead lead--wide">{PAGE.closing.body}</p>
        </div>
        <div className="banner__actions">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-link">
            <InstagramIcon /> @pawsandposesindia
          </a>
          <BookButton />
        </div>
      </section>
    </div>
  )
}
