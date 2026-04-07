import { create } from 'zustand'
import type { InsightReport } from '../types/report'

type ReportState = {
  report: InsightReport | null
  loading: boolean
  error: string | null
  setReport: (r: InsightReport) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchLatestReport: () => Promise<void>
}

// 空的初始报告结构
const emptyReport: InsightReport = {
  meta: {
    generated_at: new Date().toISOString(),
    article_count: 0,
    dataset_id: '',
    pipeline_version: '1.0.0',
    insufficient_data: false,
  },
  deep_dive: [],
  hotspots: [],
  trends: [],
  charts: [],
  risks_opportunities: [],
}

export const useReportStore = create<ReportState>((set, get) => ({
  report: emptyReport,
  loading: false,
  error: null,
  
  setReport: (report) => set({ report, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  fetchLatestReport: async () => {
    const { setLoading, setError, setReport } = get()
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3000/api/reports/latest')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setReport(data)
    } catch (error: any) {
      console.error('[ReportStore] 获取报告失败:', error)
      setError(error.message || '获取报告失败')
    } finally {
      setLoading(false)
    }
  },
}))
