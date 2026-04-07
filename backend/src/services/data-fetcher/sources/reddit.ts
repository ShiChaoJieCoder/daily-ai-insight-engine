/**
 * Reddit 数据源
 * 使用公开的JSON API（无需认证）
 */

import axios from 'axios';
import type { RawNewsItem } from '../../../types/index.js';

export class RedditSource {
  /**
   * 获取subreddit的热门帖子
   */
  async fetchNews(subreddit: string = 'MachineLearning', limit: number = 25): Promise<RawNewsItem[]> {
    try {
      console.log(`[Reddit] 开始获取 r/${subreddit} 数据...`);
      
      // Reddit的公开JSON API
      const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Insight-Engine/1.0)'
        }
      });
      
      const posts = data.data.children;
      
      const newsItems: RawNewsItem[] = posts
        .filter((post: any) => !post.data.stickied) // 过滤置顶帖
        .map((post: any) => {
          const p = post.data;
          return {
            title: p.title,
            content: p.selftext || p.title,
            url: p.url.startsWith('http') ? p.url : `https://reddit.com${p.permalink}`,
            source: `Reddit r/${subreddit}`,
            publishDate: new Date(p.created_utc * 1000),
            author: p.author
          };
        });
      
      console.log(`[Reddit] r/${subreddit} 获取到 ${newsItems.length} 条帖子`);
      return newsItems;
      
    } catch (error: any) {
      console.error(`[Reddit] r/${subreddit} 获取失败:`, error.message);
      return [];
    }
  }
  
  /**
   * 获取多个subreddit的数据
   */
  async fetchMultiple(subreddits: string[], limitPerSub: number = 15): Promise<RawNewsItem[]> {
    const results = await Promise.all(
      subreddits.map(sub => this.fetchNews(sub, limitPerSub))
    );
    
    return results.flat();
  }
}

/**
 * AI相关的subreddit列表
 */
export const AI_SUBREDDITS = [
  'MachineLearning',
  'artificial',
  'deeplearning',
  'LanguageTechnology',
  'computervision',
  'OpenAI',
  'LocalLLaMA'
];
