import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, Link2, ExternalLink, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useState } from 'react'
import type { Hotspot } from '../../types/report'
import { stripMarkdown, formatContent } from '../../utils/markdown'
import { SwimmingSnake } from '../text-effects/SwimmingSnake'
import './hotspot-card.css'

type Props = {
  hotspot: Hotspot
}

export function HotspotCard({ hotspot }: Props) {
  const { t } = useTranslation()
  const formatted = formatContent(hotspot.summary)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const [showFish, setShowFish] = useState(false)
  
  useEffect(() => {
    if (summaryRef.current && formatted.summary) {
      // 计算文本行数
      const lineHeight = parseFloat(getComputedStyle(summaryRef.current).lineHeight)
      const height = summaryRef.current.scrollHeight
      const lines = Math.round(height / lineHeight)
      
      // 如果超过5行，显示小鱼
      setShowFish(lines > 5)
    }
  }, [formatted.summary])
  
  return (
    <Collapsible.Root className="hotspot">
      <div className="hotspot__header">
        <h3 className="hotspot__title">{stripMarkdown(hotspot.title)}</h3>
        <Collapsible.Trigger className="hotspot__trigger">
          <span className="hotspot__trigger-text">{t('report.details')}</span>
          <ChevronDown className="hotspot__chevron" aria-hidden />
        </Collapsible.Trigger>
      </div>
      
      {/* 主要摘要 */}
      {formatted.summary && (
        <div className={`hotspot__summary-wrapper ${showFish ? 'hotspot__summary-wrapper--with-snake' : ''}`}>
          {showFish && summaryRef.current && <SwimmingSnake containerRef={summaryRef as React.RefObject<HTMLElement>} speed={0.8} segmentCount={15} />}
          <p ref={summaryRef} className="hotspot__summary hotspot__summary--with-snake">{formatted.summary}</p>
        </div>
      )}
      
      {/* 关键亮点 */}
      {formatted.highlights.length > 0 && (
        <div className="hotspot__highlights">
          {formatted.highlights.map((highlight, index) => (
            <div key={index} className="hotspot__highlight">
              <Sparkles size={12} aria-hidden />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* 相关链接 */}
      {formatted.links.length > 0 && (
        <div className="hotspot__links">
          {formatted.links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hotspot__link"
            >
              <ExternalLink size={12} aria-hidden />
              <span>{link.text}</span>
            </a>
          ))}
        </div>
      )}
      
      <Collapsible.Content className="hotspot__content">
        <div className="hotspot__meta">
          <span className="hotspot__meta-label">
            <Link2 size={14} aria-hidden />
            {t('news.relatedNews')}
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
