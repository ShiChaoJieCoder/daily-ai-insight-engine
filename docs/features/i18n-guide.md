# 国际化（i18n）功能指南

> 版本：v1.0  
> 创建时间：2026-04-07

## 📋 功能概述

本项目已集成完整的中英文切换功能，用户可以一键切换界面语言。

### 核心特性

- 🌐 **中英文切换**：支持简体中文和英文
- 💾 **持久化存储**：语言选择保存到localStorage
- 🔍 **自动检测**：首次访问自动检测浏览器语言
- 🎨 **精美UI**：毛玻璃效果的切换按钮
- 📱 **响应式**：适配移动端和桌面端

---

## 🚀 使用方法

### 用户使用

1. **切换语言**
   - 点击右上角的语言切换按钮
   - 按钮显示：🌐 中文 / 🌐 EN
   - 点击后立即切换界面语言

2. **语言记忆**
   - 选择的语言会自动保存
   - 下次访问时自动使用上次的语言

3. **自动检测**
   - 首次访问时，系统会检测浏览器语言
   - 如果浏览器是中文，自动显示中文
   - 否则默认显示英文

---

## 🛠️ 技术实现

### 技术栈

- **i18next**: 核心国际化库
- **react-i18next**: React集成
- **i18next-browser-languagedetector**: 浏览器语言检测

### 目录结构

```
web/src/
├── i18n/
│   ├── index.ts                 # i18n配置
│   └── locales/
│       ├── en.json              # 英文语言包
│       └── zh.json              # 中文语言包
├── components/
│   ├── LanguageSwitcher.tsx     # 语言切换组件
│   └── language-switcher.css    # 切换器样式
└── main.tsx                     # 初始化i18n
```

### 配置说明

#### i18n配置 (`web/src/i18n/index.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)      // 自动检测用户语言
  .use(initReactI18next)      // 传递i18n实例给react-i18next
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh }
    },
    fallbackLng: 'en',        // 默认语言
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });
```

---

## 📝 语言包结构

### 英文语言包 (`en.json`)

```json
{
  "common": {
    "appName": "Daily AI Insight Engine",
    "loading": "Loading...",
    "error": "Error"
  },
  "dashboard": {
    "title": "AI Industry Daily Report",
    "subtitle": "Structured insights from daily news"
  },
  "hotspot": {
    "title": "Today's Hot Topics",
    "significance": "Significance"
  }
}
```

### 中文语言包 (`zh.json`)

```json
{
  "common": {
    "appName": "AI舆情分析日报系统",
    "loading": "加载中...",
    "error": "错误"
  },
  "dashboard": {
    "title": "AI领域日报",
    "subtitle": "从每日新闻中提取结构化洞察"
  },
  "hotspot": {
    "title": "今日热点话题",
    "significance": "重要性"
  }
}
```

---

## 💻 开发指南

### 在组件中使用翻译

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

### 切换语言

```typescript
import { useTranslation } from 'react-i18next';

function LanguageButton() {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };
  
  return <button onClick={toggleLanguage}>切换语言</button>;
}
```

### 添加新的翻译

1. **在语言包中添加键值对**

```json
// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// zh.json
{
  "newFeature": {
    "title": "新功能",
    "description": "这是一个新功能"
  }
}
```

2. **在组件中使用**

```typescript
<h2>{t('newFeature.title')}</h2>
<p>{t('newFeature.description')}</p>
```

---

## 🎨 语言切换器组件

### 组件特性

- **毛玻璃效果**：backdrop-filter: blur(10px)
- **悬停动画**：transform: translateY(-1px)
- **图标+文字**：🌐 + 语言名称
- **响应式设计**：移动端自适应

### 样式定制

```css
.language-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.language-switcher:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}
```

---

## 🌍 支持的语言

| 语言 | 代码 | 状态 |
|-----|------|------|
| 简体中文 | zh | ✅ 已支持 |
| English | en | ✅ 已支持 |
| 繁体中文 | zh-TW | ⏳ 计划中 |
| 日本語 | ja | ⏳ 计划中 |

---

## 📊 翻译覆盖率

当前翻译覆盖的模块：

- ✅ 通用文本（common）
- ✅ 导航菜单（nav）
- ✅ 仪表盘（dashboard）
- ✅ 报告页面（report）
- ✅ 指标卡片（metrics）
- ✅ 热点话题（hotspot）
- ✅ 趋势分析（trends）
- ✅ 图表（chart）
- ✅ 页脚（footer）

---

## 🔧 配置选项

### 语言检测顺序

```typescript
detection: {
  order: [
    'localStorage',  // 1. 优先使用localStorage中保存的语言
    'navigator',     // 2. 其次使用浏览器语言
    'htmlTag'        // 3. 最后使用HTML标签的lang属性
  ]
}
```

### 缓存策略

```typescript
detection: {
  caches: ['localStorage'],           // 缓存到localStorage
  lookupLocalStorage: 'i18nextLng'    // localStorage的key名称
}
```

### 默认语言

```typescript
fallbackLng: 'en'  // 当检测失败时使用英文
```

---

## 🐛 常见问题

### Q: 为什么语言没有切换？

A: 检查以下几点：
1. 确保在`main.tsx`中导入了`./i18n`
2. 检查组件是否正确使用了`useTranslation()`
3. 清除浏览器localStorage后重试

### Q: 如何添加新语言？

A: 
1. 在`web/src/i18n/locales/`创建新的语言文件（如`ja.json`）
2. 在`web/src/i18n/index.ts`中添加资源
3. 更新`LanguageSwitcher`组件支持新语言

### Q: 翻译文本没有显示？

A: 
1. 检查语言包中是否存在对应的key
2. 检查key的路径是否正确（如`dashboard.title`）
3. 查看浏览器控制台是否有i18next的警告

### Q: 如何测试不同语言？

A:
```typescript
// 在浏览器控制台执行
localStorage.setItem('i18nextLng', 'zh'); // 设置为中文
localStorage.setItem('i18nextLng', 'en'); // 设置为英文
location.reload(); // 刷新页面
```

---

## 📚 参考资料

- [i18next 官方文档](https://www.i18next.com/)
- [react-i18next 文档](https://react.i18next.com/)
- [语言代码标准 (ISO 639-1)](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

## 🎯 最佳实践

1. **翻译键命名**
   - 使用点号分隔的命名空间：`module.component.text`
   - 保持键名语义化：`button.submit` 而不是 `btn1`

2. **翻译文本**
   - 保持简洁明了
   - 考虑不同语言的文本长度差异
   - 避免硬编码文本

3. **性能优化**
   - 语言包按需加载（未来优化）
   - 避免在render中频繁调用`t()`

4. **维护性**
   - 定期检查未使用的翻译键
   - 保持所有语言包同步更新
   - 使用TypeScript类型检查

---

## 🚀 未来计划

- [ ] 添加更多语言支持（繁体中文、日语、韩语）
- [ ] 语言包按需加载（代码分割）
- [ ] 翻译管理后台
- [ ] 自动翻译工具集成
- [ ] 翻译质量检查工具

---

**最后更新**：2026-04-07
