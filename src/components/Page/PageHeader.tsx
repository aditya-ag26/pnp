/** Shared top-of-page header for the inner pages. */
import { PawIcon } from '@/components/ui/Icons'

interface Props {
  eyebrow: string
  title: string
  titleAccent: string
  lead: string
}

export default function PageHeader({ eyebrow, title, titleAccent, lead }: Props) {
  return (
    <header className="page-header">
      <p className="eyebrow" data-reveal>
        <PawIcon /> {eyebrow}
      </p>
      <h1 className="display display--page" data-reveal>
        {title} <em>{titleAccent}</em>
      </h1>
      <p className="lead lead--wide" data-reveal>
        {lead}
      </p>
    </header>
  )
}
