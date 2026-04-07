import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';

// 初始化i18next
i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 传递i18n实例给react-i18next
  .init({
    resources: {
      en: {
        translation: en
      },
      zh: {
        translation: zh
      }
    },
    fallbackLng: 'en', // 默认语言
    debug: false, // 开发环境可设为true
    
    interpolation: {
      escapeValue: false // React已经处理了XSS
    },
    
    detection: {
      // 语言检测顺序
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 缓存用户语言选择
      caches: ['localStorage'],
      // localStorage的key
      lookupLocalStorage: 'i18nextLng'
    }
  });

export default i18n;
