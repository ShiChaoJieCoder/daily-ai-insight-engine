/**
 * 前端数据适配器
 * 将后端的DailyReport格式转换为前端期望的InsightReport格式
 */

export class FrontendAdapter {
  /**
   * 转换为前端格式
   */
  static adaptReport(report: any): any {
    // 处理日期（可能是Date对象或字符串）
    const generatedAt = typeof report.meta.generatedAt === 'string' 
      ? report.meta.generatedAt 
      : report.meta.generatedAt.toISOString();
    
    const date = typeof report.meta.date === 'string'
      ? report.meta.date.split('T')[0]
      : report.meta.date.toISOString().split('T')[0];
    
    return {
      meta: {
        generated_at: generatedAt,
        dataset_id: `report-${date}`,
        pipeline_version: report.meta.version,
        article_count: report.meta.newsCount,
        insufficient_data: report.meta.newsCount < 10
      },
      
      // 热点事件（控制在5条）
      hotspots: report.summary.hotTopics.slice(0, 5).map((topic: any) => ({
        id: `hotspot-${topic.rank}`,
        title: topic.title,
        summary: topic.summary,
        related_article_ids: topic.relatedNews
      })),
      
      // 深度洞察（控制在2条）
      deep_dive: report.summary.hotTopics.slice(0, 2).map((topic: any) => ({
        id: `dive-${topic.rank}`,
        title: topic.title,
        narrative: this.generateNarrative(topic, report),
        related_article_ids: topic.relatedNews
      })),
      
      // 趋势分析
      trends: this.extractTrends(report),
      
      // 风险与机遇
      risks_opportunities: this.extractRisksOpportunities(report),
      
      // 图表数据
      charts: this.generateCharts(report)
    };
  }
  
  /**
   * 生成叙述文本
   */
  private static generateNarrative(topic: any, report: any): string {
    // 从原始数据中找到对应的新闻
    const relatedNews = report.rawData.filter((item: any) => 
      topic.relatedNews.includes(item.id)
    );
    
    if (relatedNews.length === 0) {
      return topic.summary;
    }
    
    const news = relatedNews[0];
    
    let narrative = `${topic.summary}\n\n`;
    
    // 添加影响分析
    if (news.impact) {
      narrative += `**影响分析**: ${news.impact.level}级别影响，`;
      narrative += `影响领域包括${news.impact.areas.join('、')}。`;
      narrative += `预计在${news.impact.timeline}产生效果。\n\n`;
    }
    
    // 添加情感分析
    if (news.sentiment) {
      const sentimentLabel = news.sentiment.label === 'positive' ? '积极' : 
                            news.sentiment.label === 'negative' ? '消极' : '中性';
      narrative += `**情感倾向**: ${sentimentLabel}（${(news.sentiment.score * 100).toFixed(0)}%）\n\n`;
    }
    
    // 添加相关实体
    if (news.entities) {
      if (news.entities.companies.length > 0) {
        narrative += `**相关公司**: ${news.entities.companies.join('、')}\n`;
      }
      if (news.entities.technologies.length > 0) {
        narrative += `**相关技术**: ${news.entities.technologies.join('、')}\n`;
      }
    }
    
    return narrative;
  }
  
