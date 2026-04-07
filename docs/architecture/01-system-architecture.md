# 系统架构设计文档

> 版本：v1.0  
> 创建时间：2026-04-07  
> 最后更新：2026-04-07

## 一、架构概览

### 1.1 系统定位
AI舆情分析日报系统是一个**数据驱动的分析报告生成系统**，通过AI技术将分散的新闻信息转化为结构化洞察和可读报告。

### 1.2 核心能力
- 🔄 自动化数据采集（RSS/API）
- 🤖 AI驱动的信息提取与分析
- 📊 多维度数据可视化
- 📝 智能报告生成

### 1.3 架构风格
- **前后端分离**：前端专注展示，后端专注数据处理
- **服务化设计**：数据获取、AI处理、报告生成独立服务
- **数据驱动**：以数据流转为核心的处理流程

---

## 二、系统架构图

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户层                                   │
│                     Web Browser / Client                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        前端应用层                                 │
│                   React + TypeScript + Vite                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  报告展示页   │  │  数据探索页   │  │  配置管理页   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌────────────────────────────────────────────────────┐         │
│  │           状态管理层 (Zustand)                      │         │
│  │  - 报告数据状态                                     │         │
│  │  - UI状态                                          │         │
│  │  - 筛选条件状态                                     │         │
│  └────────────────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────────────────┐         │
│  │           可视化组件层 (Recharts)                   │         │
│  │  - 图表组件                                         │         │
│  │  - 数据转换                                         │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        后端服务层                                 │
│                   Node.js + Express/Fastify                      │
│  ┌────────────────────────────────────────────────────┐         │
│  │              API路由层 (Routes)                     │         │
│  │  GET  /api/reports/:date    - 获取指定日期报告      │         │
│  │  GET  /api/reports/latest   - 获取最新报告          │         │
│  │  POST /api/reports/generate - 生成新报告            │         │
│  │  GET  /api/data/raw         - 获取原始数据          │         │
│  │  GET  /api/health           - 健康检查              │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │            业务逻辑层 (Services)                     │         │
│  │                                                     │         │
│  │  ┌─────────────────────────────────────────┐      │         │
│  │  │  数据获取服务 (DataFetcherService)       │      │         │
│  │  │  - RSS订阅管理                          │      │         │
│  │  │  - API调用封装                          │      │         │
│  │  │  - 数据去重与清洗                        │      │         │
│  │  └─────────────────────────────────────────┘      │         │
│  │                                                     │         │
│  │  ┌─────────────────────────────────────────┐      │         │
│  │  │  AI处理服务 (AIProcessorService)         │      │         │
│  │  │  - 基础提取 (轻量模型)                   │      │         │
│  │  │  - 深度分析 (强模型)                     │      │         │
│  │  │  - Prompt管理                           │      │         │
│  │  │  - 结果验证                             │      │         │
│  │  └─────────────────────────────────────────┘      │         │
│  │                                                     │         │
│  │  ┌─────────────────────────────────────────┐      │         │
│  │  │  报告生成服务 (ReportGeneratorService)   │      │         │
│  │  │  - 热点提取                             │      │         │
│  │  │  - 趋势分析                             │      │         │
│  │  │  - 报告渲染                             │      │         │
│  │  └─────────────────────────────────────────┘      │         │
│  │                                                     │         │
│  │  ┌─────────────────────────────────────────┐      │         │
│  │  │  数据验证服务 (ValidationService)        │      │         │
│  │  │  - 格式验证                             │      │         │
│  │  │  - 逻辑校验                             │      │         │
│  │  │  - 异常检测                             │      │         │
│  │  └─────────────────────────────────────────┘      │         │
│  └────────────────────────────────────────────────────┘         │
│                         │                                        │
│  ┌────────────────────────────────────────────────────┐         │
│  │            工具层 (Utils)                           │         │
│  │  - HTTP客户端                                       │         │
│  │  - 日志工具                                         │         │
│  │  - 缓存管理                                         │         │
│  │  - 错误处理                                         │         │
│  └────────────────────────────────────────────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      外部服务层                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AI服务      │  │  数据源API   │  │  缓存服务     │          │
│  │  OpenAI      │  │  HN API      │  │  (可选)      │          │
│  │  Claude      │  │  Reddit API  │  │              │          │
│  │  通义千问     │  │  RSS Feeds   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      数据存储层                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │  文件系统存储 (JSON)                              │           │
│  │  ├── data/raw/              原始数据              │           │
│  │  ├── data/processed/        结构化数据            │           │
│  │  └── data/reports/          生成的报告            │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、核心模块设计

