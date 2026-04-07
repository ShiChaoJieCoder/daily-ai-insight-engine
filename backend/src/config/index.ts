import dotenv from 'dotenv';
import { Config, DataSource } from '../types/index.js';

// 加载环境变量
dotenv.config({ path: './config/.env' });

// 数据源配置
export const DATA_SOURCES: DataSource[] = [
  // 技术深度型
  {
    name: 'Hacker News',
    type: 'api',
    url: process.env.HACKERNEWS_API_URL || 'https://hacker-news.firebaseio.com/v0',
    parser: 'hackernews',
    enabled: true
  },
  {
    name: 'arXiv AI',
    type: 'api',
    url: 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10',
    parser: 'arxiv',
    enabled: true
  },
  
  // 行业资讯型
  {
    name: 'TechCrunch AI',
    type: 'rss',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
    parser: 'rss',
    enabled: true
  },
  {
    name: 'The Verge AI',
    type: 'rss',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    parser: 'rss',
    enabled: true
  },
  
  // 社区讨论型
  {
    name: 'Reddit r/MachineLearning',
    type: 'api',
    url: process.env.REDDIT_API_URL || 'https://www.reddit.com',
    parser: 'reddit',
    enabled: true
  }
];

// 完整配置
export const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG_ID,
    models: {
      light: 'gpt-3.5-turbo',
      strong: 'gpt-4'
    }
  },
  
  dataSources: DATA_SOURCES,
  
  processing: {
    batchSize: parseInt(process.env.BATCH_SIZE || '5'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000')
  },
  
  server: {
    port: parseInt(process.env.PORT || '3000'),
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
    }
  }
};

// 验证配置
export function validateConfig(): void {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }
  
  console.log('✓ Configuration validated');
}
