/**
 * 生成报告脚本（使用模拟分析器）
 * 不依赖AI API，适合演示和开发
 * 使用方法：npm run generate-report-mock
 */

import { config, validateConfig, DATA_SOURCES } from '../config/index.js';
import { dataFetcher } from '../services/data-fetcher/index.js';
import { mockAnalyzer } from '../services/mock-analyzer/index.js';
import { reportGenerator } from '../services/report-generator/index.js';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  try {
    const args = process.argv.slice(2);
    const dateArg = args.find(arg => arg.startsWith('--date='));
    const date = dateArg ? new Date(dateArg.split('=')[1]) : new Date();
    
    console.log(`\n========== 开始生成AI舆情分析日报（模拟模式）==========`);
    console.log(`日期: ${date.toISOString().split('T')[0]}`);
    console.log(`时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`模式: 智能分析（无需AI API）`);
    console.log(`===========================================\n`);
    
    // 1. 数据获取
    console.log(`[步骤 1/5] 数据获取`);
    const rawData = await dataFetcher.fetchNews(date, DATA_SOURCES);
    console.log(`✓ 获取到 ${rawData.length} 条原始数据\n`);
    
    // 2. 数据清洗
    console.log(`[步骤 2/5] 数据清洗`);
    const cleanedData = await dataFetcher.cleanData(rawData);
    console.log(`✓ 清洗完成，剩余 ${cleanedData.length} 条\n`);
    
    // 3. 数据去重
    console.log(`[步骤 3/5] 数据去重`);
    const deduplicatedData = dataFetcher.deduplicateData(cleanedData);
    console.log(`✓ 去重完成，剩余 ${deduplicatedData.length} 条\n`);
    
    // 4. 智能分析（使用规则引擎）
    console.log(`[步骤 4/5] 智能分析（分类、标签、实体、情感）`);
    const analyzedData = await mockAnalyzer.analyzeNews(deduplicatedData);
    console.log(`✓ 分析完成，成功 ${analyzedData.length} 条\n`);
    
    // 5. 生成报告
    console.log(`[步骤 5/5] 生成报告`);
    const report = await reportGenerator.generateReport(analyzedData, date);
    console.log(`✓ 报告生成完成\n`);
    
    // 6. 保存报告
    console.log(`[保存] 保存报告文件`);
    const dateStr = date.toISOString().split('T')[0];
    await saveReport(report, dateStr);
    
    // 统计信息
    console.log(`\n========== 生成统计 ==========`);
    console.log(`原始数据：${rawData.length} 条`);
    console.log(`清洗后：${cleanedData.length} 条`);
    console.log(`去重后：${deduplicatedData.length} 条`);
    console.log(`最终分析：${analyzedData.length} 条`);
    console.log(`热点事件：${report.hotspots.length} 个`);
    console.log(`深度分析：${report.deep_dive.length} 篇`);
    console.log(`趋势判断：${report.trends.length} 个`);
    console.log(`图表数量：${report.charts.length} 个`);
    console.log(`==============================\n`);
    
    console.log(`✅ 日报生成成功！`);
    console.log(`📄 JSON报告: data/reports/${dateStr}-report.json`);
    console.log(`📝 Markdown报告: data/reports/${dateStr}-report.md`);
    console.log(`\n💡 提示: 将JSON报告复制到 web/src/data/sample-report.json 即可在前端查看\n`);
    
  } catch (error: any) {
    console.error(`\n❌ 生成失败:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 保存报告
async function saveReport(report: any, dateStr: string) {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  // 保存JSON
  const jsonFile = path.join(reportsDir, `${dateStr}-report.json`);
  await fs.writeFile(jsonFile, JSON.stringify(report, null, 2));
  console.log(`  ✓ JSON报告已保存`);
  
  // 保存Markdown
  const mdContent = generateMarkdownReport(report);
  const mdFile = path.join(reportsDir, `${dateStr}-report.md`);
  await fs.writeFile(mdFile, mdContent);
  console.log(`  ✓ Markdown报告已保存`);
}

// 生成Markdown报告
function generateMarkdownReport(report: any): string {
  const date = new Date(report.meta.generated_at).toLocaleDateString('zh-CN');
  
  let md = `# ${date} AI领域日报\n\n`;
  md += `> 生成时间：${new Date(report.meta.generated_at).toLocaleString('zh-CN')}\n`;
  md += `> 数据集ID：${report.meta.dataset_id}\n`;
  md += `> 新闻总数：${report.meta.article_count}条\n\n`;
  md += `---\n\n`;
  
  md += `## 一、今日热点\n\n`;
  report.hotspots.forEach((hotspot: any, index: number) => {
    md += `### ${index + 1}. ${hotspot.title}\n\n`;
    md += `${hotspot.summary}\n\n`;
    md += `---\n\n`;
  });
  
  md += `## 二、深度分析\n\n`;
  report.deep_dive.forEach((dive: any, index: number) => {
    md += `### ${index + 1}. ${dive.title}\n\n`;
    md += `${dive.narrative}\n\n`;
    md += `---\n\n`;
  });
  
  md += `## 三、趋势判断\n\n`;
  report.trends.forEach((trend: any) => {
    md += `### ${trend.title} [${trend.momentum}]\n\n`;
    md += `${trend.summary}\n\n`;
  });
  
  if (report.risks_opportunities && report.risks_opportunities.length > 0) {
    md += `\n## 四、风险与机遇\n\n`;
    report.risks_opportunities.forEach((ro: any) => {
      md += `### ${ro.kind === 'risk' ? '⚠️ 风险' : '✨ 机遇'}: ${ro.title}\n\n`;
      md += `${ro.detail}\n\n`;
    });
  }
  
  md += `\n---\n\n`;
  md += `*本报告由智能分析系统自动生成，数据来源于公开渠道，仅供参考*\n`;
  
  return md;
}

// 运行
main();
