/**
 * Footer — one large rounded brown card: about + socials, link columns,
 * contact details, newsletter field, copyright line.
 */
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BOOKING_URL, CONTACT, FOOTER, NAV_LINKS } from '@/content/site'
import { ArrowRightIcon, SOCIAL_ICONS } from '@/components/ui/Icons'

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)

  // Placeholder: wire this up to a real mailing-list service.
  const subscribe = (event: FormEvent) => {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer id="footer" className="footer">
      <div className="footer__card" data-reveal>
        <div className="footer__grid">
          <div className="footer__about">
            <img src="/images/logo.png" alt="Paws & Poses" width={195} height={159} className="footer__logo" />
            <p>{FOOTER.about}</p>
            <div className="footer__socials">
              {FOOTER.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon]
                return (
                  <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer">
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <h3>Quick links</h3>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
              <li>
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Book a session
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3>Find us</h3>
            <ul>
              <li>
                {CONTACT.addressLines.map((line) => (
                  <span key={line} className="footer__line">
                    {line}
                  </span>
                ))}
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3>Let's stay connected</h3>
            <p className="footer__hint">Subscribe for new sessions and puppy news.</p>
            {subscribed ? (
              <p className="footer__thanks" role="status">
                Thank you — talk soon!
              </p>
            ) : (
              <form className="newsletter" onSubmit={subscribe}>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input id="newsletter-email" type="email" required placeholder="Email address" autoComplete="email" />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRightIcon />
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="footer__copyright">{FOOTER.copyright}</p>
      </div>
    </footer>
  )
}
