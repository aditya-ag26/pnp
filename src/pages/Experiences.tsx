import { Link } from 'react-router-dom'
import { EXPERIENCES_PAGE as PAGE } from '@/content/site'
import PageHeader from '@/components/Page/PageHeader'
import BookButton from '@/components/ui/BookButton'
import { ArrowRightIcon } from '@/components/ui/Icons'

export default function Experiences() {
  return (
    <div className="page">
      <PageHeader {...PAGE} />

      <div className="experience-list">
        {PAGE.items.map((item) => (
          <article key={item.id} id={item.id} className="experience" data-reveal>
            <div className="experience__art">
              <img src={item.image} alt="" loading="lazy" />
            </div>
            <div className="experience__copy">
              <span className="badge">{item.number}</span>
              <h2 className="title">{item.title}</h2>
              <p className="tagline">{item.tagline}</p>
              {item.paragraphs.map((text) => (
                <p key={text} className="lead lead--wide">
                  {text}
                </p>
              ))}
              <BookButton label={`Book ${item.title}`} />
            </div>
          </article>
        ))}
      </div>

      <section className="notes">
        <h2 className="title title--small" data-reveal>
          {PAGE.notesTitle}
        </h2>
        <div className="card-grid">
          {PAGE.notes.map((note) => (
            <div key={note.title} className="card" data-reveal>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="banner" data-reveal>
        <div>
          <h2 className="title title--small">{PAGE.corporate.title}</h2>
          <p className="lead lead--wide">{PAGE.corporate.body}</p>
        </div>
        <Link to={PAGE.corporate.cta.to} className="button">
          {PAGE.corporate.cta.label}
          <span className="button__icon">
            <ArrowRightIcon />
          </span>
        </Link>
      </section>
    </div>
  )
}
