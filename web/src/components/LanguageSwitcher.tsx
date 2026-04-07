import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import './language-switcher.css';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const { setLanguage, loading } = useReportStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    // 更新i18n语言
    i18n.changeLanguage(newLang);
    // 更新store并获取对应语言的报告
    setLanguage(newLang);
  };
  
  const currentLangLabel = i18n.language === 'zh' ? 'EN' : '中文';

  return (
    <button 
      className="language-switcher" 
      onClick={toggleLanguage}
      aria-label={`${t('common.language')}: ${currentLangLabel}`}
      type="button"
      disabled={loading}
    >
      <Globe size={14} aria-hidden className="language-icon" />
      <span className="language-text">
        {loading ? '...' : currentLangLabel}
      </span>
    </button>
  );
}
