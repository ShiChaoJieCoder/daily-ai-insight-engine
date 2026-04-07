import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Flame,
  Info,
  Layers,
  Newspaper,
  Sparkles,
} from 'lucide-react'
import { ChartBlock } from '../components/report/ChartBlock'
import { HotspotCard } from '../components/report/HotspotCard'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useReportStore } from '../store/reportStore'
import './dashboard.css'

function formatGeneratedAt(iso: string) {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

export function Dashboard() {
  const { t } = useTranslation()
  const report = useReportStore((s) => s.report)

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="dash">
        <header className="dash__hero">
          <div className="dash__hero-header">
            <div>
              <p className="dash__eyebrow">{t('common.appName')}</p>
              <h1 className="dash__title">{t('dashboard.title')}</h1>
              <p className="dash__subtitle">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="dash__meta-row">
            <span className="dash__meta-pill">
              <Calendar size={16} aria-hidden />
              {formatGeneratedAt(report.meta.generated_at)}
            </span>
            <span className="dash__meta-pill">
              <Newspaper size={16} aria-hidden />
              {report.meta.article_count} articles
            </span>
            <span className="dash__meta-pill dash__meta-pill--mono">
              <Layers size={16} aria-hidden />
              {report.meta.dataset_id}
            </span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="dash__meta-pill dash__meta-pill--btn">
                  <Info size={16} aria-hidden />
                  Pipeline {report.meta.pipeline_version}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="dash__tooltip" sideOffset={6}>
                  Report JSON shape matches <code>scripts/pipeline/schemas/report.schema.json</code>
                  <Tooltip.Arrow className="dash__tooltip-arrow" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
          {report.meta.insufficient_data ? (
            <p className="dash__warn" role="status">
              <AlertTriangle size={18} aria-hidden />
              Insufficient data for this window — figures may be sparse.
            </p>
          ) : null}
        </header>

        <Tabs.Root className="dash__tabs" defaultValue="snapshot">
          <Tabs.List className="dash__tab-list" aria-label="Report sections">
            <Tabs.Trigger className="dash__tab" value="snapshot">
              <Activity size={16} aria-hidden />
              Snapshot
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="hotspots">
              <Flame size={16} aria-hidden />
              Hotspots
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="trends">
              <Sparkles size={16} aria-hidden />
              Trends
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="charts">
              <BarChart3 size={16} aria-hidden />
              Charts
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className="dash__panel" value="snapshot">
            <section className="dash__section">
              <h2 className="dash__h2">Deep dive</h2>
              <div className="dash__deep-grid">
                {report.deep_dive.map((d) => (
                  <article key={d.id} className="deep-card">
                    <h3 className="deep-card__title">{d.title}</h3>
                    <p className="deep-card__body">{d.narrative}</p>
                  </article>
                ))}
              </div>
            </section>

            {report.risks_opportunities && report.risks_opportunities.length > 0 ? (
              <section className="dash__section">
                <h2 className="dash__h2">Risks &amp; opportunities</h2>
                <ul className="ro-list">
                  {report.risks_opportunities.map((ro) => (
                    <li key={ro.id} className={`ro-list__item ro-list__item--${ro.kind}`}>
                      <span className="ro-list__badge">
                        {ro.kind === 'risk' ? (
                          <AlertTriangle size={14} aria-hidden />
                        ) : (
                          <Sparkles size={14} aria-hidden />
                        )}
                        {ro.kind}
                      </span>
                      <div>
                        <h3 className="ro-list__title">{ro.title}</h3>
                        <p className="ro-list__detail">{ro.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </Tabs.Content>

          <Tabs.Content className="dash__panel" value="hotspots">
            <section className="dash__section">
              <div className="hotspot-grid">
                {report.hotspots.map((h) => (
                  <HotspotCard key={h.id} hotspot={h} />
                ))}
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content className="dash__panel" value="trends">
            <section className="dash__section">
              <ul className="trend-list">
                {report.trends.map((t) => (
                  <li key={t.id} className="trend-list__item">
                    <div className="trend-list__head">
                      <h3 className="trend-list__title">{t.title}</h3>
                      {t.momentum ? (
                        <span className={`trend-list__mom trend-list__mom--${t.momentum}`}>
                          {t.momentum}
                        </span>
                      ) : null}
                    </div>
                    <p className="trend-list__summary">{t.summary}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Tabs.Content>

          <Tabs.Content className="dash__panel" value="charts">
            <section className="dash__section">
              <div className="chart-grid">
                {report.charts.map((c) => (
                  <ChartBlock key={c.id} chart={c} />
                ))}
              </div>
            </section>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </Tooltip.Provider>
  )
}
