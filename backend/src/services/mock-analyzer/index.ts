/**
 * 模拟分析器 - 不依赖AI API的智能数据处理
 * 用于演示和开发，或当API配额用完时
 */

import type { RawNewsItem, NewsItem } from '../../types/index.js';

export class MockAnalyzerService {
  /**
   * 分析原始新闻并生成结构化数据
   */
  async analyzeNews(items: RawNewsItem[]): Promise<NewsItem[]> {
    console.log(`[MockAnalyzer] 开始智能分析，共 ${items.length} 条新闻`);
    
    return items.map((item, index) => {
      const analyzed = this.analyzeItem(item, index);
      return analyzed;
    });
  }
  
  /**
   * 分析单条新闻
   */
  private analyzeItem(item: RawNewsItem, index: number): NewsItem {
    const titleLower = item.title.toLowerCase();
    const contentLower = (item.content || '').toLowerCase();
    const combined = titleLower + ' ' + contentLower;
    
    // 智能分类
    const category = this.detectCategory(combined);
    const eventType = this.detectEventType(combined);
    const tags = this.extractTags(combined);
    const entities = this.extractEntities(item.title, item.content);
    const sentiment = this.analyzeSentiment(combined);
    const impact = this.assessImpact(combined, eventType);
    const significance = this.calculateSignificance(eventType, sentiment, entities);
    const trendIndicators = this.detectTrends(combined, tags);
    
    return {
      id: item.url,
      title: item.title,
      summary: this.generateSummary(item.content),
      content: item.content,
      source: {
        name: item.source,
        type: this.detectSourceType(item.source),
        url: item.url
      },
      publishDate: item.publishDate,
      category,
      tags,
      entities,
      eventType,
      significance,
      sentiment,
      impact,
      trendIndicators
    };
  }
  
  /**
   * 检测分类
   */
  private detectCategory(text: string): NewsItem['category'] {
    if (text.includes('research') || text.includes('paper') || text.includes('arxiv') || text.includes('study')) {
      return 'research';
    }
    if (text.includes('launch') || text.includes('release') || text.includes('product') || text.includes('announce')) {
      return 'product';
    }
    if (text.includes('funding') || text.includes('raised') || text.includes('investment') || text.includes('million')) {
      return 'funding';
    }
    if (text.includes('regulation') || text.includes('policy') || text.includes('law') || text.includes('government')) {
      return 'policy';
    }
    return 'discussion';
  }
  
  /**
   * 检测事件类型
   */
  private detectEventType(text: string): NewsItem['eventType'] {
    if (text.includes('breakthrough') || text.includes('achieve') || text.includes('first')) {
      return 'breakthrough';
    }
    if (text.includes('release') || text.includes('launch') || text.includes('unveil')) {
      return 'release';
    }
    if (text.includes('funding') || text.includes('raised') || text.includes('investment')) {
      return 'funding';
    }
    if (text.includes('regulation') || text.includes('law') || text.includes('ban')) {
      return 'regulation';
    }
    return 'discussion';
  }
  
  /**
   * 提取标签
   */
  private extractTags(text: string): string[] {
    const tags: string[] = [];
    
    const keywords = {
      'LLM': ['llm', 'language model', 'gpt', 'claude', 'gemini'],
      'Multimodal': ['multimodal', 'vision', 'image', 'video'],
      'AI Agent': ['agent', 'autonomous', 'automation'],
      'Open Source': ['open source', 'open-source', 'opensource'],
      'AI Safety': ['safety', 'alignment', 'ethics'],
      'Regulation': ['regulation', 'policy', 'law'],
      'Funding': ['funding', 'investment', 'raised'],
      'Research': ['research', 'paper', 'study'],
      'Product': ['product', 'launch', 'release']
    };
    
    Object.entries(keywords).forEach(([tag, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        tags.push(tag);
      }
    });
    
    return tags.slice(0, 5);
  }
  
  /**
   * 提取实体
   */
  private extractEntities(title: string, content: string): NewsItem['entities'] {
    const text = title + ' ' + (content || '');
    
    const companies = this.extractCompanies(text);
    const products = this.extractProducts(text);
    const technologies = this.extractTechnologies(text);
    const people = this.extractPeople(text);
    
    return { companies, products, technologies, people };
  }
  
  private extractCompanies(text: string): string[] {
    const companyPatterns = [
      'OpenAI', 'Google', 'Microsoft', 'Meta', 'Anthropic', 'Amazon', 'Apple',
      'Tesla', 'NVIDIA', 'Intel', 'IBM', 'Salesforce', 'Oracle', 'SAP',
      'Baidu', 'Alibaba', 'Tencent', 'ByteDance', 'Huawei'
    ];
    
    return companyPatterns.filter(company => 
      text.toLowerCase().includes(company.toLowerCase())
    ).slice(0, 3);
  }
  
