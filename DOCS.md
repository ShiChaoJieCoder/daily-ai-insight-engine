# 📚 项目文档说明

## 核心文档

本项目现在只保留了最重要的文档：

### 1. README.md - 主要文档
**完整的项目说明**，包含：
- 项目简介和核心功能
- 技术架构和技术栈
- 项目结构说明
- 快速开始指南
- **双语功能使用说明** ⭐
- AI使用说明
- 数据源配置
- 示例报告
- 开发指南
- 文档索引

### 2. PROJECT_SUMMARY.md - 项目总结
**项目完成情况总结**，包含：
- 功能完成度评估
- 技术架构说明
- 数据流程图
- AI策略说明
- 项目统计信息

## 🌐 双语功能快速参考

### 使用方法
1. 打开 `http://localhost:5174`
2. 点击右上角语言切换按钮
3. 观察所有内容切换为对应语言

### 生成报告
```bash
# 中文报告
yarn generate-report --lang=zh

# 英文报告
yarn generate-report --lang=en
```

### API调用
```bash
# 中文
curl "http://localhost:3000/api/reports/latest?lang=zh"

# 英文
curl "http://localhost:3000/api/reports/latest?lang=en"
```

### 数据文件
- 中文报告：`backend/data/reports/YYYY-MM-DD-report-cn.json`
- 英文报告：`backend/data/reports/YYYY-MM-DD-report-en.json`

## 📁 其他文档位置

项目中还有一些专门的文档位于 `docs/` 目录：

```
docs/
├── architecture/     # 架构设计文档
├── api/             # API文档
├── deployment/      # 部署指南
└── development/     # 开发指南
```

## 💡 快速查找

- **如何启动项目？** → 查看 `README.md` 的"快速开始"部分
- **如何切换语言？** → 查看 `README.md` 的"使用双语功能"部分
- **项目完成度？** → 查看 `PROJECT_SUMMARY.md`
- **技术架构？** → 查看 `README.md` 的"技术架构"部分
- **API文档？** → 查看 `docs/api/`

## 🎯 文档整理说明

已删除的冗余文档：
- ❌ BILINGUAL_CONTENT_DEMO.md（内容已整合到README）
- ❌ BILINGUAL_FEATURE_COMPLETE.md（内容已整合到README）
- ❌ DEMO_STEPS.md（内容已整合到README）
- ❌ LANGUAGE_FEATURE_SUMMARY.md（内容已整合到README）
- ❌ QUICK_REFERENCE.md（内容已整合到README）
- ❌ README_BILINGUAL.md（内容已整合到README）
- ❌ GEMINI_INTEGRATION_SUMMARY.md（不常用）
- ❌ GEMINI_SETUP.md（不常用）
- ❌ QUICK_START.md（内容已在README中）
- ❌ QUICK_START_GEMINI.md（不常用）
- ❌ RUNNING_STATUS.md（内容已在README中）
- ❌ SUBMISSION_CHECKLIST.md（临时文档）
- ❌ UI_ROLLBACK_COMPLETE.md（临时文档）
- ❌ VIEWING_GUIDE.md（内容已在README中）
- ❌ test-bilingual.sh（验证脚本，已不需要）

保留的核心文档：
- ✅ README.md - 主文档（包含所有重要信息）
- ✅ PROJECT_SUMMARY.md - 项目总结
- ✅ DOCS.md - 本文档（文档导航）

---

**现在文档结构更加清晰简洁！** 📖✨
