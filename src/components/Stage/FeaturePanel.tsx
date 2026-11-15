import type { Ref } from 'react'
import type { Feature } from '@/content/site'

export default function FeaturePanel({ feature, ref }: { feature: Feature; ref: Ref<HTMLElement> }) {
  return (
    <article id={feature.id} ref={ref} className="panel" style={{ opacity: 0, visibility: 'hidden' }}>
      <div className="panel__inner">
        <span className="badge">{feature.number}</span>
        <h2 className="title">{feature.title}</h2>
        <p className="tagline">{feature.tagline}</p>
        <p className="lead">{feature.body}</p>
      </div>
    </article>
  )
}
