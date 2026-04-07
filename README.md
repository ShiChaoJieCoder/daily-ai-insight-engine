# AI舆情分析日报系统 (Daily AI Insight Engine)

> 从每日新闻信息中提取结构化洞察，生成可读的分析报告与可视化结果

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

## 📋 项目简介

本系统是一个**AI驱动的舆情分析日报生成系统**，专注于AI行业的信息分析。通过自动化采集、AI处理和可视化展示，将分散的新闻信息转化为结构化洞察和专业报告。

### ✨ v2.0 核心功能

- 🌐 **真实数据源集成**：从Hacker News、Reddit、RSS、arXiv等多个平台获取真实AI资讯
- 🤖 **双模式AI分析**：
  - **OpenAI模式**：GPT-3.5/4深度分析（高质量）
  - **规则引擎模式**：NLP算法分析（零成本，无需API Key）
- 🔄 **自动降级机制**：API失败时自动切换到规则引擎，确保系统可用性
- 📊 **多维度可视化**：图表展示事件分布、情感趋势、热门话题
- 📝 **专业报告生成**：自动生成包含热点分析、趋势判断的日报
- 🌏 **完整双语支持**：中英文内容级双语（非仅UI翻译）

### 🎯 核心优势

- ✅ **零配置运行**：即使没有OpenAI API Key也能正常工作
- ✅ **完全免费**：规则引擎模式无任何API成本
- ✅ **真实数据**：每日自动拉取最新AI资讯，无需人工干预
- ✅ **高可用性**：多数据源并行获取，单点失败不影响整体

### 应用场景

- AI行业趋势分析
- 舆情监测与风险预警
- 信息快速理解与决策辅助
- 投资研究参考
- 技术动态跟踪

---

## 🏗️ 技术架构

### 技术栈

**前端**
- React 19.x + TypeScript 6.x
- Vite 8.x（构建工具）
- Zustand 5.x（状态管理）
- SCSS（样式）
- Recharts 3.x（数据可视化）
- Radix UI（无障碍组件）
- i18next（国际化）

**后端**
- Node.js 20.x + TypeScript 5.x
- Express（Web框架）
- OpenAI API（可选，AI深度分析）
- Natural + Sentiment（规则引擎，NLP分析）
- Axios + RSS Parser（数据获取）

**数据源**
- Hacker News API（技术社区）
- Reddit JSON API（社区讨论）
- RSS Feeds（TechCrunch, The Verge, MIT Tech Review等）
- arXiv API（学术论文）

**数据存储**
- JSON文件系统

### 架构设计

```
前端 (React + Vite) 
    ↓ REST API
后端 (Node.js + Express)
    ↓
AI服务 (OpenAI GPT-3.5/4) + 数据源 (RSS/API)
    ↓
数据存储 (JSON Files)
```

详细架构请参考：[系统架构文档](./docs/architecture/01-system-architecture.md)

---

## 📂 项目结构

```
daily-ai-insight-engine/
├── package.json                   # 根配置（Yarn Workspaces）
├── yarn.lock                      # 统一的依赖锁文件
│
├── docs/                          # 📚 文档
│   ├── design/                    # 设计文档
│   │   └── 01-brainstorming-summary.md
│   ├── architecture/              # 架构文档
│   │   └── 01-system-architecture.md
│   ├── ai-usage/                  # AI使用说明
│   │   ├── 01-prompt-design.md
│   │   ├── 02-error-handling.md
│   │   └── 03-cost-analysis.md
│   ├── deployment/                # 部署文档
│   │   └── yarn-setup.md
│   └── examples/                  # 示例数据
│       ├── sample-report.md
│       └── sample-data.json
│
├── backend/                       # 🔧 后端服务（Workspace）
│   ├── package.json
│   ├── src/
│   │   ├── api/                   # API路由
│   │   ├── services/              # 业务服务
│   │   │   ├── data-fetcher/      # 数据获取
│   │   │   ├── ai-processor/      # AI处理
│   │   │   └── report-generator/  # 报告生成
│   │   ├── utils/                 # 工具函数
│   │   └── types/                 # 类型定义
│   ├── data/                      # 数据存储
│   │   ├── raw/                   # 原始数据
│   │   ├── processed/             # 处理后数据
│   │   └── reports/               # 生成的报告
│   └── config/                    # 配置文件
│
└── web/                           # 🎨 前端应用（Workspace）
    ├── package.json
    ├── src/
    │   ├── components/            # UI组件
    │   ├── pages/                 # 页面
    │   ├── store/                 # 状态管理
    │   ├── styles/                # 样式文件
    │   └── types/                 # 类型定义
    └── public/                    # 静态资源
```

