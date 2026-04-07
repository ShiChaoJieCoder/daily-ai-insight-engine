# AI舆情分析日报系统 (Daily AI Insight Engine)

> 从每日新闻信息中提取结构化洞察，生成可读的分析报告与可视化结果

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

## 📋 项目简介

本系统是一个**AI驱动的舆情分析日报生成系统**，专注于AI行业的信息分析。通过自动化采集、AI处理和可视化展示，将分散的新闻信息转化为结构化洞察和专业报告。

### 核心功能

- 🔄 **自动化数据采集**：从多个数据源（Hacker News、Reddit、TechCrunch等）获取AI相关新闻
- 🤖 **AI智能分析**：使用GPT-3.5/GPT-4进行信息提取、情感分析、影响评估
- 📊 **多维度可视化**：图表展示事件分布、情感趋势、热门话题
- 📝 **专业报告生成**：自动生成包含热点分析、趋势判断的日报
- 🌐 **中英文切换**：一键切换界面语言，支持简体中文和英文

### 应用场景

- AI行业趋势分析
- 舆情监测与风险预警
- 信息快速理解与决策辅助
- 投资研究参考

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
- Express/Fastify（Web框架）
- OpenAI API（AI处理）
- RSS Parser（数据获取）

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
- Yarn >= 4.x
- OpenAI API Key（或其他AI服务）

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
# OpenAI配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_org_id_here

# 数据源配置
HACKERNEWS_API_URL=https://hacker-news.firebaseio.com/v0
REDDIT_API_URL=https://www.reddit.com

# 服务配置
PORT=3000
NODE_ENV=development
```

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

5. **访问应用**

打开浏览器访问：http://localhost:5173

---

## 📖 使用指南

### 生成日报

#### 方式1：通过API

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-04-07"}'
```

#### 方式2：通过脚本

```bash
# 在根目录执行
yarn generate-report --date=2026-04-07

# 或者在 backend 目录执行
cd backend
yarn generate-report --date=2026-04-07
```

#### 方式3：通过前端界面

1. 访问 http://localhost:5173
2. 点击"生成新报告"按钮
3. 选择日期
4. 等待生成完成

### 查看报告

- **Web界面**：http://localhost:5173/reports/latest
- **JSON数据**：`backend/data/reports/2026-04-07-report.json`
- **Markdown报告**：`backend/data/reports/2026-04-07-report.md`

---

## 🤖 AI使用说明

### AI在系统中的应用

本系统在以下环节使用AI技术：

| 环节 | AI模型 | 用途 | 成本占比 |
|-----|--------|------|---------|
| **信息提取** | GPT-3.5-turbo | 分类、标签、实体识别 | ~40% |
| **深度分析** | GPT-4 | 情感分析、影响评估、趋势判断 | ~60% |
| **报告生成** | GPT-4 | 生成分析报告文本 | 包含在深度分析中 |

### Prompt设计思路

我们采用**分层处理**策略：

1. **第一层：基础提取**（轻量模型）
   - 批处理：5-10条新闻一起处理
   - 提取：分类、标签、实体
   - 成本低、速度快

2. **第二层：深度分析**（强模型）
   - 基于结构化数据进行分析
   - 避免重复处理原文
   - 提供推理依据

详细Prompt设计请参考：[Prompt设计文档](./docs/ai-usage/01-prompt-design.md)

### 错误处理机制

- **格式验证**：确保AI返回正确的JSON格式
- **逻辑校验**：验证数值范围、枚举值
- **重试策略**：最多重试3次，指数退避
- **降级策略**：AI失败时使用规则提取兜底

详细错误处理请参考：[错误处理文档](./docs/ai-usage/02-error-handling.md)

### 成本分析

以20条新闻为例：

- **基础提取**：~$0.02（GPT-3.5，批处理）
- **深度分析**：~$0.12（GPT-4，聚合分析）
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
