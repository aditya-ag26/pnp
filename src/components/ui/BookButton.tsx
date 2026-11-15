/** The one booking button — always opens the Sort My Scene page. */
import { BOOKING_URL } from '@/content/site'
import { PawIcon } from './Icons'

interface Props {
  label?: string
  small?: boolean
  className?: string
  onClick?: () => void
}

export default function BookButton({ label = 'Book a session', small, className = '', onClick }: Props) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`button ${small ? 'button--small' : ''} ${className}`}
      onClick={onClick}
    >
      {label}
      <span className="button__icon">
        <PawIcon />
      </span>
    </a>
  )
}