> 💡 本项目使用 **Yarn Workspaces** 管理 monorepo 结构，详细说明请参考 [Yarn 工作区设置指南](./docs/deployment/yarn-setup.md)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 20.x
- Yarn >= 1.22.x
- OpenAI API Key（**可选**，规则引擎模式无需API Key）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/daily-ai-insight-engine.git
cd daily-ai-insight-engine
```

2. **安装依赖**

```bash
# 在根目录安装所有依赖（推荐）
yarn install

# 这会自动安装前端和后端的所有依赖
```

> 💡 使用 Yarn Workspaces，只需在根目录执行一次 `yarn install` 即可安装所有工作区的依赖

3. **配置环境变量**

```bash
# 后端配置
cd backend
cp config/.env.example config/.env
# 编辑 .env 文件，填入你的API密钥
```

```env
# OpenAI配置（可选，不配置则自动使用规则引擎）
OPENAI_API_KEY=your_openai_api_key_here  # 可选
OPENAI_ORG_ID=your_org_id_here           # 可选

# 服务配置
PORT=3000
NODE_ENV=development
```

> 💡 **无需OpenAI API Key也能运行！** 系统会自动检测，如果没有配置API Key，将使用内置的规则引擎进行分析。

4. **启动服务**

```bash
# 方式1：同时启动前后端（推荐）
yarn dev

# 方式2：分别启动
# 启动后端（终端1）
yarn dev:backend

# 启动前端（终端2）
yarn dev:web
```

**服务端口配置**：
- 🔧 **后端服务**：http://localhost:3000
- 🎨 **前端服务**：http://localhost:5173
- 📊 **API健康检查**：http://localhost:3000/api/health

> 🎉 **自动生成报告**：启动后端时，系统会自动检查今日报告是否存在。如果不存在，会自动拉取最新AI资讯并生成报告，无需手动操作！

5. **访问应用**

打开浏览器访问：http://localhost:5173

---

## 📖 使用指南

### 生成日报

#### 🎯 自动生成（推荐）

**无需任何操作！** 执行 `yarn dev` 启动服务后，系统会自动：

1. ✅ 检查今日报告是否存在
2. ✅ 如果不存在，自动从多个数据源拉取最新AI资讯
3. ✅ 自动调用AI/规则引擎进行分析
4. ✅ 自动生成并保存报告（JSON + Markdown格式）
5. ✅ 前端自动加载并展示报告

**工作流程：**
```
yarn dev → 后端启动 → 检测今日报告 → 不存在？→ 自动生成 → 前端展示
                                    ↓
                                  存在？→ 直接加载 → 前端展示
```

#### 手动生成（可选）

如果需要重新生成报告或生成历史日期的报告：

**方式1：通过脚本**

```bash
# 在根目录执行
yarn generate-report
```

**方式2：通过API**

```bash
# 生成今日报告
curl -X POST http://localhost:3000/api/reports/generate

# 生成指定日期的报告
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-07"}'
```

### 查看报告

- **Web界面**：http://localhost:5173
- **API接口**：http://localhost:3000/api/reports/latest
- **JSON数据**：`backend/data/reports/2026-04-07-report.json`
- **Markdown报告**：`backend/data/reports/2026-04-07-report.md`

---

## 🌐 数据源说明（v2.0新增）

系统从多个公开平台自动获取真实AI资讯：

### 支持的数据源

| 数据源 | 类型 | API | 内容特点 | 更新频率 |
|--------|------|-----|---------|---------|
| **Hacker News** | 技术社区 | [Firebase API](https://github.com/HackerNews/API) | 技术讨论、深度分析 | 实时 |
| **Reddit** | 社区论坛 | 公开JSON API | 多样化观点、社区反馈 | 实时 |
| **TechCrunch** | 科技媒体 | RSS Feed | 产品发布、融资新闻 | 每小时 |
| **The Verge** | 科技媒体 | RSS Feed | 行业动态、深度报道 | 每小时 |
| **MIT Tech Review** | 学术媒体 | RSS Feed | 技术趋势、研究进展 | 每日 |
| **VentureBeat** | 商业媒体 | RSS Feed | 商业分析、市场动态 | 每小时 |
| **arXiv** | 学术论文 | [XML API](https://info.arxiv.org/help/api/) | 最新研究论文 | 每日 |

### Reddit子版块

系统监控以下7个AI相关subreddit：

- `r/MachineLearning` - 机器学习
- `r/artificial` - 人工智能
- `r/deeplearning` - 深度学习
- `r/LanguageTechnology` - 自然语言处理
- `r/computervision` - 计算机视觉
- `r/OpenAI` - OpenAI相关
- `r/LocalLLaMA` - 本地大模型

### 数据获取流程

```
1. 并行请求所有数据源 (Promise.allSettled)
   ↓
