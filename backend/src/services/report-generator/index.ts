/**
 * 报告生成服务
 * 负责生成日报内容和可视化数据
 */

import type { NewsItem, DailyReport, HotTopic, KeyMetrics, TrendAnalysis, VisualizationData } from '../../types/index.js';

export class ReportGeneratorService {
  /**
   * 生成完整报告
   */
  async generateReport(items: NewsItem[], date: Date): Promise<DailyReport> {
    console.log(`[ReportGenerator] 开始生成报告，共 ${items.length} 条新闻`);
    
    const report: DailyReport = {
      meta: {
        date,
        generatedAt: new Date(),
        dataSourceCount: this.countDataSources(items),
        newsCount: items.length,
        version: '1.0.0'
      },
      
      summary: {
        hotTopics: this.extractHotTopics(items, 15),
        keyMetrics: this.calculateKeyMetrics(items)
      },
      
      analysis: {
        deepDive: this.generateDeepDive(items),
        trends: this.analyzeTrends(items)
      },
      
      visualization: this.prepareVisualization(items),
      
      rawData: items
    };
    
    console.log(`[ReportGenerator] 报告生成完成`);
    return report;
  }
  
  /**
   * 提取热点事件
   */
  extractHotTopics(items: NewsItem[], topN: number = 10): HotTopic[] {
    // 1. 先按国内/国外分类
    const domesticItems: NewsItem[] = [];
    const internationalItems: NewsItem[] = [];
    
    items.forEach(item => {
      const isChinese = /[\u4e00-\u9fff]/.test(item.title);
      if (isChinese) {
        domesticItems.push(item);
      } else {
        internationalItems.push(item);
      }
    });
    
    console.log(`[HotTopics] 国内资讯: ${domesticItems.length} 条, 国际资讯: ${internationalItems.length} 条`);
    
    // 2. 计算综合评分的函数
    const calculateScore = (item: NewsItem) => {
      return item.significance * 0.6 + 
             (item.sentiment?.score || 0) * 2 + 
             (item.impact?.level === 'high' ? 2 : item.impact?.level === 'medium' ? 1 : 0);
    };
    
    // 3. 分别对国内和国际资讯排序
    const sortedDomestic = [...domesticItems].sort((a, b) => calculateScore(b) - calculateScore(a));
    const sortedInternational = [...internationalItems].sort((a, b) => calculateScore(b) - calculateScore(a));
    
    // 4. 各取5条（国内5条 + 国际5条 = 总共10条）
    const domesticCount = 5;
    const internationalCount = 5;
    
    const topDomestic = sortedDomestic.slice(0, domesticCount);
    const topInternational = sortedInternational.slice(0, internationalCount);
    
    console.log(`[HotTopics] 选取国内热点: ${topDomestic.length} 条, 国际热点: ${topInternational.length} 条`);
    
    // 5. 合并结果（国内在前）
    const combined = [...topDomestic, ...topInternational];
    
    return combined.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      significance: item.significance,
      eventType: item.eventType,
      summary: item.summary,
      impactAreas: item.impact.areas,
      relatedNews: [item.id]
    }));
  }
  
  /**
   * 计算关键指标
   */
  calculateKeyMetrics(items: NewsItem[]): KeyMetrics {
    // 情感分布
    const sentimentCounts = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    items.forEach(item => {
      if (item.sentiment) {
        sentimentCounts[item.sentiment.label]++;
      }
    });
    
    // 事件类型分布
    const eventTypeCounts: Record<string, number> = {};
    items.forEach(item => {
      eventTypeCounts[item.eventType] = (eventTypeCounts[item.eventType] || 0) + 1;
    });
    
    // 统计公司
    const companyCounts = new Map<string, number>();
    items.forEach(item => {
      item.entities?.companies.forEach(company => {
        companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
      });
    });
    
    const topCompanies = Array.from(companyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    // 统计技术
    const techCounts = new Map<string, number>();
    items.forEach(item => {
      item.entities?.technologies.forEach(tech => {
        techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
      });
    });
    
    const topTechnologies = Array.from(techCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    
    return {
      totalNews: items.length,
      sentimentDistribution: sentimentCounts,
      eventTypeDistribution: eventTypeCounts,
      topCompanies,
      topTechnologies
    };
  }
  
  /**
   * 生成深度分析（国内2条 + 国际2条，总共4条）
   */
  generateDeepDive(items: NewsItem[]) {
    // 分类
    const domesticItems = items.filter(item => /[\u4e00-\u9fff]/.test(item.title));
    const internationalItems = items.filter(item => !/[\u4e00-\u9fff]/.test(item.title));
    
    // 分别排序
    const sortedDomestic = [...domesticItems].sort((a, b) => b.significance - a.significance);
    const sortedInternational = [...internationalItems].sort((a, b) => b.significance - a.significance);
    
    // 各取2条（如果有的话）
    const topItems: NewsItem[] = [];
    topItems.push(...sortedDomestic.slice(0, 2));
    topItems.push(...sortedInternational.slice(0, 2));
    
    console.log(`[DeepDive] 国内深度: ${Math.min(sortedDomestic.length, 2)} 条, 国际深度: ${Math.min(sortedInternational.length, 2)} 条`);
    
    return topItems.map(item => ({
      newsId: item.id,
      title: item.title,
      background: `${item.summary}`,
      impactAnalysis: {
        industry: item.impact.areas.includes('industry') ? item.impact.reasoning : undefined,
        technology: item.impact.areas.includes('research') ? item.impact.reasoning : undefined,
        market: item.impact.areas.includes('market') ? item.impact.reasoning : undefined
      },
      keyInsights: [
        `重要性评分: ${item.significance}/10`,
        `影响时间线: ${item.impact.timeline}`,
        `情感倾向: ${item.sentiment.label} (${item.sentiment.score.toFixed(2)})`
      ]
    }));
  }
  
  /**
   * 分析趋势
   */
  analyzeTrends(items: NewsItem[]): TrendAnalysis {
    // 统计趋势指标
    const trendCounts = new Map<string, number>();
    items.forEach(item => {
      item.trendIndicators?.forEach(trend => {
        trendCounts.set(trend, (trendCounts.get(trend) || 0) + 1);
      });
    });
    
    // 分类趋势
    const technology: string[] = [];
    const application: string[] = [];
    const policy: string[] = [];
    const capital: string[] = [];
    
    const techTrends = ['scaling_up', 'multimodal', 'open_source', 'edge_computing'];
    const appTrends = ['agent_boom', 'commercialization'];
    const policyTrends = ['regulation', 'safety_focus'];
    const capitalTrends = ['funding'];
    
    trendCounts.forEach((count, trend) => {
      if (count >= 2) {  // 至少出现2次才算趋势
        if (techTrends.includes(trend)) technology.push(trend);
        else if (appTrends.includes(trend)) application.push(trend);
        else if (policyTrends.includes(trend)) policy.push(trend);
        else if (capitalTrends.includes(trend)) capital.push(trend);
      }
    });
    
    return {
      technology,
      application,
      policy,
      capital
    };
  }
  
  /**
   * 准备可视化数据
   */
  prepareVisualization(items: NewsItem[]): VisualizationData {
    // 事件类型饼图
    const eventTypeCounts: Record<string, number> = {};
    items.forEach(item => {
      eventTypeCounts[item.eventType] = (eventTypeCounts[item.eventType] || 0) + 1;
    });
    
    const eventTypeChart = {
      type: 'pie' as const,
      data: Object.entries(eventTypeCounts).map(([name, value]) => ({
        name,
        value
      }))
    };
    
    // 情感趋势折线图（按时间）
    const sentimentByDate = items.map(item => ({
      date: item.publishDate.toISOString().split('T')[0],
      sentiment: item.sentiment.score,
      title: item.title.substring(0, 30)
    }));
    
    const sentimentTrendChart = {
      type: 'line' as const,
      data: sentimentByDate
    };
    
    // 公司词云
    const companyCounts = new Map<string, number>();
    items.forEach(item => {
      item.entities?.companies.forEach(company => {
        companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
      });
    });
    
    const companyWordCloud = {
      words: Array.from(companyCounts.entries()).map(([text, value]) => ({
        text,
        value
      }))
    };
    
    // 技术关键词柱状图
    const techCounts = new Map<string, number>();
    items.forEach(item => {
      item.entities?.technologies.forEach(tech => {
        techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
      });
    });
    
    const technologyBarChart = {
      type: 'bar' as const,
      data: Array.from(techCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }))
    };
    
    return {
      eventTypeChart,
      sentimentTrendChart,
      companyWordCloud,
      technologyBarChart
    };
  }
  
  /**
   * 统计数据源数量
   */
  private countDataSources(items: NewsItem[]): number {
    const sources = new Set(items.map(item => item.source.name));
    return sources.size;
  }
}

// 导出单例
export const reportGenerator = new ReportGeneratorService();