### 3.1 数据获取服务 (DataFetcherService)

#### 职责
- 从多个数据源获取AI相关新闻
- 统一数据格式
- 去重与清洗

#### 接口设计

```typescript
interface DataFetcherService {
  /**
   * 获取指定日期的新闻数据
   * @param date 日期
   * @param sources 数据源列表
   * @returns 原始新闻数据
   */
  fetchNews(date: Date, sources: DataSource[]): Promise<RawNewsItem[]>;
  
  /**
   * 数据清洗
   * @param items 原始数据
   * @returns 清洗后的数据
   */
  cleanData(items: RawNewsItem[]): Promise<RawNewsItem[]>;
  
  /**
   * 数据去重
   * @param items 数据列表
   * @returns 去重后的数据
   */
  deduplicateData(items: RawNewsItem[]): RawNewsItem[];
}

interface DataSource {
  name: string;           // 数据源名称
  type: 'rss' | 'api';   // 数据源类型
  url: string;            // 数据源URL
  parser: string;         // 解析器名称
}

interface RawNewsItem {
  title: string;
  content: string;
  url: string;
  source: string;
  publishDate: Date;
  author?: string;
}
```

#### 数据源配置

```typescript
const DATA_SOURCES: DataSource[] = [
  // 技术深度型
  {
    name: 'Hacker News',
    type: 'api',
    url: 'https://hacker-news.firebaseio.com/v0',
    parser: 'hackernews'
  },
  {
    name: 'arXiv AI',
    type: 'api',
    url: 'http://export.arxiv.org/api/query?search_query=cat:cs.AI',
    parser: 'arxiv'
  },
  
  // 行业资讯型
  {
    name: 'TechCrunch AI',
    type: 'rss',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
    parser: 'rss'
  },
  {
    name: 'The Verge AI',
    type: 'rss',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    parser: 'rss'
  },
  
  // 社区讨论型
  {
    name: 'Reddit r/MachineLearning',
    type: 'api',
    url: 'https://www.reddit.com/r/MachineLearning/hot.json',
    parser: 'reddit'
  }
];
```

---

### 3.2 AI处理服务 (AIProcessorService)

#### 职责
- 基础信息提取（轻量模型）
- 深度分析（强模型）
- Prompt管理
- 结果验证与重试

#### 接口设计

```typescript
interface AIProcessorService {
  /**
   * 基础提取：分类、标签、实体识别
   * @param items 原始数据
   * @returns 基础结构化数据
   */
  extractBasicInfo(items: RawNewsItem[]): Promise<PartialNewsItem[]>;
  
  /**
   * 深度分析：情感、影响、趋势
   * @param items 基础结构化数据
   * @returns 完整结构化数据
   */
  analyzeInDepth(items: PartialNewsItem[]): Promise<NewsItem[]>;
  
  /**
   * 批处理优化
   * @param items 数据列表
   * @param batchSize 批次大小
   * @returns 处理结果
   */
  processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number
  ): Promise<R[]>;
}

interface AIModel {
  provider: 'openai' | 'anthropic' | 'aliyun';
  model: string;
  temperature: number;
  maxTokens: number;
}

// 模型配置
const MODELS = {
  light: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1000
  },
  strong: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2000
  }
};
```

#### Prompt设计

```typescript
const PROMPTS = {
  // 基础提取Prompt
  basicExtraction: `
你是一个AI新闻分析专家。请分析以下新闻，提取结构化信息。

新闻列表：
{news_items}

请返回JSON格式，包含以下字段：
- category: 分类（research/product/funding/policy/discussion）
- tags: 标签列表（如：LLM, Computer Vision等）
- entities: 实体信息
  - companies: 公司列表
  - products: 产品列表
  - technologies: 技术列表
  - people: 人物列表

要求：
1. 只返回JSON，不要其他文字
2. 确保JSON格式正确
3. 如果某个字段不确定，返回空数组
`,

  // 深度分析Prompt
  deepAnalysis: `
你是一个AI行业分析专家。基于以下结构化新闻数据，进行深度分析。

数据：
{structured_data}

