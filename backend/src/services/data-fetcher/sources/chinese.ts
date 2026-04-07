/**
 * 中文AI资讯源
 * 包括国内主流科技媒体和社区
 */

import axios from 'axios';
import type { RawNewsItem } from '../../../types/index.js';
import * as cheerio from 'cheerio';

// 中文RSS源配置
export const CHINESE_RSS_SOURCES = [
  {
    name: '36氪 AI',
    url: 'https://36kr.com/feed',
    category: 'ai'
  },
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: 'ai'
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    category: 'ai'
  },
  {
    name: 'AI科技评论（雷峰网）',
    url: 'https://www.leiphone.com/category/ai/feed',
    category: 'ai'
  },
  {
    name: '新智元',
    url: 'https://mp.weixin.qq.com/rss',
    category: 'ai'
  }
];

// 知乎话题（通过API或爬虫获取）
export const ZHIHU_TOPICS = [
  {
    name: '人工智能',
    id: '19551147',
    url: 'https://www.zhihu.com/topic/19551147/hot'
  },
  {
    name: '机器学习',
    id: '19559450',
    url: 'https://www.zhihu.com/topic/19559450/hot'
  },
  {
    name: '深度学习',
    id: '19813032',
    url: 'https://www.zhihu.com/topic/19813032/hot'
  },
  {
    name: 'ChatGPT',
    id: '20217140',
    url: 'https://www.zhihu.com/topic/20217140/hot'
  }
];

// 简单的中文内容获取器
export class ChineseSourceFetcher {
  private timeout = 10000;

  /**
   * 从36氪获取AI资讯
   */
  async fetch36Kr(): Promise<RawNewsItem[]> {
    try {
      console.log('[36氪] 开始获取数据...');
      
      // 36氪的RSS可能需要特殊处理，这里使用通用RSS解析
      const response = await axios.get('https://36kr.com/feed', {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: RawNewsItem[] = [];

      $('item').each((_, element) => {
        const title = $(element).find('title').text();
        const link = $(element).find('link').text();
        const description = $(element).find('description').text();
        const pubDate = $(element).find('pubDate').text();

        // 只获取AI相关内容
        if (title && (
          title.includes('AI') || 
          title.includes('人工智能') || 
          title.includes('机器学习') ||
          title.includes('深度学习') ||
          title.includes('大模型') ||
          title.includes('ChatGPT') ||
          title.includes('GPT')
        )) {
          items.push({
            title: title.trim(),
            content: description.replace(/<[^>]*>/g, '').trim() || title,
            url: link,
            source: '36氪',
            publishDate: pubDate ? new Date(pubDate) : new Date(),
            language: 'zh'
          });
        }
      });

      console.log(`[36氪] 获取到 ${items.length} 条AI相关资讯`);
      return items;
    } catch (error: any) {
      console.error(`[36氪] 获取失败:`, error.message);
      return [];
    }
  }

  /**
   * 从机器之心获取资讯
   */
  async fetchJiQiZhiXin(): Promise<RawNewsItem[]> {
    try {
      console.log('[机器之心] 开始获取数据...');
      
      const response = await axios.get('https://www.jiqizhixin.com/rss', {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: RawNewsItem[] = [];

      $('item').each((_, element) => {
        const title = $(element).find('title').text();
        const link = $(element).find('link').text();
        const description = $(element).find('description').text();
        const pubDate = $(element).find('pubDate').text();

        if (title && link) {
          items.push({
            title: title.trim(),
            content: description.replace(/<[^>]*>/g, '').trim() || title,
            url: link,
            source: '机器之心',
            publishDate: pubDate ? new Date(pubDate) : new Date(),
            language: 'zh'
          });
        }
      });

      console.log(`[机器之心] 获取到 ${items.length} 条资讯`);
      return items;
    } catch (error: any) {
      console.error(`[机器之心] 获取失败:`, error.message);
      return [];
    }
  }

  /**
   * 从量子位获取资讯
   */
  async fetchQBitAI(): Promise<RawNewsItem[]> {
    try {
      console.log('[量子位] 开始获取数据...');
      
      const response = await axios.get('https://www.qbitai.com/feed', {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: RawNewsItem[] = [];

      $('item').each((_, element) => {
        const title = $(element).find('title').text();
        const link = $(element).find('link').text();
        const description = $(element).find('description').text();
        const pubDate = $(element).find('pubDate').text();

        if (title && link) {
          items.push({
            title: title.trim(),
            content: description.replace(/<[^>]*>/g, '').trim() || title,
            url: link,
            source: '量子位',
            publishDate: pubDate ? new Date(pubDate) : new Date(),
            language: 'zh'
          });
        }
      });

      console.log(`[量子位] 获取到 ${items.length} 条资讯`);
      return items;
    } catch (error: any) {
      console.error(`[量子位] 获取失败:`, error.message);
      return [];
    }
  }

  /**
   * 从雷峰网AI科技评论获取资讯
   */
  async fetchLeiphone(): Promise<RawNewsItem[]> {
    try {
      console.log('[AI科技评论] 开始获取数据...');
      
      const response = await axios.get('https://www.leiphone.com/category/ai/feed', {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const items: RawNewsItem[] = [];

      $('item').each((_, element) => {
        const title = $(element).find('title').text();
        const link = $(element).find('link').text();
        const description = $(element).find('description').text();
        const pubDate = $(element).find('pubDate').text();

        if (title && link) {
          items.push({
            title: title.trim(),
            content: description.replace(/<[^>]*>/g, '').trim() || title,
            url: link,
            source: 'AI科技评论',
            publishDate: pubDate ? new Date(pubDate) : new Date(),
            language: 'zh'
          });
        }
      });

      console.log(`[AI科技评论] 获取到 ${items.length} 条资讯`);
      return items;
    } catch (error: any) {
      console.error(`[AI科技评论] 获取失败:`, error.message);
      return [];
    }
  }

  /**
   * 获取所有中文资讯源
   */
  async fetchAll(): Promise<RawNewsItem[]> {
    console.log('[中文资讯] 开始获取所有中文AI资讯源...');
    
    const results = await Promise.allSettled([
      this.fetch36Kr(),
      this.fetchJiQiZhiXin(),
      this.fetchQBitAI(),
      this.fetchLeiphone()
    ]);

    const allItems: RawNewsItem[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    });

    console.log(`[中文资讯] 共获取到 ${allItems.length} 条中文资讯`);
    return allItems;
  }
}
