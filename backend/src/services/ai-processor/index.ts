/**
 * AI处理服务
 * 负责调用AI模型进行信息提取和分析
 */

import OpenAI from 'openai';
import { config } from '../../config/index.js';
import { PROMPTS, fillPromptTemplate } from './prompts.js';
import type { RawNewsItem, PartialNewsItem, NewsItem, AIResponse } from '../../types/index.js';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIProcessorService {
  private openai?: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.organization
    });
    console.log('✓ 使用 OpenAI API');
  }
  
  /**
   * 基础信息提取（批处理）
   * 使用GPT-3.5-turbo，成本低，速度快
   */
  async extractBasicInfo(items: RawNewsItem[]): Promise<PartialNewsItem[]> {
    console.log(`[AI] 开始基础提取，共 ${items.length} 条新闻`);
    
    // 构造输入数据
    const newsItemsText = items.map((item, idx) => `
【新闻 ${idx + 1}】
ID: ${item.url}
标题：${item.title}
内容：${item.content.substring(0, 500)}${item.content.length > 500 ? '...' : ''}
来源：${item.source}
发布时间：${item.publishDate.toISOString()}
    `).join('\n---\n');
    
    // 填充Prompt
    const prompt = fillPromptTemplate(PROMPTS.basicExtraction, {
      count: items.length.toString(),
      news_items: newsItemsText
    });
    
    try {
      // 调用AI
      const response = await this.callAI({
        model: config.openai.models.light,
        messages: [
          { role: 'system', content: '你是一个专业的AI新闻分析助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 2000
      });
      
      // 解析结果
      const content = response.content || '[]';
      const extracted = this.parseJSON(content);
      
      console.log(`[AI] 基础提取完成，成功 ${extracted.length} 条`);
      
      // 合并原始数据
      return extracted.map((item: any, idx: number) => ({
        ...items[idx],
        id: items[idx].url,
        summary: items[idx].content.substring(0, 200),
        source: {
          name: items[idx].source,
          type: 'unknown',
          url: items[idx].url
        },
        ...item
      }));
      
    } catch (error) {
      console.error('[AI] 基础提取失败:', error);
      throw error;
    }
  }
  
  /**
   * 深度分析
   * 使用GPT-4，进行情感分析、影响评估等
   */
  async analyzeInDepth(items: PartialNewsItem[]): Promise<NewsItem[]> {
    console.log(`[AI] 开始深度分析，共 ${items.length} 条新闻`);
    
    // 构造结构化数据
    const structuredData = JSON.stringify(items.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || item.content?.substring(0, 200),
      category: item.category,
      eventType: item.eventType,
      tags: item.tags,
      entities: item.entities
    })), null, 2);
    
    // 填充Prompt
    const prompt = fillPromptTemplate(PROMPTS.deepAnalysis, {
      structured_news_data: structuredData
    });
    
    try {
      // 调用AI
      const response = await this.callAI({
        model: config.openai.models.strong,
        messages: [
          { role: 'system', content: '你是一个资深的AI行业分析专家。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        maxTokens: 3000
      });
      
      // 解析结果
      const content = response.content || '[]';
      const analyzed = this.parseJSON(content);
      
      console.log(`[AI] 深度分析完成`);
      
      // 合并数据
      return items.map((item, idx) => ({
        ...item,
        ...(analyzed[idx] || {}),
        // 确保必填字段存在
        sentiment: analyzed[idx]?.sentiment || {
          score: 0,
          label: 'neutral',
          confidence: 0.5
        },
        impact: analyzed[idx]?.impact || {
          level: 'low',
          areas: [],
          timeline: 'immediate',
          stakeholders: []
        },
        significance: analyzed[idx]?.significance || 5,
        trendIndicators: analyzed[idx]?.trendIndicators || []
      })) as NewsItem[];
      
    } catch (error) {
      console.error('[AI] 深度分析失败:', error);
      throw error;
    }
  }
  
  /**
   * 批处理
   * 将大量数据分批处理，提高效率
   */
  async processBatch<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = config.processing.batchSize
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(`[Batch] 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
      
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // 避免API限流
      if (i + batchSize < items.length) {
        await this.sleep(1000);
      }
    }
    
    return results;
  }
  
  /**
   * 统一的AI调用接口（带重试）
   */
  private async callAI(
    params: {
      model: string;
      messages: ChatMessage[];
      temperature?: number;
      maxTokens?: number;
    },
    retries: number = config.processing.maxRetries
  ): Promise<{ content: string; usage?: any }> {
    for (let i = 0; i < retries; i++) {
      try {
        if (!this.openai) throw new Error('OpenAI client not initialized');
        
        const response = await this.openai.chat.completions.create({
          model: params.model,
          messages: params.messages as any,
          temperature: params.temperature,
          max_tokens: params.maxTokens
        });
        
        return {
          content: response.choices[0].message.content || '',
          usage: response.usage
        };
      } catch (error: any) {
        console.error(`[AI] 调用失败 (尝试 ${i + 1}/${retries}):`, error.message);
        
        if (i === retries - 1) {
          throw error;
        }
        
        // 指数退避
        await this.sleep(config.processing.retryDelay * Math.pow(2, i));
      }
    }
    
    throw new Error('AI调用失败');
  }
  
  /**
   * 解析JSON（容错处理）
   */
  private parseJSON(content: string): any[] {
    try {
      // 尝试直接解析
      return JSON.parse(content);
    } catch (error) {
      // 移除 markdown 代码块标记（支持多种格式）
      let cleaned = content
        .replace(/^```json\s*/gm, '')
        .replace(/^```\s*/gm, '')
        .replace(/```\s*$/gm, '')
        .trim();
      
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        // 尝试提取JSON数组部分（更宽松的匹配）
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e2) {
            // 最后尝试：查找第一个 [ 到最后一个 ]
            const firstBracket = cleaned.indexOf('[');
            const lastBracket = cleaned.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              try {
                const extracted = cleaned.substring(firstBracket, lastBracket + 1);
                return JSON.parse(extracted);
              } catch (e3) {
                console.error('[AI] JSON解析失败，内容长度:', content.length);
                return [];
              }
            }
            console.error('[AI] JSON解析失败，无法提取数组');
            return [];
          }
        }
        
        console.error('[AI] 无法提取JSON');
        return [];
      }
    }
  }
  
  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
export const aiProcessor = new AIProcessorService();
