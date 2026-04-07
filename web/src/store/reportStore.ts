import { create } from 'zustand'
import sampleReport from '../data/sample-report.json'
import type { InsightReport } from '../types/report'

type ReportState = {
  report: InsightReport
  setReport: (r: InsightReport) => void
}

export const useReportStore = create<ReportState>((set) => ({
  report: sampleReport as InsightReport,
  setReport: (report) => set({ report }),
}))
