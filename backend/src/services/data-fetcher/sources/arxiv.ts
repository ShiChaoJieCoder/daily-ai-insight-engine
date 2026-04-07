/**
 * arXiv 数据源
 * 学术论文API: https://info.arxiv.org/help/api/index.html
 */

import axios from 'axios';
import type { RawNewsItem } from '../../../types/index.js';

const BASE_URL = 'http://export.arxiv.org/api/query';

export class ArxivSource {
  /**
   * 获取AI相关的最新论文
   */
  async fetchNews(maxResults: number = 20): Promise<RawNewsItem[]> {
    try {
      console.log('[arXiv] 开始获取数据...');
      
      // 搜索AI相关论文（最近提交的）
      const params = {
        search_query: 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV',
        sortBy: 'submittedDate',
        sortOrder: 'descending',
        max_results: maxResults
      };
      
      const queryString = new URLSearchParams(params as any).toString();
      const { data } = await axios.get(`${BASE_URL}?${queryString}`);
      
      // 解析XML
      const entries = this.parseArxivXML(data);
      
      const newsItems: RawNewsItem[] = entries.map(entry => ({
        title: entry.title,
        content: entry.summary,
        url: entry.id,
        source: 'arXiv',
        publishDate: new Date(entry.published),
        author: entry.authors.join(', ')
      }));
      
      console.log(`[arXiv] 获取到 ${newsItems.length} 篇论文`);
      return newsItems;
      
    } catch (error: any) {
      console.error('[arXiv] 获取失败:', error.message);
      return [];
    }
  }
  
  /**
   * 解析arXiv的XML响应
   */
  private parseArxivXML(xml: string): any[] {
    const entries: any[] = [];
    
    // 简单的XML解析（使用正则表达式）
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      
      const entry = {
        id: this.extractTag(entryXml, 'id'),
        title: this.extractTag(entryXml, 'title').replace(/\s+/g, ' ').trim(),
        summary: this.extractTag(entryXml, 'summary').replace(/\s+/g, ' ').trim(),
        published: this.extractTag(entryXml, 'published'),
        authors: this.extractAuthors(entryXml)
      };
      
      entries.push(entry);
    }
    
    return entries;
  }
  
  /**
   * 提取XML标签内容
   */
  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }
  
  /**
   * 提取作者列表
   */
  private extractAuthors(xml: string): string[] {
    const authors: string[] = [];
    const authorRegex = /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g;
    let match;
    
    while ((match = authorRegex.exec(xml)) !== null) {
      authors.push(match[1].trim());
    }
    
    return authors;
  }
}