  /**
   * 提取趋势（每个momentum类型各取2条，总共6条）
   */
  private static extractTrends(report: any): any[] {
    const allTrends: any[] = [];
    
    // 从分析中提取趋势
    if (report.analysis?.trends) {
      Object.entries(report.analysis.trends).forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((trend, idx) => {
            allTrends.push({
              id: `trend-${key}-${idx}`,
              title: trend.title || trend,
              summary: trend.description || trend.summary || trend,
              momentum: this.detectMomentum(trend)
            });
          });
        }
      });
    }
    
    // 如果没有趋势，从热点中生成
    if (allTrends.length === 0) {
      report.summary.hotTopics.forEach((topic: any, idx: number) => {
        allTrends.push({
          id: `trend-${idx}`,
          title: topic.title,
          summary: topic.summary,
          momentum: this.detectMomentumFromTopic(topic, idx)
        });
      });
    }
    
    // 按momentum类型分组，每个类型取2条
    const risingTrends = allTrends.filter(t => t.momentum === 'rising').slice(0, 2);
    const stableTrends = allTrends.filter(t => t.momentum === 'stable').slice(0, 2);
    const coolingTrends = allTrends.filter(t => t.momentum === 'cooling').slice(0, 2);
    
    // 如果某个类型不足2条，从其他热点补充
    const result = [...risingTrends, ...stableTrends, ...coolingTrends];
    
    if (result.length < 6 && report.summary.hotTopics.length >= 6) {
      // 需要补充的数量
      const needed = {
        rising: 2 - risingTrends.length,
        stable: 2 - stableTrends.length,
        cooling: 2 - coolingTrends.length
      };
      
      // 从剩余热点中补充，按顺序分配momentum类型
      const usedIds = new Set(result.map(t => t.id));
      const remainingTopics = report.summary.hotTopics.filter((topic: any) => 
        !usedIds.has(`trend-${topic.rank}`)
      );
      
      let momentumIndex = 0;
      const momentumTypes: Array<'rising' | 'stable' | 'cooling'> = [];
      
      // 构建需要补充的momentum类型列表
      if (needed.rising > 0) momentumTypes.push(...Array(needed.rising).fill('rising'));
      if (needed.stable > 0) momentumTypes.push(...Array(needed.stable).fill('stable'));
      if (needed.cooling > 0) momentumTypes.push(...Array(needed.cooling).fill('cooling'));
      
      remainingTopics.slice(0, momentumTypes.length).forEach((topic: any) => {
        result.push({
          id: `trend-${topic.rank}`,
          title: topic.title,
          summary: topic.summary,
          momentum: momentumTypes[momentumIndex++]
        });
      });
    }
    
    return result;
  }
  
  /**
   * 从热点话题检测动量（带索引用于分配）
   */
  private static detectMomentumFromTopic(topic: any, index: number): 'rising' | 'stable' | 'cooling' {
    const text = (topic.title + ' ' + topic.summary).toLowerCase();
    
    // 检测上升趋势关键词
    if (text.match(/new|launch|breakthrough|surge|growing|rising|boom|emerging|innovative|advance|progress/i)) {
      return 'rising';
    }
    
    // 检测下降趋势关键词
    if (text.match(/decline|falling|cooling|drop|decrease|concern|issue|problem|challenge|risk|threat/i)) {
      return 'cooling';
    }
    
    // 根据索引分配，确保有多样性
    // 0,3 -> rising, 1,4 -> stable, 2,5 -> cooling
    const momentumByIndex: Array<'rising' | 'stable' | 'cooling'> = ['rising', 'stable', 'cooling'];
    return momentumByIndex[index % 3];
  }
  
  /**
   * 检测动量
   */
  private static detectMomentum(trend: any): 'rising' | 'stable' | 'cooling' {
    if (typeof trend === 'string') return 'stable';
    
    const text = (trend.title || '' + trend.description || '').toLowerCase();
    
    if (text.match(/growing|rising|increasing|surge|boom/i)) return 'rising';
    if (text.match(/declining|falling|decreasing|cooling/i)) return 'cooling';
    
    return 'stable';
  }
  
  /**
   * 提取风险与机遇（各2条，总共4条）
   */
  private static extractRisksOpportunities(report: any): any[] {
    const items: any[] = [];
    
    // 从新闻中提取风险（2条）
    const risks = report.rawData
      .filter((item: any) => item.sentiment?.label === 'negative' && item.significance >= 7)
      .slice(0, 2);
    
    // 从新闻中提取机遇（2条）
    const opportunities = report.rawData
      .filter((item: any) => item.sentiment?.label === 'positive' && item.significance >= 7)
      .slice(0, 2);
    
    // 添加风险
    risks.forEach((item: any, idx: number) => {
      items.push({
        id: `risk-${idx}`,
        kind: 'risk',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    // 添加机遇
    opportunities.forEach((item: any, idx: number) => {
      items.push({
        id: `opportunity-${idx}`,
        kind: 'opportunity',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    return items;
  }
  
  /**
   * 生成图表数据
   */
  private static generateCharts(report: any): any[] {
    const charts: any[] = [];
    
    // 1. 事件类型分布（饼图）
    const eventTypeData = Object.entries(report.summary.keyMetrics.eventTypeDistribution)
      .map(([name, value]) => ({ name, value: value as number }));
    
    charts.push({
      id: 'event-type-dist',
      title: '事件类型分布',
      type: 'pie',
      data: eventTypeData
    });
    
    // 2. 情感分布（柱状图）
    const sentimentData = [
      { name: '正面', value: report.summary.keyMetrics.sentimentDistribution.positive },
      { name: '中性', value: report.summary.keyMetrics.sentimentDistribution.neutral },
      { name: '负面', value: report.summary.keyMetrics.sentimentDistribution.negative }
    ];
    
    charts.push({
      id: 'sentiment-dist',
      title: '情感分布',
      type: 'bar',
      data: sentimentData
    });
    
    // 3. 热门公司（柱状图）
    const companyData = report.summary.keyMetrics.topCompanies
      .slice(0, 8)
      .map((c: any) => ({ name: c.name, value: c.count }));
    
    charts.push({
      id: 'top-companies',
      title: '热门公司 Top 8',
      type: 'bar',
      data: companyData
    });
    
    // 4. 热门技术（柱状图）
    const techData = report.summary.keyMetrics.topTechnologies
      .slice(0, 8)
      .map((t: any) => ({ name: t.name, value: t.count }));
    
    charts.push({
      id: 'top-technologies',
      title: '热门技术 Top 8',
      type: 'bar',
      data: techData
    });
    
    return charts;
  }
}
