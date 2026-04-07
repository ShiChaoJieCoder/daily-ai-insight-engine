import { create } from 'zustand'
import sampleReport from '../data/sample-report.json'
import type { InsightReport } from '../types/report'
import { ApiService } from '../services/api'

type ReportState = {
  report: InsightReport
  language: 'zh' | 'en'
  loading: boolean
  error: string | null
  setReport: (r: InsightReport) => void
  setLanguage: (lang: 'zh' | 'en') => void
  fetchLatestReport: (lang?: 'zh' | 'en') => Promise<void>
}

export const useReportStore = create<ReportState>((set, get) => ({
  report: sampleReport as InsightReport,
  language: 'zh',
  loading: false,
  error: null,
  
  setReport: (report) => set({ report }),
  
  setLanguage: (language) => {
    set({ language })
    // 切换语言时自动获取对应语言的报告
    get().fetchLatestReport(language)
  },
  
  fetchLatestReport: async (lang) => {
    const language = lang || get().language
    set({ loading: true, error: null })
    
    try {
      const report = await ApiService.getLatestReport(language)
      set({ report, loading: false })
    } catch (error: any) {
      console.error('Failed to fetch report:', error)
      set({ 
        error: error.message || 'Failed to fetch report',
        loading: false 
      })
      // 如果获取失败，保持使用sample数据
    }
  },
}))