请分析并返回JSON格式，包含：
- sentiment: 情感分析
  - score: -1到1的分数
  - label: positive/neutral/negative
  - confidence: 0-1的置信度
- impact: 影响评估
  - level: high/medium/low
  - areas: 影响领域列表
  - timeline: immediate/short-term/long-term
- significance: 重要性评分（1-10）
- trendIndicators: 趋势指标列表

要求：
1. 分析要有依据，不要空洞描述
2. 数值要在合理范围内
3. 只返回JSON格式
`
};
```

---

### 3.3 报告生成服务 (ReportGeneratorService)

#### 职责
- 热点事件提取
- 趋势分析生成
- 报告渲染

#### 接口设计

```typescript
interface ReportGeneratorService {
  /**
   * 生成完整报告
   * @param items 结构化数据
   * @param date 报告日期
   * @returns 报告对象
   */
  generateReport(items: NewsItem[], date: Date): Promise<DailyReport>;
  
  /**
   * 提取热点事件
   * @param items 结构化数据
   * @param topN 返回前N个
   * @returns 热点事件列表
   */
  extractHotTopics(items: NewsItem[], topN: number): HotTopic[];
  
  /**
   * 生成趋势分析
   * @param items 结构化数据
   * @returns 趋势分析
   */
  analyzeTrends(items: NewsItem[]): TrendAnalysis;
  
  /**
   * 生成可视化数据
   * @param items 结构化数据
   * @returns 可视化配置
   */
  prepareVisualization(items: NewsItem[]): VisualizationData;
}

interface DailyReport {
  meta: {
    date: Date;
    generatedAt: Date;
    dataSourceCount: number;
    newsCount: number;
  };
  summary: {
    hotTopics: HotTopic[];
    keyMetrics: KeyMetrics;
  };
  analysis: {
    deepDive: DeepDiveAnalysis[];
    trends: TrendAnalysis;
  };
  visualization: VisualizationData;
  rawData: NewsItem[];
}
```

---

### 3.4 数据验证服务 (ValidationService)

#### 职责
- 格式验证
- 逻辑校验
- 异常检测

#### 接口设计

```typescript
interface ValidationService {
  /**
   * 验证数据格式
   * @param data 待验证数据
   * @returns 验证结果
   */
  validateFormat(data: any): ValidationResult;
  
  /**
   * 验证业务逻辑
   * @param item 新闻项
   * @returns 验证结果
   */
  validateLogic(item: NewsItem): ValidationResult;
  
  /**
   * 检测异常数据
   * @param items 数据列表
   * @returns 异常列表
   */
  detectAnomalies(items: NewsItem[]): Anomaly[];
  
  /**
   * 数据清洗
   * @param item 新闻项
   * @returns 清洗后的数据
   */
  cleanItem(item: NewsItem): NewsItem;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface Anomaly {
  type: 'outlier' | 'duplicate' | 'inconsistent';
  field: string;
  value: any;
  reason: string;
}
```

---

## 四、数据流设计

### 4.1 完整数据流

```
[用户触发] → [后端API] → [数据获取] → [数据清洗] → [AI基础提取] 
→ [数据验证] → [AI深度分析] → [数据验证] → [报告生成] 
→ [数据存储] → [API返回] → [前端展示]
```

### 4.2 详细流程

```typescript
async function generateDailyReport(date: Date): Promise<DailyReport> {
  // 1. 数据获取
  const rawData = await dataFetcher.fetchNews(date, DATA_SOURCES);
  console.log(`获取到 ${rawData.length} 条原始数据`);
  
  // 2. 数据清洗
  const cleanedData = await dataFetcher.cleanData(rawData);
  const deduplicatedData = dataFetcher.deduplicateData(cleanedData);
  console.log(`清洗后剩余 ${deduplicatedData.length} 条数据`);
  
  // 3. AI基础提取（批处理）
  const basicExtracted = await aiProcessor.processBatch(
    deduplicatedData,
    (batch) => aiProcessor.extractBasicInfo(batch),
    5  // 每批5条
  );
  console.log(`基础提取完成`);
  
  // 4. 数据验证
  const validatedBasic = basicExtracted.filter(item => 
    validator.validateFormat(item).isValid
  );
  console.log(`验证通过 ${validatedBasic.length} 条数据`);
  
  // 5. AI深度分析
  const fullyAnalyzed = await aiProcessor.analyzeInDepth(validatedBasic);
  console.log(`深度分析完成`);
  
  // 6. 数据验证与清洗
  const validatedFull = fullyAnalyzed
    .filter(item => validator.validateLogic(item).isValid)
    .map(item => validator.cleanItem(item));
  
  // 7. 异常检测
  const anomalies = validator.detectAnomalies(validatedFull);
  if (anomalies.length > 0) {
    console.warn(`检测到 ${anomalies.length} 个异常数据`);
  }
  
  // 8. 生成报告
  const report = await reportGenerator.generateReport(validatedFull, date);
  console.log(`报告生成完成`);
  
  // 9. 保存数据
  await saveReport(report);
  
  return report;
}
```

