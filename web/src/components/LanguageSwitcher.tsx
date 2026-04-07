import { useTranslation } from 'react-i18next';
import './language-switcher.css';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <button 
      className="language-switcher" 
      onClick={toggleLanguage}
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <span className="language-icon">🌐</span>
      <span className="language-text">
        {i18n.language === 'zh' ? 'EN' : '中文'}
      </span>
    </button>
  );
}
