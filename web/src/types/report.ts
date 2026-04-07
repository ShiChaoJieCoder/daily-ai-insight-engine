/** Aligned with scripts/pipeline/schemas/report.schema.json */

export type ChartType = 'bar' | 'pie' | 'line'

export type ChartDatum = {
  name: string
  value: number
}

export type ReportChart = {
  id: string
  title: string
  type: ChartType
  data: ChartDatum[]
}

export type ReportMeta = {
  generated_at: string
  dataset_id: string
  pipeline_version: string
  article_count: number
  insufficient_data?: boolean
}

export type Hotspot = {
  id: string
  title: string
  summary: string
  related_article_ids: string[]
}

export type TrendItem = {
  id: string
  title: string
  summary: string
  momentum?: 'rising' | 'stable' | 'cooling'
}

export type DeepDiveItem = {
  id: string
  title: string
  narrative: string
  related_article_ids: string[]
}

export type RiskOpportunity = {
  id: string
  kind: 'risk' | 'opportunity'
  title: string
  detail: string
}

export type InsightReport = {
  meta: ReportMeta
  hotspots: Hotspot[]
  deep_dive: DeepDiveItem[]
  trends: TrendItem[]
  risks_opportunities?: RiskOpportunity[]
  charts: ReportChart[]
}
