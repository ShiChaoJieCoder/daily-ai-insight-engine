/**
 * 生成报告脚本
 * 使用方法：npm run generate-report
 */

import { config, validateConfig, DATA_SOURCES } from '../config/index.js';
import { dataFetcher } from '../services/data-fetcher/index.js';
import { aiProcessor } from '../services/ai-processor/index.js';
import { validator } from '../services/validation/index.js';
import { reportGenerator } from '../services/report-generator/index.js';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  try {
    // 验证配置
    validateConfig();
    
    // 获取参数
    const args = process.argv.slice(2);
    const dateArg = args.find(arg => arg.startsWith('--date='));
    const langArg = args.find(arg => arg.startsWith('--lang='));
    const date = dateArg ? new Date(dateArg.split('=')[1]) : new Date();
    const language = (langArg ? langArg.split('=')[1] : 'zh') as 'zh' | 'en';
    
    // 设置语言
    dataFetcher.setLanguage(language);
    
    console.log(`\n========== 开始生成AI舆情分析日报 ==========`);
    console.log(`日期: ${date.toISOString().split('T')[0]}`);
    console.log(`语言: ${language === 'zh' ? '中文' : 'English'}`);
    console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`===========================================\n`);
    
    // 1. 数据获取
    console.log(`[步骤 1/9] 数据获取`);
    const rawData = await dataFetcher.fetchNews(date, DATA_SOURCES);
    console.log(`✓ 获取到 ${rawData.length} 条原始数据\n`);
    
    // 2. 数据清洗
    console.log(`[步骤 2/9] 数据清洗`);
    const cleanedData = await dataFetcher.cleanData(rawData);
    console.log(`✓ 清洗完成，剩余 ${cleanedData.length} 条\n`);
    
    // 3. 数据去重
    console.log(`[步骤 3/9] 数据去重`);
    const deduplicatedData = dataFetcher.deduplicateData(cleanedData);
    console.log(`✓ 去重完成，剩余 ${deduplicatedData.length} 条\n`);
    
    // 4. AI基础提取（批处理）
    console.log(`[步骤 4/9] AI基础提取（分类、标签、实体识别）`);
    const basicExtracted = await aiProcessor.processBatch(
      deduplicatedData,
      (batch) => aiProcessor.extractBasicInfo(batch),
      config.processing.batchSize
    );
    console.log(`✓ 基础提取完成\n`);
    
    // 5. 格式验证
    console.log(`[步骤 5/9] 格式验证`);
    const validatedBasic = basicExtracted.filter(item => {
      const result = validator.validateFormat(item);
      if (!result.isValid) {
        console.warn(`  ⚠ 格式验证失败: ${item.id}`);
        result.errors.forEach(e => console.warn(`    - ${e.message}`));
      }
      return result.isValid;
    });
    console.log(`✓ 验证通过 ${validatedBasic.length} 条\n`);
    
    // 6. AI深度分析
    console.log(`[步骤 6/9] AI深度分析（情感、影响、趋势）`);
    const fullyAnalyzed = await aiProcessor.analyzeInDepth(validatedBasic);
    console.log(`✓ 深度分析完成\n`);
    
    // 7. 逻辑验证与清洗
    console.log(`[步骤 7/9] 逻辑验证与数据清洗`);
    const validatedFull = fullyAnalyzed
      .filter(item => {
        const result = validator.validateLogic(item);
        if (!result.isValid) {
          console.warn(`  ⚠ 逻辑验证失败: ${item.title}`);
          result.errors.forEach(e => console.warn(`    - ${e.message}`));
        }
        if (result.warnings.length > 0) {
          result.warnings.forEach(w => console.warn(`  ⚠ 警告: ${w.message}`));
        }
        return result.isValid;
      })
      .map(item => validator.cleanItem(item));
    console.log(`✓ 验证通过 ${validatedFull.length} 条\n`);
    
    // 8. 异常检测
    console.log(`[步骤 8/9] 异常检测`);
    const anomalies = validator.detectAnomalies(validatedFull);
    if (anomalies.length > 0) {
      console.warn(`  ⚠ 检测到 ${anomalies.length} 个异常数据:`);
      anomalies.forEach(a => console.warn(`    - ${a.type}: ${a.field} - ${a.reason}`));
    } else {
      console.log(`✓ 未检测到异常`);
    }
    
    // 标记需要复核的数据
    validatedFull.forEach(item => validator.markForReview(item));
    const needsReview = validatedFull.filter(item => item._needsReview);
    if (needsReview.length > 0) {
      console.warn(`  ⚠ ${needsReview.length} 条数据需要人工复核`);
      needsReview.forEach(item => {
        console.warn(`    - ${item.title}: ${item._fallbackReason}`);
      });
    }
    console.log();
    
    // 9. 生成报告
    console.log(`[步骤 9/9] 生成报告`);
    const report = await reportGenerator.generateReport(validatedFull, date);
    console.log(`✓ 报告生成完成\n`);
    
    // 10. 保存报告
    console.log(`[保存] 保存报告文件`);
    const dateStr = date.toISOString().split('T')[0];
    await saveReport(report, dateStr, language);
    
    // 统计信息
    console.log(`\n========== 生成统计 ==========`);
    console.log(`原始数据：${rawData.length} 条`);
    console.log(`清洗后：${cleanedData.length} 条`);
    console.log(`去重后：${deduplicatedData.length} 条`);
    console.log(`最终分析：${validatedFull.length} 条`);
    console.log(`异常数据：${anomalies.length} 个`);
    console.log(`需要复核：${needsReview.length} 条`);
    console.log(`热点事件：${report.summary.hotTopics.length} 个`);
    console.log(`==============================\n`);
    
    console.log(`✅ 日报生成成功！`);
    console.log(`📄 JSON报告: data/reports/${dateStr}-report.json`);
    console.log(`📝 Markdown报告: data/reports/${dateStr}-report.md\n`);
    
  } catch (error: any) {
    console.error(`\n❌ 生成失败:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 保存报告
async function saveReport(report: any, dateStr: string, language: 'zh' | 'en' = 'zh') {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  // 文件名后缀
  const suffix = language === 'zh' ? '-cn' : '-en';
  
  // 保存JSON
  const jsonFile = path.join(reportsDir, `${dateStr}-report${suffix}.json`);
  await fs.writeFile(jsonFile, JSON.stringify(report, null, 2));
  console.log(`  ✓ JSON报告已保存: ${jsonFile}`);
  
  // 保存Markdown
  const mdContent = generateMarkdownReport(report);
  const mdFile = path.join(reportsDir, `${dateStr}-report${suffix}.md`);
  await fs.writeFile(mdFile, mdContent);
  console.log(`  ✓ Markdown报告已保存: ${mdFile}`);
}

// 生成Markdown报告
function generateMarkdownReport(report: any): string {
  const date = new Date(report.meta.date).toLocaleDateString('zh-CN');
  
  let md = `# ${date} AI领域日报\n\n`;
  md += `> 生成时间：${new Date(report.meta.generatedAt).toLocaleString('zh-CN')}\n`;
  md += `> 数据来源：${report.meta.dataSourceCount}个数据源\n`;
  md += `> 新闻总数：${report.meta.newsCount}条\n`;
  md += `> 系统版本：${report.meta.version}\n\n`;
  
  md += `---\n\n`;
  
  md += `## 一、今日概览\n\n`;
  md += `### 关键指标\n\n`;
  md += `- **总新闻数**：${report.summary.keyMetrics.totalNews}条\n`;
  md += `- **情感分布**：\n`;
  md += `  - 正面：${report.summary.keyMetrics.sentimentDistribution.positive}条 (${(report.summary.keyMetrics.sentimentDistribution.positive / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n`;
  md += `  - 中性：${report.summary.keyMetrics.sentimentDistribution.neutral}条 (${(report.summary.keyMetrics.sentimentDistribution.neutral / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n`;
  md += `  - 负面：${report.summary.keyMetrics.sentimentDistribution.negative}条 (${(report.summary.keyMetrics.sentimentDistribution.negative / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n`;
  md += `- **事件类型分布**：\n`;
  Object.entries(report.summary.keyMetrics.eventTypeDistribution).forEach(([type, count]: [string, any]) => {
    md += `  - ${type}: ${count}条\n`;
  });
  md += `\n`;
  
  md += `## 二、今日AI领域主要热点\n\n`;
  report.summary.hotTopics.forEach((topic: any) => {
    md += `### ${topic.rank}. ${topic.title}\n\n`;
    md += `**[${topic.significance >= 7 ? '高' : '中'}重要性]** `;
    md += `**[${topic.eventType}]** `;
    md += `**影响领域：${topic.impactAreas.join('、')}**\n\n`;
    md += `${topic.summary}\n\n`;
    md += `---\n\n`;
  });
  
  md += `## 三、重要事件深度分析\n\n`;
  report.analysis.deepDive.forEach((dive: any, idx: number) => {
    md += `### ${idx + 1}. ${dive.title}\n\n`;
    md += `**事件背景**\n\n`;
    md += `${dive.background}\n\n`;
    md += `**影响分析**\n\n`;
    if (dive.impactAnalysis.industry) md += `- **行业影响**：${dive.impactAnalysis.industry}\n`;
    if (dive.impactAnalysis.technology) md += `- **技术影响**：${dive.impactAnalysis.technology}\n`;
    if (dive.impactAnalysis.market) md += `- **市场影响**：${dive.impactAnalysis.market}\n`;
    md += `\n**关键洞察**\n\n`;
    dive.keyInsights.forEach((insight: string) => md += `- ${insight}\n`);
    md += `\n---\n\n`;
  });
  
  md += `## 四、趋势判断与洞察\n\n`;
  if (report.analysis.trends.technology.length > 0) {
    md += `### 技术趋势\n\n`;
    report.analysis.trends.technology.forEach((t: string) => md += `- ${t}\n`);
    md += `\n`;
  }
  if (report.analysis.trends.application.length > 0) {
    md += `### 应用趋势\n\n`;
    report.analysis.trends.application.forEach((t: string) => md += `- ${t}\n`);
    md += `\n`;
  }
  if (report.analysis.trends.policy.length > 0) {
    md += `### 政策趋势\n\n`;
    report.analysis.trends.policy.forEach((t: string) => md += `- ${t}\n`);
    md += `\n`;
  }
  if (report.analysis.trends.capital.length > 0) {
    md += `### 资本趋势\n\n`;
    report.analysis.trends.capital.forEach((t: string) => md += `- ${t}\n`);
    md += `\n`;
  }
  
  md += `## 五、热门公司 Top 10\n\n`;
  report.summary.keyMetrics.topCompanies.forEach((c: any, idx: number) => {
    md += `${idx + 1}. **${c.name}** - ${c.count}次提及\n`;
  });
  
  md += `\n## 六、热门技术 Top 10\n\n`;
  report.summary.keyMetrics.topTechnologies.forEach((t: any, idx: number) => {
    md += `${idx + 1}. **${t.name}** - ${t.count}次提及\n`;
  });
  
  md += `\n---\n\n`;
  md += `*本报告由AI自动生成，数据来源于公开渠道，仅供参考*\n`;
  
  return md;
}

// 运行
main();
