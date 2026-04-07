import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, Link2 } from 'lucide-react'
import type { Hotspot } from '../../types/report'
import './hotspot-card.css'

type Props = {
  hotspot: Hotspot
}

export function HotspotCard({ hotspot }: Props) {
  return (
    <Collapsible.Root className="hotspot">
      <div className="hotspot__header">
        <h3 className="hotspot__title">{hotspot.title}</h3>
        <Collapsible.Trigger className="hotspot__trigger">
          <span className="hotspot__trigger-text">Details</span>
          <ChevronDown className="hotspot__chevron" aria-hidden />
        </Collapsible.Trigger>
      </div>
      <p className="hotspot__lede">{hotspot.summary}</p>
      <Collapsible.Content className="hotspot__content">
        <div className="hotspot__meta">
          <span className="hotspot__meta-label">
            <Link2 size={14} aria-hidden />
            Related article IDs
          </span>
          <ul className="hotspot__ids">
            {hotspot.related_article_ids.map((id) => (
              <li key={id}>
                <code>{id}</code>
              </li>
            ))}
          </ul>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
