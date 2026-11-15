import type { FormEvent } from 'react'
import { CONTACT, CONTACT_PAGE as PAGE, INSTAGRAM_URL } from '@/content/site'
import PageHeader from '@/components/Page/PageHeader'
import BookButton from '@/components/ui/BookButton'
import { ArrowRightIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon } from '@/components/ui/Icons'

export default function Contact() {
  // No backend yet: the form opens the visitor's email app with the message filled in.
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const subject = `Website enquiry from ${data.get('name')}`
    const body = `${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}\n${data.get('phone') ?? ''}`
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="page">
      <PageHeader {...PAGE} />

      <section className="contact">
        <ul className="contact__details" data-reveal>
          <li>
            <span className="contact__icon">
              <MailIcon />
            </span>
            <div>
              <h3>Email</h3>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </div>
          </li>
          <li>
            <span className="contact__icon">
              <PhoneIcon />
            </span>
            <div>
              <h3>Phone</h3>
              <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </div>
          </li>
          <li>
            <span className="contact__icon">
              <PinIcon />
            </span>
            <div>
              <h3>Address</h3>
              {CONTACT.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </li>
          <li>
            <span className="contact__icon">
              <InstagramIcon />
            </span>
            <div>
              <h3>Instagram</h3>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                @pawsandposesindia
              </a>
            </div>
          </li>
          <li className="contact__book">
            <p>Looking for tickets? Sessions are booked on Sort My Scene.</p>
            <BookButton />
          </li>
        </ul>

        <form className="contact__form" onSubmit={send} data-reveal>
          <label>
            Name
            <input name="name" type="text" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} required />
          </label>
          <button type="submit" className="button">
            Send message
            <span className="button__icon">
              <ArrowRightIcon />
            </span>
          </button>
        </form>
      </section>
    </div>
  )
}
