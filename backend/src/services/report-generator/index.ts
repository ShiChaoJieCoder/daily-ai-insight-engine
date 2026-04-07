/**
 * 报告生成服务
 * 负责生成日报内容和可视化数据
 */

import type { NewsItem, DailyReport, HotTopic, KeyMetrics, TrendAnalysis, VisualizationData } from '../../types/index.js';

export class ReportGeneratorService {
  /**
   * 生成完整报告（匹配前端数据格式）
   */
  async generateReport(items: NewsItem[], date: Date): Promise<any> {
    console.log(`[ReportGenerator] 开始生成报告，共 ${items.length} 条新闻`);
    
    const dateStr = date.toISOString().split('T')[0];
    
    // 生成前端期望的数据格式
    const report = {
      meta: {
        generated_at: new Date().toISOString(),
        dataset_id: `ai-news-${dateStr}`,
        pipeline_version: '1.0.0',
        article_count: items.length,
        insufficient_data: items.length < 10
      },
      
      hotspots: this.generateHotspots(items),
      deep_dive: this.generateDeepDiveForFrontend(items),
      trends: this.generateTrendsForFrontend(items),
      risks_opportunities: this.generateRisksOpportunities(items),
      charts: this.generateCharts(items)
    };
    
    console.log(`[ReportGenerator] 报告生成完成`);
    return report;
  }
  
  /**
   * 提取热点事件
   */
  extractHotTopics(items: NewsItem[], topN: number = 5): HotTopic[] {
    // 按重要性排序
    const sorted = [...items].sort((a, b) => b.significance - a.significance);
    
    return sorted.slice(0, topN).map((item, index) => ({
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
   * 生成热点事件（前端格式）
   */
  generateHotspots(items: NewsItem[]) {
    const topItems = [...items]
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 5);
    
    return topItems.map((item, index) => ({
      id: `hs-${index + 1}`,
      title: item.title,
      summary: item.summary || item.content?.substring(0, 200) || '',
      related_article_ids: [item.id]
    }));
  }
  
  /**
   * 生成深度分析（前端格式）
   */
  generateDeepDiveForFrontend(items: NewsItem[]) {
    const topItems = [...items]
      .sort((a, b) => b.significance - a.significance)
      .slice(0, 2);
    
    return topItems.map((item, index) => ({
      id: `dd-${index + 1}`,
      title: item.title,
      narrative: item.impact.reasoning || item.summary || `${item.title} 的深度分析。${item.impact.areas.join('、')}等领域将受到影响。`,
      related_article_ids: [item.id]
    }));
  }
  
  /**
   * 生成趋势分析（前端格式）
   */
  generateTrendsForFrontend(items: NewsItem[]) {
    const trendMap = new Map<string, { count: number; items: NewsItem[] }>();
    
    items.forEach(item => {
      item.trendIndicators?.forEach(trend => {
        if (!trendMap.has(trend)) {
          trendMap.set(trend, { count: 0, items: [] });
        }
        const entry = trendMap.get(trend)!;
        entry.count++;
        entry.items.push(item);
      });
    });
    
    const trends = Array.from(trendMap.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([trend, data], index) => ({
        id: `tr-${index + 1}`,
        title: this.formatTrendTitle(trend),
        summary: `在 ${data.count} 条新闻中发现此趋势，涉及 ${data.items.map(i => i.entities?.companies[0]).filter(Boolean).join('、')} 等。`,
        momentum: data.count >= 3 ? 'rising' : 'stable'
      }));
    
    // 如果趋势太少，添加一些通用趋势
    if (trends.length < 3) {
      const categories = this.analyzeCategories(items);
      categories.forEach((count, category, index) => {
        if (trends.length < 5) {
          trends.push({
            id: `tr-${trends.length + 1}`,
            title: this.formatCategoryTrend(category),
            summary: `${count} 条相关新闻`,
            momentum: count >= 3 ? 'rising' : 'stable'
          });
        }
      });
    }
    
    return trends;
  }
  
  /**
   * 生成风险与机遇
   */
  generateRisksOpportunities(items: NewsItem[]) {
    const risks: any[] = [];
    const opportunities: any[] = [];
    
    items.forEach((item, index) => {
      if (item.sentiment.label === 'negative' && item.impact.level === 'high') {
        risks.push({
          id: `ro-r-${risks.length + 1}`,
          kind: 'risk',
          title: item.title,
          detail: item.summary
        });
      } else if (item.sentiment.label === 'positive' && item.impact.level === 'high') {
        opportunities.push({
          id: `ro-o-${opportunities.length + 1}`,
          kind: 'opportunity',
          title: item.title,
          detail: item.summary
        });
      }
    });
    
    return [...risks, ...opportunities].slice(0, 4);
  }
  
  /**
   * 生成图表数据
   */
  generateCharts(items: NewsItem[]) {
    const charts: any[] = [];
    
    // 事件类型分布
    const eventTypeCounts: Record<string, number> = {};
    items.forEach(item => {
      eventTypeCounts[item.eventType] = (eventTypeCounts[item.eventType] || 0) + 1;
    });
    
    charts.push({
      id: 'ch-1',
      title: 'Event types',
      type: 'pie',
      data: Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }))
    });
    
    // 公司提及次数
    const companyCounts = new Map<string, number>();
    items.forEach(item => {
      item.entities?.companies.forEach(company => {
        companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
      });
    });
    
    const topCompanies = Array.from(companyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    if (topCompanies.length > 0) {
      charts.push({
        id: 'ch-2',
        title: 'Top companies mentioned',
        type: 'bar',
        data: topCompanies.map(([name, value]) => ({ name, value }))
      });
    }
    
    // 情感趋势（模拟时间序列）
    const sentimentData = items.map((item, i) => ({
      name: `Item ${i + 1}`,
      value: Math.round((item.sentiment.score + 1) * 50) // 转换为 0-100
    }));
    
    charts.push({
      id: 'ch-3',
      title: 'Sentiment distribution',
      type: 'line',
      data: sentimentData
    });
    
    return charts;
  }
  
  /**
   * 格式化趋势标题
   */
  private formatTrendTitle(trend: string): string {
    const trendNames: Record<string, string> = {
      'scaling_up': 'AI模型规模持续扩大',
      'multimodal': '多模态AI快速发展',
      'open_source': '开源模型生态繁荣',
      'agent_boom': 'AI Agent应用爆发',
      'commercialization': 'AI商业化加速',
      'regulation': 'AI监管政策收紧',
      'safety_focus': 'AI安全成为焦点',
      'funding': 'AI领域融资活跃'
    };
    return trendNames[trend] || trend;
  }
  
  /**
   * 分析分类分布
   */
  private analyzeCategories(items: NewsItem[]): Map<string, number> {
    const categoryCounts = new Map<string, number>();
    items.forEach(item => {
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
    });
    return categoryCounts;
  }
  
  /**
   * 格式化分类趋势
   */
  private formatCategoryTrend(category: string): string {
    const categoryNames: Record<string, string> = {
      'research': 'AI研究进展活跃',
      'product': 'AI产品发布密集',
      'funding': 'AI投融资热度高',
      'policy': 'AI政策关注度上升',
      'discussion': 'AI行业讨论热烈'
    };
    return categoryNames[category] || category;
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
