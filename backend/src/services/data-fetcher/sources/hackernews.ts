/**
 * Hacker News 数据源
 * 官方API: https://github.com/HackerNews/API
 */

import axios from 'axios';
import type { RawNewsItem } from '../../../types/index.js';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
}

export class HackerNewsSource {
  /**
   * 获取AI相关的热门新闻
   */
  async fetchNews(limit: number = 30): Promise<RawNewsItem[]> {
    try {
      console.log('[HackerNews] 开始获取数据...');
      
      // 1. 获取热门故事ID列表
      const { data: topStories } = await axios.get<number[]>(`${BASE_URL}/topstories.json`);
      
      // 2. 获取前N条故事的详情
      const storyIds = topStories.slice(0, limit);
      const stories = await Promise.all(
        storyIds.map(id => this.fetchStory(id))
      );
      
      // 3. 过滤AI相关内容
      const aiRelated = stories.filter(story => 
        story && this.isAIRelated(story.title)
      );
      
      // 4. 转换为标准格式
      const newsItems: RawNewsItem[] = aiRelated.map(story => ({
        title: story!.title,
        content: story!.text || story!.title,
        url: story!.url || `https://news.ycombinator.com/item?id=${story!.id}`,
        source: 'Hacker News',
        publishDate: new Date(story!.time * 1000),
        author: story!.by
      }));
      
      console.log(`[HackerNews] 获取到 ${newsItems.length} 条AI相关新闻`);
      return newsItems;
      
    } catch (error: any) {
      console.error('[HackerNews] 获取失败:', error.message);
      return [];
    }
  }
  
  /**
   * 获取单条故事详情
   */
  private async fetchStory(id: number): Promise<HNItem | null> {
    try {
      const { data } = await axios.get<HNItem>(`${BASE_URL}/item/${id}.json`);
      return data;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 判断是否为AI相关内容
   */
  private isAIRelated(title: string): boolean {
    const aiKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'ml',
      'deep learning', 'neural network', 'gpt', 'llm',
      'openai', 'anthropic', 'google ai', 'deepmind',
      'chatgpt', 'claude', 'gemini', 'copilot',
      'transformer', 'bert', 'nlp', 'computer vision',
      'reinforcement learning', 'generative', 'diffusion'
    ];
    
    const titleLower = title.toLowerCase();
    return aiKeywords.some(keyword => titleLower.includes(keyword));
  }
}
