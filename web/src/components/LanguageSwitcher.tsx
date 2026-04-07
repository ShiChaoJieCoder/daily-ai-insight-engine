import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import './language-switcher.css';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const isZh = i18n.language === 'zh';

  return (
    <div className="lang-switcher">
      <Globe size={16} className="lang-switcher__icon" aria-hidden />
      <button
        className="lang-switcher__toggle"
        onClick={toggleLanguage}
        aria-label={t('common.language')}
        role="switch"
        aria-checked={isZh}
      >
        <span className={`lang-switcher__option ${isZh ? 'lang-switcher__option--active' : ''}`}>
          中
        </span>
        <span className={`lang-switcher__option ${!isZh ? 'lang-switcher__option--active' : ''}`}>
          EN
        </span>
        <span className="lang-switcher__slider" aria-hidden />
      </button>
    </div>
  );
}
