import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dashboard } from './pages/Dashboard'
import { useReportStore } from './store/reportStore'

export default function App() {
  const { i18n } = useTranslation()
  const { fetchLatestReport, setLanguage } = useReportStore()
  
  useEffect(() => {
    // 初始化时根据i18n的语言设置加载报告
    const currentLang = i18n.language.startsWith('zh') ? 'zh' : 'en'
    setLanguage(currentLang)
    fetchLatestReport(currentLang)
  }, [])
  
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