2. 智能过滤（只保留AI相关内容）
   ↓
3. 数据清洗（去除HTML、标准化格式）
   ↓
4. 去重（URL + 标题相似度）
   ↓
5. 统一格式（RawNewsItem接口）
```

### 容错机制

- ✅ 单个数据源失败不影响其他源
- ✅ 网络超时自动跳过（10秒超时）
- ✅ 至少保证部分数据可用
- ✅ 详细日志记录失败原因

### 实际测试结果（2026-04-07）

```
成功获取：93条真实数据
- Reddit: 63条 ✅
- TechCrunch: 20条 ✅
- The Verge: 10条 ✅
- Hacker News: 超时 ⚠️
- arXiv: 超时 ⚠️
- 其他RSS: 部分超时 ⚠️

处理时间：~5秒（数据获取）+ ~2秒（规则引擎分析）
```

---

## 🤖 AI处理说明

### 双模式架构

系统支持两种AI处理模式，可根据需求选择：

| 模式 | 技术 | 优势 | 劣势 | 适用场景 |
|------|------|------|------|---------|
| **规则引擎** | Natural + Sentiment | ✅ 完全免费<br>✅ 无需API Key<br>✅ 速度快（~2秒） | ⚠️ 分析深度有限 | 日常使用、成本敏感 |
| **OpenAI** | GPT-3.5 + GPT-4 | ✅ 分析质量高<br>✅ 理解能力强 | ⚠️ 需要API Key<br>⚠️ 有成本（~$0.50/次） | 深度分析、专业报告 |

### 规则引擎模式（v2.0新增）

**核心能力**:
- 关键词提取（TF-IDF算法）
- 自动分类（正则匹配）
- 实体识别（预定义词典）
- 情感分析（sentiment库）
- 事件类型检测
- 重要性评分

**技术栈**:
```json
{
  "natural": "^8.1.1",      // NLP工具包
  "sentiment": "^5.0.2",    // 情感分析
  "cheerio": "^1.2.0"       // HTML处理
}
```

**使用方式**:
- 自动模式：系统检测到没有OpenAI API Key时自动启用
- 手动模式：在配置中设置 `USE_RULE_ENGINE=true`

### OpenAI模式

**分层处理策略**:

1. **第一层：基础提取**（GPT-3.5-turbo）
   - 批处理：5条新闻/批
   - 提取：分类、标签、实体
   - 成本：~$0.02/批

2. **第二层：深度分析**（GPT-4）
   - 情感分析、影响评估
   - 趋势判断、洞察生成
   - 成本：~$0.12/次

### 自动降级机制

```typescript
try {
  // 尝试使用OpenAI API
  return await this.callOpenAI(...);
} catch (error) {
  // API失败，自动回退到规则引擎
  console.log('[AI] API失败，回退到规则引擎');
  return ruleAnalyzer.extractBasicInfo(items);
}
```

### 成本对比（93条新闻）

| 模式 | 处理时间 | 成本 | 质量 |
|------|---------|------|------|
| 规则引擎 | ~2秒 | $0 | ⭐⭐⭐ |
| OpenAI | ~80秒 | ~$0.50 | ⭐⭐⭐⭐⭐ |
- **报告生成**：~$0.18（GPT-4）
- **总成本**：~$0.32 / 日报

详细成本分析请参考：[成本分析文档](./docs/ai-usage/03-cost-analysis.md)

---

## 📊 数据源说明

### 当前支持的数据源

| 数据源 | 类型 | 内容特点 | 更新频率 |
|-------|------|---------|---------|
| **Hacker News** | API | 技术深度讨论 | 实时 |
| **Reddit r/MachineLearning** | API | 学术研究、社区讨论 | 实时 |
| **TechCrunch AI** | RSS | 行业新闻、产品发布 | 每日 |
| **The Verge AI** | RSS | 科技资讯、评测 | 每日 |
| **arXiv AI** | API | 学术论文 | 每日 |

### 数据选择理由

- **技术深度**：Hacker News、arXiv提供技术讨论和学术研究
- **行业动态**：TechCrunch、The Verge提供商业和产品新闻
- **社区观点**：Reddit提供开发者和研究者的真实讨论
- **中英混合**：覆盖国际和本土视角

---

## 📈 示例报告

### 报告结构

```markdown
# 2026年4月7日 AI领域日报

