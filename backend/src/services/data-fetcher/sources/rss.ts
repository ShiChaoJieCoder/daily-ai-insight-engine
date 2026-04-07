/**
 * RSS 数据源
 * 支持各种RSS/Atom feed
 */

// @ts-ignore - rss-parser没有类型定义
import Parser from 'rss-parser';
import type { RawNewsItem } from '../../../types/index.js';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; AI-Insight-Engine/1.0)'
  }
});

export class RSSSource {
  /**
   * 从RSS源获取新闻
   */
  async fetchNews(feedUrl: string, sourceName: string): Promise<RawNewsItem[]> {
    try {
      console.log(`[RSS] 开始获取 ${sourceName} 数据...`);
      
      const feed = await parser.parseURL(feedUrl);
      
      const newsItems: RawNewsItem[] = feed.items
        .filter((item: any) => item.title && item.link)
        .map((item: any) => ({
          title: item.title!,
          content: this.extractContent(item),
          url: item.link!,
          source: sourceName,
          publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          author: item.creator || item.author
        }));
      
      console.log(`[RSS] ${sourceName} 获取到 ${newsItems.length} 条新闻`);
      return newsItems;
      
    } catch (error: any) {
      console.error(`[RSS] ${sourceName} 获取失败:`, error.message);
      return [];
    }
  }
  
  /**
   * 提取内容（优先使用content，其次summary，最后description）
   */
  private extractContent(item: any): string {
    // 尝试多个字段
    const content = item.content || 
                   item['content:encoded'] || 
                   item.summary || 
                   item.description || 
                   item.title || 
                   '';
    
    // 清理HTML标签
    return this.stripHtml(content);
  }
  
  /**
   * 移除HTML标签
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * 预定义的RSS源
 */
export const RSS_SOURCES = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/tag/artificial-intelligence/feed/'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'
  },
  {
    name: 'MIT Technology Review AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/'
  },
  {
    name: 'AI News (Artificial Intelligence News)',
    url: 'https://www.artificialintelligence-news.com/feed/'
  }
];
