import * as Tabs from '@radix-ui/react-tabs'
import * as Tooltip from '@radix-ui/react-tooltip'
import { useTranslation } from 'react-i18next'
import { useEffect, useState, useMemo } from 'react'
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
  Globe,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { ChartBlock } from '../components/report/ChartBlock'
import { HotspotCard } from '../components/report/HotspotCard'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ScrambleText, GradientText, RevealText } from '../components/text-effects'
import { ParticleMorphSystem } from '../components/effects'
import '../liquid-glass-theme.css'
import { useReportStore } from '../store/reportStore'
import { stripMarkdown, formatContent } from '../utils/markdown'
import { tagWithRegion } from '../utils/region'
import type { Region } from '../types/report'
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
  const loading = useReportStore((s) => s.loading)
  const error = useReportStore((s) => s.error)
  const fetchLatestReport = useReportStore((s) => s.fetchLatestReport)
  
  // 地区过滤状态
  const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')

  // 组件加载时自动获取最新报告
  useEffect(() => {
    fetchLatestReport()
  }, [fetchLatestReport])
  
  // 为数据添加地区标签并过滤
  const filteredData = useMemo(() => {
    if (!report) return null;
    
    // 为所有数据添加地区标签
    const taggedDeepDive = report.deep_dive.map(tagWithRegion);
    const taggedHotspots = report.hotspots.map(tagWithRegion);
    const taggedTrends = report.trends.map(tagWithRegion);
    
    // 根据选择的地区过滤
    if (regionFilter === 'all') {
      return {
        deep_dive: taggedDeepDive,
        hotspots: taggedHotspots,
        trends: taggedTrends,
      };
    }
    
    return {
      deep_dive: taggedDeepDive.filter(d => d.region === regionFilter),
      hotspots: taggedHotspots.filter(h => h.region === regionFilter),
      trends: taggedTrends.filter(t => t.region === regionFilter),
    };
  }, [report, regionFilter])

  // 加载状态
  if (loading) {
    return (
      <div className="dash__empty-state" role="status" aria-live="polite">
        <div className="dash__empty-content">
          <Activity size={48} className="dash__empty-icon" aria-hidden />
          <p className="dash__empty-title">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="dash__empty-state" role="alert" aria-live="assertive">
        <div className="dash__empty-content">
          <AlertTriangle size={48} className="dash__empty-icon dash__empty-icon--error" aria-hidden />
          <h1 className="dash__empty-title dash__empty-title--error">{t('common.error')}</h1>
          <p className="dash__empty-message">{error}</p>
          <button 
            onClick={() => fetchLatestReport()} 
            className="dash__empty-action"
            aria-label={t('common.refresh')}
          >
            {t('common.refresh')}
          </button>
        </div>
      </div>
    )
  }

  // 无数据状态
  if (!report) {
    return (
      <div className="dash__empty-state">
        <div className="dash__empty-content">
          <Newspaper size={48} className="dash__empty-icon" aria-hidden />
          <p className="dash__empty-title">{t('common.noData')}</p>
        </div>
      </div>
    )
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <>
        <ParticleMorphSystem />
        <div className="dash">
        <header className="dash__hero">
          <div className="dash__hero-header">
            <div>
              <p className="dash__eyebrow">
                <ScrambleText text={t('common.appName')} speed={30} />
              </p>
              <h1 className="dash__title">
                <GradientText>{t('dashboard.title')}</GradientText>
              </h1>
              <p className="dash__subtitle">
                <RevealText delay={0.3} duration={0.8}>
                  {t('dashboard.subtitle')}
                </RevealText>
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
              {report.meta.article_count} {t('dashboard.articles')}
            </span>
            <span className="dash__meta-pill dash__meta-pill--mono">
              <Layers size={16} aria-hidden />
              {report.meta.dataset_id}
            </span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="dash__meta-pill dash__meta-pill--btn">
                  <Info size={16} aria-hidden />
                  {t('dashboard.pipeline')} {report.meta.pipeline_version}
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
              {t('dashboard.insufficientData')}
            </p>
          ) : null}
        </header>

        {/* 地区过滤器 */}
        <div className="dash__region-filter">
          <button
            className={`dash__region-btn ${regionFilter === 'all' ? 'dash__region-btn--active' : ''}`}
            onClick={() => setRegionFilter('all')}
            aria-pressed={regionFilter === 'all'}
          >
            <Globe size={16} aria-hidden />
            <span>{t('region.all')}</span>
          </button>
          <button
            className={`dash__region-btn ${regionFilter === 'domestic' ? 'dash__region-btn--active' : ''}`}
            onClick={() => setRegionFilter('domestic')}
            aria-pressed={regionFilter === 'domestic'}
          >
            <MapPin size={16} aria-hidden />
            <span>{t('region.domestic')}</span>
          </button>
          <button
            className={`dash__region-btn ${regionFilter === 'international' ? 'dash__region-btn--active' : ''}`}
            onClick={() => setRegionFilter('international')}
            aria-pressed={regionFilter === 'international'}
          >
            <Globe size={16} aria-hidden />
            <span>{t('region.international')}</span>
          </button>
        </div>

        <Tabs.Root className="dash__tabs" defaultValue="snapshot">
          <Tabs.List className="dash__tab-list" aria-label="Report sections">
            <Tabs.Trigger className="dash__tab" value="snapshot">
              <Activity size={16} aria-hidden />
              {t('dashboard.snapshot')}
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="hotspots">
              <Flame size={16} aria-hidden />
              {t('dashboard.hotspots')}
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="trends">
              <Sparkles size={16} aria-hidden />
              {t('dashboard.trends')}
            </Tabs.Trigger>
            <Tabs.Trigger className="dash__tab" value="charts">
              <BarChart3 size={16} aria-hidden />
              {t('dashboard.charts')}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content className="dash__panel" value="snapshot">
            <section className="dash__section">
              <h2 className="dash__h2">{t('dashboard.deepDive')}</h2>
              <div className="dash__deep-grid">
                {filteredData && filteredData.deep_dive.slice(0, 3).map((d, index) => {
                  const formatted = formatContent(d.narrative);
                  const isChinese = /[\u4e00-\u9fff]/.test(d.title);
                  return (
                    <article key={d.id} className="deep-card">
                      <div className="deep-card__header">
                        <div className="deep-card__badge">
                          <Target size={14} aria-hidden />
                          <span>{isChinese ? '国内' : '国际'}</span>
                        </div>
                        <div className="deep-card__number">#{index + 1}</div>
                      </div>
                      <h3 className="deep-card__title">
                        <Zap size={18} className="deep-card__icon" aria-hidden />
                        <ScrambleText 
                          text={stripMarkdown(d.title)} 
                          speed={40}
                          trigger="hover"
                        />
                      </h3>
                      <p className="deep-card__body">{formatted.summary || stripMarkdown(d.narrative)}</p>
                      {formatted.highlights.length > 0 && (
                        <div className="deep-card__highlights">
                          <div className="deep-card__highlights-label">
                            <Sparkles size={12} aria-hidden />
                            <span>关键要点</span>
                          </div>
                          {formatted.highlights.map((h, i) => (
                            <div key={i} className="deep-card__highlight">
                              <ArrowRight size={14} aria-hidden />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {formatted.links.length > 0 && (
                        <div className="deep-card__footer">
                          <Clock size={14} aria-hidden />
                          <span>了解更多</span>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {report.risks_opportunities && report.risks_opportunities.length > 0 ? (
              <section className="dash__section">
                <h2 className="dash__h2">{t('dashboard.risksOpportunities')}</h2>
                <ul className="ro-list">
                  {report.risks_opportunities.map((ro) => {
                    const isChinese = /[\u4e00-\u9fff]/.test(ro.title);
                    return (
                      <li key={ro.id} className={`ro-list__item ro-list__item--${ro.kind}`}>
                        <div className="ro-list__header">
                          <span className="ro-list__badge">
                            {ro.kind === 'risk' ? (
                              <AlertTriangle size={14} aria-hidden />
                            ) : (
                              <Sparkles size={14} aria-hidden />
                            )}
                            {t(`dashboard.${ro.kind}`)}
                          </span>
                          {isChinese && (
                            <span className="ro-list__region">
                              <MapPin size={12} aria-hidden />
                              国内
                            </span>
                          )}
                        </div>
                        <div className="ro-list__content">
                          <h3 className="ro-list__title">
                            {ro.kind === 'risk' ? (
                              <AlertTriangle size={16} className="ro-list__title-icon" aria-hidden />
                            ) : (
                              <Zap size={16} className="ro-list__title-icon" aria-hidden />
                            )}
                            {stripMarkdown(ro.title)}
                          </h3>
                          <p className="ro-list__detail">{stripMarkdown(ro.detail)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </Tabs.Content>

          <Tabs.Content className="dash__panel" value="hotspots">
            <section className="dash__section">
              <div className="hotspot-grid">
                {filteredData && filteredData.hotspots.map((h) => (
                  <HotspotCard key={h.id} hotspot={h} />
                ))}
              </div>
            </section>
          </Tabs.Content>

          <Tabs.Content className="dash__panel" value="trends">
            <section className="dash__section">
              <ul className="trend-list">
                {filteredData && filteredData.trends.map((t) => {
                  const getMomentumIcon = (momentum: string) => {
                    switch (momentum) {
                      case 'rising': return <TrendingUp size={16} aria-hidden />;
                      case 'cooling': return <TrendingDown size={16} aria-hidden />;
                      default: return <Minus size={16} aria-hidden />;
                    }
                  };
                  const getMomentumLabel = (momentum: string) => {
                    switch (momentum) {
                      case 'rising': return '上升';
                      case 'cooling': return '降温';
                      default: return '稳定';
                    }
                  };
                  const isChinese = /[\u4e00-\u9fff]/.test(t.title);
                  return (
                    <li key={t.id} className="trend-list__item">
                      <div className="trend-list__head">
                        <div className="trend-list__title-wrapper">
                          <Tag size={16} className="trend-list__icon" aria-hidden />
                          <h3 className="trend-list__title">
                            <RevealText delay={0.1}>
                              {stripMarkdown(t.title)}
                            </RevealText>
                          </h3>
                        </div>
                        <div className="trend-list__badges">
                          {isChinese && (
                            <span className="trend-list__region">
                              <MapPin size={12} aria-hidden />
                              国内
                            </span>
                          )}
                          {t.momentum && (
                            <span className={`trend-list__mom trend-list__mom--${t.momentum}`}>
                              {getMomentumIcon(t.momentum)}
                              {getMomentumLabel(t.momentum)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="trend-list__summary">{stripMarkdown(t.summary)}</p>
                    </li>
                  );
                })}
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
      </>
    </Tooltip.Provider>
  )
}