## 一、今日概览
- 数据来源：5个数据源
- 新闻总数：20条
- 重要事件：3个
- 情感分布：70%正面，20%中性，10%负面

## 二、今日AI领域主要热点

### 1. GPT-5发布在即，OpenAI透露重大突破
[高重要性] [产品发布] [影响：行业、市场]
OpenAI CEO Sam Altman在内部会议中透露...

### 2. 欧盟AI法案正式生效
[高重要性] [政策法规] [影响：政策、行业]
...

## 三、重要事件深度分析
...

## 四、趋势判断与洞察
...
```

完整示例请参考：[示例报告](./docs/examples/sample-report.md)

---

## 🎨 设计理念

本项目的UI设计参考**Impeccable设计风格**：

- **简洁优雅**：去除不必要的装饰，专注内容
- **层次分明**：清晰的视觉层级，引导阅读
- **阅读优先**：优化排版和字体，提升阅读体验
- **数据可视化**：直观的图表展示，快速理解趋势

---

## 🔧 开发指南

### 添加新数据源

1. 在 `backend/src/services/data-fetcher/sources/` 创建新的数据源文件
2. 实现 `DataSource` 接口
3. 在 `config/data-sources.ts` 注册新数据源

```typescript
// backend/src/services/data-fetcher/sources/my-source.ts
export class MyDataSource implements DataSource {
  async fetch(date: Date): Promise<RawNewsItem[]> {
    // 实现数据获取逻辑
  }
}
```

### 优化Prompt

1. 修改 `backend/src/services/ai-processor/prompts/` 中的Prompt
2. 运行A/B测试脚本对比效果
3. 更新文档记录优化历史

### 添加新的可视化

1. 在 `web/src/components/charts/` 创建新图表组件
2. 在 `web/src/pages/Report.tsx` 中引入
3. 在 `backend/src/services/report-generator/` 准备数据

---

## 🧪 测试

```bash
# 后端测试
cd backend
yarn test

# 前端测试
cd web
yarn test

# E2E测试
yarn test:e2e
```

---

## 📝 文档索引

### 设计文档
- [需求分析与设计方案](./docs/design/01-brainstorming-summary.md)
- [数据Schema设计](./docs/design/02-data-schema.md)
- [UI设计说明](./docs/design/03-ui-design.md)

### 架构文档
- [系统架构设计](./docs/architecture/01-system-architecture.md)
- [数据流设计](./docs/architecture/02-data-flow.md)
- [技术栈说明](./docs/architecture/03-tech-stack.md)

### AI使用文档
- [Prompt设计](./docs/ai-usage/01-prompt-design.md)
- [错误处理](./docs/ai-usage/02-error-handling.md)
- [成本分析](./docs/ai-usage/03-cost-analysis.md)

### 功能文档
- [国际化指南](./docs/features/i18n-guide.md)

### 示例文档
- [示例报告](./docs/examples/sample-report.md)
- [示例数据](./docs/examples/sample-data.json)

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 👥 作者

- **Your Name** - [GitHub](https://github.com/yourusername)

---

## 🙏 致谢

- OpenAI - 提供强大的AI能力
- Hacker News、Reddit等 - 提供优质数据源
- React、Vite等开源项目 - 提供优秀的开发工具

---

## 📮 联系方式

- 项目主页：https://github.com/yourusername/daily-ai-insight-engine
- 问题反馈：https://github.com/yourusername/daily-ai-insight-engine/issues
- 邮箱：your.email@example.com

---

**最后更新**：2026-04-07
