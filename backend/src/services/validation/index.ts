/**
 * 数据验证服务
 * 负责格式验证、逻辑校验、异常检测
 */

import type { NewsItem, ValidationResult, ValidationError, ValidationWarning, Anomaly } from '../../types/index.js';

export class ValidationService {
  /**
   * 验证数据格式
   */
  validateFormat(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // 必填字段检查
    const requiredFields = ['id', 'title', 'category', 'eventType'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({
          field,
          message: `缺少必填字段: ${field}`,
          value: data[field]
        });
      }
    }
    
    // 类型检查
    if (data.tags && !Array.isArray(data.tags)) {
      errors.push({
        field: 'tags',
        message: 'tags必须是数组',
        value: data.tags
      });
    }
    
    if (data.entities && typeof data.entities !== 'object') {
      errors.push({
        field: 'entities',
        message: 'entities必须是对象',
        value: data.entities
      });
    }
    
    // 数据质量检查
    if (data.tags && data.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'tags为空，可能提取失败',
        value: data.tags
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 验证业务逻辑
   */
  validateLogic(item: NewsItem): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // 枚举值检查
    const validCategories = ['research', 'product', 'funding', 'policy', 'discussion'];
    if (!validCategories.includes(item.category)) {
      errors.push({
        field: 'category',
        message: `无效的category: ${item.category}`,
        value: item.category
      });
    }
    
    const validEventTypes = ['breakthrough', 'release', 'funding', 'regulation', 'discussion'];
    if (!validEventTypes.includes(item.eventType)) {
      errors.push({
        field: 'eventType',
        message: `无效的eventType: ${item.eventType}`,
        value: item.eventType
      });
    }
    
    // 数值范围检查
    if (item.sentiment) {
      if (item.sentiment.score < -1 || item.sentiment.score > 1) {
        errors.push({
          field: 'sentiment.score',
          message: `sentiment.score必须在-1到1之间: ${item.sentiment.score}`,
          value: item.sentiment.score
        });
        // 自动修正
        item.sentiment.score = Math.max(-1, Math.min(1, item.sentiment.score));
      }
      
      if (item.sentiment.confidence < 0 || item.sentiment.confidence > 1) {
        errors.push({
          field: 'sentiment.confidence',
          message: `sentiment.confidence必须在0到1之间: ${item.sentiment.confidence}`,
          value: item.sentiment.confidence
        });
        item.sentiment.confidence = Math.max(0, Math.min(1, item.sentiment.confidence));
      }
    }
    
    if (item.significance < 1 || item.significance > 10) {
      errors.push({
        field: 'significance',
        message: `significance必须在1到10之间: ${item.significance}`,
        value: item.significance
      });
      item.significance = Math.max(1, Math.min(10, item.significance));
    }
    
    // 日期合理性检查
    if (item.publishDate) {
      const now = new Date();
      if (item.publishDate > now) {
        warnings.push({
          field: 'publishDate',
          message: '发布日期是未来时间',
          value: item.publishDate
        });
      }
      
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (item.publishDate < oneYearAgo) {
        warnings.push({
          field: 'publishDate',
          message: '发布日期超过一年前',
          value: item.publishDate
        });
      }
    }
    
    // 一致性检查
    if (item.significance > 8 && item.impact?.level === 'low') {
      warnings.push({
        field: 'significance/impact',
        message: '高重要性但低影响，可能不一致',
        value: { significance: item.significance, impact: item.impact.level }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 检测异常数据
   */
  detectAnomalies(items: NewsItem[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // 情感分数异常检测
    const sentimentScores = items
      .filter(item => item.sentiment)
      .map(item => item.sentiment.score);
    
    if (sentimentScores.length > 0) {
      const mean = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
      const stdDev = Math.sqrt(
        sentimentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / sentimentScores.length
      );
      
      items.forEach(item => {
        if (item.sentiment && Math.abs(item.sentiment.score - mean) > 2 * stdDev) {
          anomalies.push({
            type: 'outlier',
            field: 'sentiment.score',
            value: item.sentiment.score,
            reason: `情感分数异常偏离均值 (${mean.toFixed(2)} ± ${stdDev.toFixed(2)})`
          });
        }
      });
    }
    
    // 重复检测
    const titleCounts = new Map<string, number>();
    items.forEach(item => {
      const count = titleCounts.get(item.title) || 0;
      titleCounts.set(item.title, count + 1);
    });
    
    titleCounts.forEach((count, title) => {
      if (count > 1) {
        anomalies.push({
          type: 'duplicate',
          field: 'title',
          value: title,
          reason: `标题重复 ${count} 次`
        });
      }
    });
    
    // 实体为空检测
    items.forEach(item => {
      if (item.entities) {
        const totalEntities = 
          item.entities.companies.length +
          item.entities.products.length +
          item.entities.technologies.length +
          item.entities.people.length;
        
        if (totalEntities === 0) {
          anomalies.push({
            type: 'inconsistent',
            field: 'entities',
            value: item.entities,
            reason: '所有实体字段都为空'
          });
        }
      }
    });
    
    return anomalies;
  }
  
  /**
   * 数据清洗
   */
  cleanItem(item: NewsItem): NewsItem {
    // 实体去重和标准化
    if (item.entities) {
      item.entities.companies = this.deduplicateAndNormalize(item.entities.companies);
      item.entities.products = this.deduplicateAndNormalize(item.entities.products);
      item.entities.technologies = this.deduplicateAndNormalize(item.entities.technologies);
      item.entities.people = this.deduplicateAndNormalize(item.entities.people);
    }
    
    // 标签去重
    if (item.tags) {
      item.tags = this.deduplicateAndNormalize(item.tags);
    }
    
    // 趋势指标去重
    if (item.trendIndicators) {
      item.trendIndicators = this.deduplicateAndNormalize(item.trendIndicators);
    }
    
    // 文本trim
    item.title = item.title?.trim();
    item.summary = item.summary?.trim();
    
    return item;
  }
  
  /**
   * 去重和标准化
   */
  private deduplicateAndNormalize(items: string[]): string[] {
    return Array.from(new Set(
      items
        .map(item => item.trim())
        .filter(item => item.length > 0)
    ));
  }
  
  /**
   * 标记需要人工复核的数据
   */
  markForReview(item: NewsItem): boolean {
    // 低置信度
    if (item.sentiment?.confidence && item.sentiment.confidence < 0.6) {
      item._needsReview = true;
      item._fallbackReason = '情感分析置信度低';
      return true;
    }
    
    // 异常评分
    if (item.significance > 8 && item.impact?.level === 'low') {
      item._needsReview = true;
      item._fallbackReason = '重要性评分与影响等级不一致';
      return true;
    }
    
    // 实体为空
    if (item.entities) {
      const totalEntities = 
        item.entities.companies.length +
        item.entities.products.length +
        item.entities.technologies.length +
        item.entities.people.length;
      
      if (totalEntities === 0) {
        item._needsReview = true;
        item._fallbackReason = '未识别到任何实体';
        return true;
      }
    }
    
    return false;
  }
}

// 导出单例
export const validator = new ValidationService();
