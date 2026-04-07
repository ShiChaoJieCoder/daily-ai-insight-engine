/**
 * 核心数据类型定义
 */

// ========== 原始数据类型 ==========

export interface RawNewsItem {
  title: string;
  content: string;
  url: string;
  source: string;
  publishDate: Date;
  author?: string;
  language?: 'zh' | 'en';  // 语言标识
}

// ========== 结构化数据类型 ==========

export interface NewsItem {
  // 基础信息
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: {
    name: string;
    type: string;
    url: string;
  };
  publishDate: Date;
  
  // 分类维度
  category: 'research' | 'product' | 'funding' | 'policy' | 'discussion';
  tags: string[];
  
  // 实体提取
  entities: {
    companies: string[];
    products: string[];
    technologies: string[];
    people: string[];
  };
  
  // 事件分析
  eventType: 'breakthrough' | 'release' | 'funding' | 'regulation' | 'discussion';
  significance: number;  // 1-10
  
  // 分析维度
  sentiment: {
    score: number;       // -1 到 1
    label: 'positive' | 'neutral' | 'negative';
    confidence: number;  // 0-1
    reasoning?: string;
  };
  
  impact: {
    level: 'high' | 'medium' | 'low';
    areas: string[];
    timeline: 'immediate' | 'short-term' | 'long-term';
    stakeholders: string[];
    reasoning?: string;
  };
  
  // 趋势标签
  trendIndicators: string[];
  
  // 元数据
  _needsReview?: boolean;
  _fallbackReason?: string;
}

export interface PartialNewsItem extends Partial<NewsItem> {
  id: string;
  title: string;
  content?: string;
}

// ========== 报告类型 ==========

export interface DailyReport {
  meta: {
    date: Date;
    generatedAt: Date;
    dataSourceCount: number;
    newsCount: number;
    version: string;
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

export interface HotTopic {
  rank: number;
  title: string;
  significance: number;
  eventType: string;
  summary: string;
  impactAreas: string[];
  relatedNews: string[];  // IDs of related news items
}

export interface KeyMetrics {
  totalNews: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  eventTypeDistribution: Record<string, number>;
  topCompanies: Array<{ name: string; count: number }>;
  topTechnologies: Array<{ name: string; count: number }>;
}

export interface DeepDiveAnalysis {
  newsId: string;
  title: string;
  background: string;
  impactAnalysis: {
    industry?: string;
    technology?: string;
    market?: string;
    society?: string;
  };
  keyInsights: string[];
}

export interface TrendAnalysis {
  technology: string[];
  application: string[];
  policy: string[];
  capital: string[];
}

export interface VisualizationData {
  eventTypeChart: ChartData;
  sentimentTrendChart: ChartData;
  companyWordCloud: WordCloudData;
  technologyBarChart: ChartData;
}

export interface ChartData {
  type: 'pie' | 'line' | 'bar' | 'area';
  data: Array<Record<string, any>>;
  config?: Record<string, any>;
}

export interface WordCloudData {
  words: Array<{ text: string; value: number }>;
}

// ========== 数据源类型 ==========

export interface DataSource {
  name: string;
  type: 'rss' | 'api';
  url: string;
  parser: string;
  enabled: boolean;
}

// ========== 验证类型 ==========

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: any;
}

export interface Anomaly {
  type: 'outlier' | 'duplicate' | 'inconsistent';
  field: string;
  value: any;
  reason: string;
}

// ========== AI相关类型 ==========

export interface AIModel {
  provider: 'openai' | 'anthropic' | 'aliyun';
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIResponse<T = any> {
  data: T;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// ========== 配置类型 ==========

export interface Config {
  openai: {
    apiKey: string;
    organization?: string;
    models: {
      light: string;
      strong: string;
    };
  };
  dataSources: DataSource[];
  processing: {
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
  };
  server: {
    port: number;
    cors: {
      origin: string | string[];
    };
  };
}