---

## 五、技术选型

### 5.1 前端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|-----|------|------|---------|
| React | 19.x | UI框架 | 组件化开发，生态完善 |
| TypeScript | 6.x | 类型系统 | 类型安全，提高代码质量 |
| Vite | 8.x | 构建工具 | 快速开发，HMR体验好 |
| Zustand | 5.x | 状态管理 | 轻量简洁，学习成本低 |
| SCSS | - | 样式预处理 | 支持嵌套和变量 |
| Recharts | 3.x | 数据可视化 | React原生，易于集成 |
| Radix UI | - | 无障碍组件 | 可访问性好，可定制 |

### 5.2 后端技术栈

| 技术 | 版本 | 用途 | 选型理由 |
|-----|------|------|---------|
| Node.js | 20.x | 运行时 | JavaScript全栈，生态丰富 |
| Express/Fastify | - | Web框架 | 成熟稳定，中间件丰富 |
| TypeScript | 5.x | 类型系统 | 前后端统一语言 |
| Axios | - | HTTP客户端 | 功能完善，易用 |
| RSS Parser | - | RSS解析 | 专业RSS处理 |

### 5.3 AI服务

| 服务 | 用途 | 成本 |
|-----|------|------|
| OpenAI GPT-3.5 | 基础提取 | 低 |
| OpenAI GPT-4 | 深度分析 | 中 |
| Claude | 备选方案 | 中 |
| 通义千问 | 中文优化 | 低 |

---

## 六、部署架构

### 6.1 开发环境

```
本地开发：
- 前端：npm run dev (Vite Dev Server, Port 5173)
- 后端：npm run dev (Nodemon, Port 3000)
- 数据：本地文件系统
```

### 6.2 生产环境（推荐）

```
┌─────────────────────────────────────────┐
│          CDN / Static Hosting           │
│        (Vercel / Netlify / CF)          │
│         前端静态资源                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Backend Service                │
│      (Vercel Functions / Railway)       │
│         Node.js API                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Object Storage                 │
│        (S3 / OSS / R2)                  │
│         数据文件存储                      │
└─────────────────────────────────────────┘
```

---

## 七、性能优化

### 7.1 前端优化
- 代码分割（React.lazy）
- 图片懒加载
- 虚拟滚动（长列表）
- 缓存策略（Service Worker）

### 7.2 后端优化
- API批处理
- 结果缓存
- 并发控制
- 连接池

### 7.3 AI调用优化
- Prompt优化（减少token）
- 批处理（减少调用次数）
- 缓存机制（避免重复调用）
- 降级策略（失败兜底）

---

## 八、安全设计

### 8.1 API密钥管理
- 环境变量存储
- 不提交到Git
- 定期轮换

### 8.2 数据安全
- 输入验证
- 输出转义
- HTTPS传输

### 8.3 访问控制
- Rate Limiting
- CORS配置
- API认证（可选）

---

## 九、监控与日志

### 9.1 日志设计

```typescript
interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  meta?: any;
}

// 关键日志点
- 数据获取开始/结束
- AI调用开始/结束/失败
- 数据验证失败
- 报告生成完成
- 错误堆栈
```

### 9.2 监控指标
- API响应时间
- AI调用成功率
- 数据处理成功率
- 报告生成时长
- 错误率

---

## 十、扩展性设计

### 10.1 数据源扩展
- 插件化数据源
- 统一解析器接口
- 配置化管理

### 10.2 AI模型扩展
- 抽象AI服务接口
- 支持多模型切换
- A/B测试能力

### 10.3 报告格式扩展
- 模板化报告
- 多格式导出（PDF、Word）
- 自定义报告配置

---

**文档维护**：随着系统演进，本文档将持续更新
