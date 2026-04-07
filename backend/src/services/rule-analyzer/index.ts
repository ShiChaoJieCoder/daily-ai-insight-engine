/**
 * 规则引擎分析器
 * 使用规则和算法进行内容分析，无需AI API
 */

import natural from 'natural';
// @ts-ignore - sentiment没有类型定义
import Sentiment from 'sentiment';
import type { RawNewsItem, NewsItem, PartialNewsItem } from '../../types/index.js';

const sentiment = new Sentiment();
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export class RuleAnalyzer {
  private tfidf: any;
  
  constructor() {
    this.tfidf = new TfIdf();
  }
  
  /**
   * 基础信息提取
   */
  extractBasicInfo(items: RawNewsItem[]): PartialNewsItem[] {
    console.log(`[RuleAnalyzer] 开始基础提取，共 ${items.length} 条`);
    
    // 构建TF-IDF模型
    items.forEach(item => {
      this.tfidf.addDocument(item.content);
    });
    
    const results: PartialNewsItem[] = items.map((item, index) => {
      // 提取关键词
      const keywords = this.extractKeywords(index);
      
      // 分类
      const category = this.classifyNews(item.title, item.content, keywords);
      
      // 提取实体
      const entities = this.extractEntities(item.title, item.content);
      
      // 事件类型
      const eventType = this.detectEventType(item.title, item.content);
      
      return {
        id: item.url,
        title: item.title,
        summary: this.generateSummary(item.content),
        content: item.content,
        source: {
          name: item.source,
          type: 'api',
          url: item.url
        },
        publishDate: item.publishDate,
        category,
        tags: keywords.slice(0, 5),
        entities,
        eventType,
        significance: this.calculateSignificance(item, keywords)
      };
    });
    
    console.log(`[RuleAnalyzer] 基础提取完成`);
    return results;
  }
  
  /**
   * 深度分析
   */
  analyzeInDepth(items: PartialNewsItem[]): NewsItem[] {
    console.log(`[RuleAnalyzer] 开始深度分析，共 ${items.length} 条`);
    
    const results: NewsItem[] = items.map(item => {
      // 情感分析
      const sentimentResult = this.analyzeSentiment(item.content || '');
      
      // 影响分析
      const impact = this.analyzeImpact(item);
      
      // 趋势指标
      const trendIndicators = this.extractTrendIndicators(item);
      
      return {
        ...item,
        sentiment: sentimentResult,
        impact,
        trendIndicators
      } as NewsItem;
    });
    
    console.log(`[RuleAnalyzer] 深度分析完成`);
    return results;
  }
  
  /**
   * 提取关键词（TF-IDF）
   */
  private extractKeywords(docIndex: number, topN: number = 10): string[] {
    const terms = this.tfidf.listTerms(docIndex);
    return terms
      .slice(0, topN)
      .map((term: any) => term.term)
      .filter((term: string) => term.length > 2); // 过滤太短的词
  }
  
  /**
   * 新闻分类
   */
  private classifyNews(title: string, content: string, keywords: string[]): 'research' | 'product' | 'funding' | 'policy' | 'discussion' {
    const text = (title + ' ' + content).toLowerCase();
    
    // 研究类
    if (text.match(/paper|research|study|arxiv|published|findings|experiment/i)) {
      return 'research';
    }
    
    // 产品类
    if (text.match(/launch|release|announce|unveil|introduce|available/i)) {
      return 'product';
    }
    
    // 融资类
    if (text.match(/funding|investment|raised|series|valuation|venture/i)) {
      return 'funding';
    }
    
    // 政策类
    if (text.match(/regulation|policy|law|government|legislation|compliance/i)) {
      return 'policy';
    }
    
    return 'discussion';
  }
  
  /**
   * 提取实体（公司、产品、技术、人物）
   */
  private extractEntities(title: string, content: string): {
    companies: string[];
    products: string[];
    technologies: string[];
    people: string[];
  } {
    const text = title + ' ' + content;
    
    // 公司名称（预定义列表）
    const companyPatterns = [
      'OpenAI', 'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple',
      'Anthropic', 'DeepMind', 'Tesla', 'NVIDIA', 'Intel', 'AMD',
      'Baidu', 'Alibaba', 'Tencent', 'ByteDance', 'Huawei'
    ];
    
    // 产品名称
    const productPatterns = [
      'GPT', 'ChatGPT', 'GPT-4', 'GPT-5', 'Claude', 'Gemini',
      'Copilot', 'Bard', 'Llama', 'Mistral', 'Stable Diffusion',
      'DALL-E', 'Midjourney'
    ];
    
    // 技术术语
    const techPatterns = [
      'transformer', 'neural network', 'deep learning', 'machine learning',
      'LLM', 'large language model', 'diffusion', 'reinforcement learning',
      'NLP', 'computer vision', 'generative AI', 'AGI'
    ];
    
    return {
      companies: this.findMatches(text, companyPatterns),
      products: this.findMatches(text, productPatterns),
      technologies: this.findMatches(text, techPatterns),
      people: [] // 人名识别较复杂，暂时留空
    };
  }
  
  /**
   * 查找匹配的实体
   */
  private findMatches(text: string, patterns: string[]): string[] {
    const matches = new Set<string>();
    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      if (regex.test(text)) {
        matches.add(pattern);
      }
    });
    return Array.from(matches);
  }
  
  /**
   * 检测事件类型
   */
  private detectEventType(title: string, content: string): 'breakthrough' | 'release' | 'funding' | 'regulation' | 'discussion' {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.match(/breakthrough|discovery|achieve|milestone|record/i)) {
      return 'breakthrough';
    }
    if (text.match(/release|launch|announce|unveil|available/i)) {
      return 'release';
    }
    if (text.match(/funding|raised|investment|series|million|billion/i)) {
      return 'funding';
    }
    if (text.match(/regulation|policy|law|ban|restrict|compliance/i)) {
      return 'regulation';
    }
    
    return 'discussion';
  }
  
  /**
   * 计算重要性得分
   */
  private calculateSignificance(item: RawNewsItem, keywords: string[]): number {
    let score = 5; // 基础分
    
    // 来源权重
    const sourceWeights: Record<string, number> = {
      'arXiv': 2,
      'Hacker News': 1.5,
      'TechCrunch': 1.5,
      'Reddit': 1
    };
    score += sourceWeights[item.source] || 1;
    
    // 关键词权重
    const importantKeywords = ['gpt', 'openai', 'breakthrough', 'funding', 'regulation'];
    const hasImportantKeyword = keywords.some(kw => 
      importantKeywords.some(ik => kw.toLowerCase().includes(ik))
    );
    if (hasImportantKeyword) score += 2;
    
    // 标题长度（太短可能不重要）
    if (item.title.length > 50) score += 1;
    
    // 限制在1-10之间
    return Math.min(10, Math.max(1, Math.round(score)));
  }
  
  /**
   * 情感分析
   */
  private analyzeSentiment(text: string): {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    confidence: number;
    reasoning?: string;
  } {
    const result = sentiment.analyze(text);
    
    // 归一化到-1到1
    const normalizedScore = Math.max(-1, Math.min(1, result.score / 10));
    
    let label: 'positive' | 'neutral' | 'negative';
    if (normalizedScore > 0.2) label = 'positive';
    else if (normalizedScore < -0.2) label = 'negative';
    else label = 'neutral';
    
    return {
      score: normalizedScore,
      label,
      confidence: Math.min(1, Math.abs(normalizedScore) + 0.5),
      reasoning: `Based on sentiment analysis: ${result.positive.length} positive, ${result.negative.length} negative words`
    };
  }
  
  /**
   * 影响分析
   */
  private analyzeImpact(item: PartialNewsItem): {
    level: 'high' | 'medium' | 'low';
    areas: string[];
    timeline: 'immediate' | 'short-term' | 'long-term';
    stakeholders: string[];
    reasoning?: string;
  } {
    const text = (item.title + ' ' + (item.content || '')).toLowerCase();
    
    // 影响级别
    let level: 'high' | 'medium' | 'low' = 'medium';
    if (item.significance && item.significance >= 8) level = 'high';
    else if (item.significance && item.significance <= 4) level = 'low';
    
    // 影响领域
    const areas: string[] = [];
    if (text.match(/research|academic|paper/i)) areas.push('Research');
    if (text.match(/product|service|platform/i)) areas.push('Product');
    if (text.match(/market|business|revenue/i)) areas.push('Market');
    if (text.match(/regulation|policy|law/i)) areas.push('Policy');
    if (text.match(/technology|technical|algorithm/i)) areas.push('Technology');
    
    // 时间线
    let timeline: 'immediate' | 'short-term' | 'long-term' = 'short-term';
    if (text.match(/now|today|immediate|urgent/i)) timeline = 'immediate';
    else if (text.match(/future|long-term|years/i)) timeline = 'long-term';
    
    // 利益相关者
    const stakeholders = [
      ...(item.entities?.companies || []),
      'Developers',
      'Researchers'
    ];
    
    return {
      level,
      areas: areas.length > 0 ? areas : ['Technology'],
      timeline,
      stakeholders,
      reasoning: `Impact assessed based on significance (${item.significance}) and content analysis`
    };
  }
  
  /**
   * 提取趋势指标
   */
  private extractTrendIndicators(item: PartialNewsItem): string[] {
    const indicators: string[] = [];
    const text = (item.title + ' ' + (item.content || '')).toLowerCase();
    
    // 技术趋势
    if (text.match(/scale|larger|bigger|trillion/i)) indicators.push('Scaling');
    if (text.match(/efficient|faster|cheaper|optimization/i)) indicators.push('Efficiency');
    if (text.match(/multimodal|vision|audio|video/i)) indicators.push('Multimodal');
    if (text.match(/open.?source|open.?ai/i)) indicators.push('Open Source');
    if (text.match(/safety|alignment|ethics/i)) indicators.push('AI Safety');
    if (text.match(/regulation|governance|policy/i)) indicators.push('Regulation');
    
    return indicators;
  }
  
  /**
   * 生成摘要（提取前3句话）
   */
  private generateSummary(content: string, maxLength: number = 300): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ');
    
    if (summary.length > maxLength) {
      return summary.substring(0, maxLength) + '...';
    }
    
    return summary + (summary.endsWith('.') ? '' : '.');
  }
}

export const ruleAnalyzer = new RuleAnalyzer();
