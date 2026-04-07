/**
 * 报告数据适配器
 * 将后端返回的报告格式转换为前端期望的格式
 */

import type { InsightReport } from '../types/report';

export class ReportAdapter {
  /**
   * 将后端报告转换为前端格式
   */
  static adaptBackendReport(backendReport: any): InsightReport {
    return {
      meta: {
        generated_at: backendReport.meta.generatedAt,
        dataset_id: `${backendReport.meta.date}-${backendReport.meta.language}`,
        pipeline_version: backendReport.meta.version,
        article_count: backendReport.meta.newsCount,
        insufficient_data: false,
      },
      hotspots: backendReport.summary.hotTopics.map((topic: any, index: number) => ({
        id: `hotspot-${index + 1}`,
        title: topic.title,
        summary: topic.summary,
        related_article_ids: topic.relatedArticleIds || [],
      })),
      deep_dive: backendReport.analysis.deepDive.map((dive: any, index: number) => ({
        id: `dive-${index + 1}`,
        title: dive.title,
        narrative: this.formatDeepDiveNarrative(dive),
        related_article_ids: [],
      })),
      trends: this.extractTrends(backendReport.analysis.trends),
      risks_opportunities: backendReport.analysis.risksOpportunities?.map((item: any, index: number) => ({
        id: `ro-${index + 1}`,
        kind: item.type,
        title: item.title,
        detail: item.description,
      })) || [],
      charts: this.convertCharts(backendReport.charts),
    };
  }
  
  /**
   * 格式化深度分析的叙述文本
   */
  private static formatDeepDiveNarrative(dive: any): string {
    let narrative = `${dive.background}\n\n`;
    
    if (dive.impactAnalysis) {
      narrative += '**影响分析**\n\n';
      if (dive.impactAnalysis.industry) {
        narrative += `- 行业影响：${dive.impactAnalysis.industry}\n`;
      }
      if (dive.impactAnalysis.technology) {
        narrative += `- 技术影响：${dive.impactAnalysis.technology}\n`;
      }
      if (dive.impactAnalysis.market) {
        narrative += `- 市场影响：${dive.impactAnalysis.market}\n`;
      }
      narrative += '\n';
    }
    
    if (dive.keyInsights && dive.keyInsights.length > 0) {
      narrative += '**关键洞察**\n\n';
      dive.keyInsights.forEach((insight: string) => {
        narrative += `- ${insight}\n`;
      });
    }
    
    return narrative;
  }
  
  /**
   * 提取趋势数据
   */
  private static extractTrends(trends: any): any[] {
    const allTrends: any[] = [];
    let id = 1;
    
    if (trends.technology) {
      trends.technology.forEach((trend: string) => {
        allTrends.push({
          id: `trend-${id++}`,
          title: '技术趋势',
          summary: trend,
          momentum: 'rising' as const,
        });
      });
    }
    
    if (trends.application) {
      trends.application.forEach((trend: string) => {
        allTrends.push({
          id: `trend-${id++}`,
          title: '应用趋势',
          summary: trend,
          momentum: 'rising' as const,
        });
      });
    }
    
    if (trends.policy) {
      trends.policy.forEach((trend: string) => {
        allTrends.push({
          id: `trend-${id++}`,
          title: '政策趋势',
          summary: trend,
          momentum: 'stable' as const,
        });
      });
    }
    
    if (trends.capital) {
      trends.capital.forEach((trend: string) => {
        allTrends.push({
          id: `trend-${id++}`,
          title: '资本趋势',
          summary: trend,
          momentum: 'rising' as const,
        });
      });
    }
    
    return allTrends;
  }
  
  /**
   * 转换图表数据
   */
  private static convertCharts(charts: any): any[] {
    const result: any[] = [];
    
    if (charts.eventTypeDistribution) {
      result.push({
        id: 'event-type-dist',
        title: '事件类型分布',
        type: 'pie' as const,
        data: charts.eventTypeDistribution.map((item: any) => ({
          name: item.name,
          value: item.value,
        })),
      });
    }
    
    if (charts.sentimentTrend) {
      result.push({
        id: 'sentiment-trend',
        title: '情感趋势',
        type: 'line' as const,
        data: charts.sentimentTrend.flatMap((item: any) => [
          { name: `${item.date}-正面`, value: item.positive },
          { name: `${item.date}-中性`, value: item.neutral },
          { name: `${item.date}-负面`, value: item.negative },
        ]),
      });
    }
    
    if (charts.topCompanies) {
      result.push({
        id: 'top-companies',
        title: '热门公司',
        type: 'bar' as const,
        data: charts.topCompanies.map((item: any) => ({
          name: item.name,
          value: item.mentions,
        })),
      });
    }
    
    if (charts.topTechnologies) {
      result.push({
        id: 'top-technologies',
        title: '热门技术',
        type: 'bar' as const,
        data: charts.topTechnologies.map((item: any) => ({
          name: item.name,
          value: item.mentions,
        })),
      });
    }
    
    return result;
  }
}
