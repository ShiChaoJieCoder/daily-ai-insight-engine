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
      
      // 热点事件（保留所有，前端会根据需要显示）
      hotspots: report.summary.hotTopics.map((topic: any) => ({
        id: `hotspot-${topic.rank}`,
        title: topic.title,
        summary: this.cleanSummary(topic.summary, topic.title),
        related_article_ids: topic.relatedNews
      })),
      
      // 深度洞察（使用后端生成的深度分析，包含国内外各2条）
      deep_dive: report.analysis.deepDive ? report.analysis.deepDive.map((dive: any, index: number) => ({
        id: `dive-${index}`,
        title: dive.title,
        narrative: this.formatDeepDiveNarrative(dive),
        related_article_ids: [dive.newsId]
      })) : report.summary.hotTopics.slice(0, 4).map((topic: any) => ({
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
   * 清理摘要文本，移除无效内容
   */
  private static cleanSummary(summary: string | undefined, title: string): string {
    // 如果没有摘要或摘要无效（只有一个点、空白等），从标题生成简短描述
    if (!summary || summary.trim() === '.' || summary.trim() === '' || summary.trim().length < 10) {
      // 从标题提取前100个字符作为摘要
      return title.substring(0, 100) + (title.length > 100 ? '...' : '');
    }
    
    // 移除多余的空白和HTML标签
    return summary
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/&nbsp;/g, ' ') // 替换&nbsp;
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }
  
  /**
   * 格式化深度分析的叙述文本
   */
  private static formatDeepDiveNarrative(dive: any): string {
    let narrative = `${dive.background}\n\n`;
    
    // 添加关键洞察
    if (dive.keyInsights && dive.keyInsights.length > 0) {
      dive.keyInsights.forEach((insight: string) => {
        narrative += `**${insight}**\n\n`;
      });
    }
    
    // 添加影响分析
    if (dive.impactAnalysis) {
      if (dive.impactAnalysis.industry) {
        narrative += `**行业影响**: ${dive.impactAnalysis.industry}\n\n`;
      }
      if (dive.impactAnalysis.technology) {
        narrative += `**技术影响**: ${dive.impactAnalysis.technology}\n\n`;
      }
      if (dive.impactAnalysis.market) {
        narrative += `**市场影响**: ${dive.impactAnalysis.market}\n\n`;
      }
    }
    
    return narrative;
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
   * 提取趋势（总数10条，国内6条+国际4条）
   */
  private static extractTrends(report: any): any[] {
    const allTrends: any[] = [];
    
    // 从分析中提取趋势
    if (report.analysis?.trends) {
      Object.entries(report.analysis.trends).forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((trend, idx) => {
            const summary = trend.description || trend.summary || trend;
            allTrends.push({
              id: `trend-${key}-${idx}`,
              title: trend.title || trend,
              summary: this.cleanSummary(summary, trend.title || trend),
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
          summary: this.cleanSummary(topic.summary, topic.title),
          momentum: this.detectMomentumFromTopic(topic, idx)
        });
      });
    }
    
    // 1. 按国内/国外分类
    const domesticTrends = allTrends.filter(t => /[\u4e00-\u9fff]/.test(t.title));
    const internationalTrends = allTrends.filter(t => !/[\u4e00-\u9fff]/.test(t.title));
    
    console.log(`[Trends] 国内趋势: ${domesticTrends.length} 条, 国际趋势: ${internationalTrends.length} 条`);
    
    // 2. 在每个分类内按momentum分组
    const groupByMomentum = (trends: any[]) => ({
      rising: trends.filter(t => t.momentum === 'rising'),
      stable: trends.filter(t => t.momentum === 'stable'),
      cooling: trends.filter(t => t.momentum === 'cooling')
    });
    
    const domesticGroups = groupByMomentum(domesticTrends);
    const internationalGroups = groupByMomentum(internationalTrends);
    
    // 3. 从每个分类中选取，确保多样性（国内5条，国际5条，总共10条）
    const result: any[] = [];
    
    // 国内：每个momentum类型取1-2条，总共5条
    result.push(...domesticGroups.rising.slice(0, 2));
    result.push(...domesticGroups.stable.slice(0, 2));
    result.push(...domesticGroups.cooling.slice(0, 1));
    
    // 国际：每个momentum类型取1-2条，总共5条
    result.push(...internationalGroups.rising.slice(0, 2));
    result.push(...internationalGroups.stable.slice(0, 2));
    result.push(...internationalGroups.cooling.slice(0, 1));
    
    console.log(`[Trends] 选取国内: ${result.filter(t => /[\u4e00-\u9fff]/.test(t.title)).length} 条, 国际: ${result.filter(t => !/[\u4e00-\u9fff]/.test(t.title)).length} 条`);
    
    // 4. 限制总数为10条（防止超出）
    return result.slice(0, 10);
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
   * 提取风险与机遇（国内外各有，总共6条）
   */
  private static extractRisksOpportunities(report: any): any[] {
    const items: any[] = [];
    
    // 分类所有新闻
    const domesticNews = report.rawData.filter((item: any) => /[\u4e00-\u9fff]/.test(item.title));
    const internationalNews = report.rawData.filter((item: any) => !/[\u4e00-\u9fff]/.test(item.title));
    
    // 从国内新闻中提取风险和机遇（降低门槛，按significance排序）
    const domesticRisks = domesticNews
      .filter((item: any) => item.sentiment?.label === 'negative' || item.significance >= 7)
      .sort((a: any, b: any) => b.significance - a.significance)
      .slice(0, 1);
    const domesticOpportunities = domesticNews
      .filter((item: any) => item.sentiment?.label === 'positive' || item.significance >= 7)
      .sort((a: any, b: any) => b.significance - a.significance)
      .slice(0, 2);
    
    // 如果国内机遇不足，从高significance的新闻中补充
    if (domesticOpportunities.length < 2) {
      const additional = domesticNews
        .filter((item: any) => !domesticOpportunities.includes(item) && !domesticRisks.includes(item))
        .sort((a: any, b: any) => b.significance - a.significance)
        .slice(0, 2 - domesticOpportunities.length);
      domesticOpportunities.push(...additional);
    }
    
    // 从国际新闻中提取风险和机遇
    const internationalRisks = internationalNews
      .filter((item: any) => item.sentiment?.label === 'negative' || item.significance >= 7)
      .sort((a: any, b: any) => b.significance - a.significance)
      .slice(0, 1);
    const internationalOpportunities = internationalNews
      .filter((item: any) => item.sentiment?.label === 'positive' || item.significance >= 7)
      .sort((a: any, b: any) => b.significance - a.significance)
      .slice(0, 2);
    
    // 如果国际机遇不足，从高significance的新闻中补充
    if (internationalOpportunities.length < 2) {
      const additional = internationalNews
        .filter((item: any) => !internationalOpportunities.includes(item) && !internationalRisks.includes(item))
        .sort((a: any, b: any) => b.significance - a.significance)
        .slice(0, 2 - internationalOpportunities.length);
      internationalOpportunities.push(...additional);
    }
    
    // 添加国内风险
    domesticRisks.forEach((item: any, idx: number) => {
      items.push({
        id: `risk-domestic-${idx}`,
        kind: 'risk',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    // 添加国际风险
    internationalRisks.forEach((item: any, idx: number) => {
      items.push({
        id: `risk-international-${idx}`,
        kind: 'risk',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    // 添加国内机遇
    domesticOpportunities.forEach((item: any, idx: number) => {
      items.push({
        id: `opportunity-domestic-${idx}`,
        kind: 'opportunity',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    // 添加国际机遇
    internationalOpportunities.forEach((item: any, idx: number) => {
      items.push({
        id: `opportunity-international-${idx}`,
        kind: 'opportunity',
        title: item.title,
        detail: item.summary || item.content?.substring(0, 200) || ''
      });
    });
    
    console.log(`[RisksOpportunities] 国内: ${domesticRisks.length + domesticOpportunities.length} 条 (风险${domesticRisks.length}, 机遇${domesticOpportunities.length}), 国际: ${internationalRisks.length + internationalOpportunities.length} 条 (风险${internationalRisks.length}, 机遇${internationalOpportunities.length})`);
    
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