  private extractProducts(text: string): string[] {
    const productPatterns = [
      'GPT', 'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Bard',
      'Llama', 'Mistral', 'Stable Diffusion', 'Midjourney', 'DALL-E'
    ];
    
    return productPatterns.filter(product => 
      text.toLowerCase().includes(product.toLowerCase())
    ).slice(0, 3);
  }
  
  private extractTechnologies(text: string): string[] {
    const techPatterns = [
      'Transformer', 'Neural Network', 'Deep Learning', 'Machine Learning',
      'Reinforcement Learning', 'Computer Vision', 'NLP', 'RAG'
    ];
    
    return techPatterns.filter(tech => 
      text.toLowerCase().includes(tech.toLowerCase())
    ).slice(0, 3);
  }
  
  private extractPeople(text: string): string[] {
    const peoplePatterns = [
      'Sam Altman', 'Elon Musk', 'Demis Hassabis', 'Dario Amodei',
      'Yann LeCun', 'Geoffrey Hinton', 'Andrew Ng', 'Fei-Fei Li'
    ];
    
    return peoplePatterns.filter(person => 
      text.includes(person)
    ).slice(0, 2);
  }
  
  /**
   * 情感分析
   */
  private analyzeSentiment(text: string): NewsItem['sentiment'] {
    const positiveWords = ['breakthrough', 'success', 'improve', 'advance', 'win', 'achieve', 'grow'];
    const negativeWords = ['concern', 'risk', 'fail', 'problem', 'issue', 'ban', 'threat'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.2;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.2;
    });
    
    score = Math.max(-1, Math.min(1, score));
    
    const label = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
    
    return {
      score,
      label,
      confidence: 0.7,
      reasoning: `基于关键词分析的情感评分`
    };
  }
  
  /**
   * 影响评估
   */
  private assessImpact(text: string, eventType: string): NewsItem['impact'] {
    const level = eventType === 'breakthrough' || eventType === 'regulation' ? 'high' :
                  eventType === 'funding' || eventType === 'release' ? 'medium' : 'low';
    
    const areas: string[] = [];
    if (text.includes('industry') || text.includes('market')) areas.push('industry');
    if (text.includes('research') || text.includes('technology')) areas.push('research');
    if (text.includes('policy') || text.includes('regulation')) areas.push('policy');
    if (areas.length === 0) areas.push('industry');
    
    const timeline = level === 'high' ? 'short-term' : 'long-term';
    
    return {
      level,
      areas,
      timeline,
      stakeholders: ['AI companies', 'Developers', 'Enterprises'],
      reasoning: `${eventType} 事件，预计对 ${areas.join('、')} 产生 ${level} 级别影响`
    };
  }
  
  /**
   * 计算重要性
   */
  private calculateSignificance(
    eventType: string,
    sentiment: NewsItem['sentiment'],
    entities: NewsItem['entities']
  ): number {
    let score = 5;
    
    // 事件类型加分
    if (eventType === 'breakthrough') score += 3;
    else if (eventType === 'regulation') score += 2;
    else if (eventType === 'funding') score += 1;
    
    // 实体数量加分
    const entityCount = entities.companies.length + entities.products.length;
    score += Math.min(entityCount, 2);
    
    // 情感强度加分
    score += Math.abs(sentiment.score);
    
    return Math.min(10, Math.max(1, Math.round(score)));
  }
  
  /**
   * 检测趋势
   */
  private detectTrends(text: string, tags: string[]): string[] {
    const trends: string[] = [];
    
    if (text.includes('scale') || text.includes('billion')) trends.push('scaling_up');
    if (text.includes('multimodal') || text.includes('vision')) trends.push('multimodal');
    if (text.includes('open source') || text.includes('open-source')) trends.push('open_source');
    if (text.includes('agent') || text.includes('autonomous')) trends.push('agent_boom');
    if (text.includes('enterprise') || text.includes('commercial')) trends.push('commercialization');
    if (text.includes('regulation') || text.includes('policy')) trends.push('regulation');
    if (text.includes('safety') || text.includes('ethics')) trends.push('safety_focus');
    if (text.includes('funding') || text.includes('investment')) trends.push('funding');
    
    return trends;
  }
  
  /**
   * 生成摘要
   */
  private generateSummary(content: string): string {
    if (!content) return '';
    
    // 取前200个字符作为摘要
    const summary = content.substring(0, 200);
    return summary + (content.length > 200 ? '...' : '');
  }
  
  /**
   * 检测数据源类型
   */
  private detectSourceType(source: string): string {
    if (source.includes('arXiv')) return 'academic';
    if (source.includes('Reddit') || source.includes('Hacker News')) return 'community';
    return 'media';
  }
}

// 导出单例
export const mockAnalyzer = new MockAnalyzerService();
