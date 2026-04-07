/**
 * 后端服务入口
 */

import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import { dataFetcher } from './services/data-fetcher/index.js';
import { aiProcessor } from './services/ai-processor/index.js';
import { validator } from './services/validation/index.js';
import { reportGenerator } from './services/report-generator/index.js';
import { FrontendAdapter } from './adapters/frontend-adapter.js';
import { promises as fs } from 'fs';
import path from 'path';

// 验证配置
validateConfig();

const app = express();

// 中间件
app.use(cors({ origin: config.server.cors.origin }));
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 获取最新报告
app.get('/api/reports/latest', async (req, res) => {
  try {
    const reportsDir = path.join(process.cwd(), 'data', 'reports');
    const files = await fs.readdir(reportsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
    
    if (jsonFiles.length === 0) {
      return res.status(404).json({ error: '没有找到报告' });
    }
    
    const latestFile = path.join(reportsDir, jsonFiles[0]);
    const content = await fs.readFile(latestFile, 'utf-8');
    const report = JSON.parse(content);
    
    // 转换为前端格式
    const frontendReport = FrontendAdapter.adaptReport(report);
    
    res.json(frontendReport);
  } catch (error: any) {
    console.error('[API] 获取最新报告失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取指定日期的报告
app.get('/api/reports/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const reportFile = path.join(process.cwd(), 'data', 'reports', `${date}-report.json`);
    
    const content = await fs.readFile(reportFile, 'utf-8');
    const report = JSON.parse(content);
    
    // 转换为前端格式
    const frontendReport = FrontendAdapter.adaptReport(report);
    
    res.json(frontendReport);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '报告不存在' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 生成报告的核心逻辑（提取为独立函数，便于复用）
async function generateReportForDate(date: Date) {
  console.log(`\n========== 开始生成日报 ==========`);
  console.log(`日期: ${date.toISOString().split('T')[0]}`);
  
  // 1. 数据获取
  const rawData = await dataFetcher.fetchNews(date, config.dataSources);
  
  // 2. 数据清洗
  const cleanedData = await dataFetcher.cleanData(rawData);
  const deduplicatedData = dataFetcher.deduplicateData(cleanedData);
  
  // 3. AI基础提取（批处理）
  const basicExtracted = await aiProcessor.processBatch(
    deduplicatedData,
    (batch) => aiProcessor.extractBasicInfo(batch),
    config.processing.batchSize
  );
  
  // 4. 数据验证
  const validatedBasic = basicExtracted.filter(item => {
    const result = validator.validateFormat(item);
    if (!result.isValid) {
      console.warn(`[Validation] 格式验证失败:`, result.errors);
    }
    return result.isValid;
  });
  
  // 5. AI深度分析
  const fullyAnalyzed = await aiProcessor.analyzeInDepth(validatedBasic);
  
  // 6. 数据验证与清洗
  const validatedFull = fullyAnalyzed
    .filter(item => {
      const result = validator.validateLogic(item);
      if (!result.isValid) {
        console.warn(`[Validation] 逻辑验证失败:`, result.errors);
      }
      if (result.warnings.length > 0) {
        console.warn(`[Validation] 警告:`, result.warnings);
      }
      return result.isValid;
    })
    .map(item => validator.cleanItem(item));
  
  // 7. 异常检测
  const anomalies = validator.detectAnomalies(validatedFull);
  if (anomalies.length > 0) {
    console.warn(`[Validation] 检测到 ${anomalies.length} 个异常数据`);
    anomalies.forEach(a => console.warn(`  - ${a.type}: ${a.field} - ${a.reason}`));
  }
  
  // 8. 标记需要复核的数据
  validatedFull.forEach(item => validator.markForReview(item));
  const needsReview = validatedFull.filter(item => item._needsReview);
  if (needsReview.length > 0) {
    console.warn(`[Validation] ${needsReview.length} 条数据需要人工复核`);
  }
  
  // 9. 生成报告
  const report = await reportGenerator.generateReport(validatedFull, date);
  
  // 10. 保存报告
  const dateStr = date.toISOString().split('T')[0];
  await saveReport(report, dateStr);
  
  console.log(`========== 日报生成完成 ==========\n`);
  
  return {
    report,
    stats: {
      rawCount: rawData.length,
      cleanedCount: deduplicatedData.length,
      analyzedCount: validatedFull.length,
      anomalyCount: anomalies.length,
      reviewCount: needsReview.length
    }
  };
}

// 生成新报告
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { date: dateStr } = req.body;
    const date = dateStr ? new Date(dateStr) : new Date();
    
    const result = await generateReportForDate(date);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error: any) {
    console.error('[Error] 生成报告失败:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// 保存报告
async function saveReport(report: any, dateStr: string) {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  // 保存JSON
  const jsonFile = path.join(reportsDir, `${dateStr}-report.json`);
  await fs.writeFile(jsonFile, JSON.stringify(report, null, 2));
  console.log(`[Save] JSON报告已保存: ${jsonFile}`);
  
  // 保存Markdown（简化版）
  const mdContent = generateMarkdownReport(report);
  const mdFile = path.join(reportsDir, `${dateStr}-report.md`);
  await fs.writeFile(mdFile, mdContent);
  console.log(`[Save] Markdown报告已保存: ${mdFile}`);
}

// 生成Markdown报告
function generateMarkdownReport(report: any): string {
  const date = new Date(report.meta.date).toLocaleDateString('zh-CN');
  
  let md = `# ${date} AI领域日报\n\n`;
  md += `> 生成时间：${new Date(report.meta.generatedAt).toLocaleString('zh-CN')}\n`;
  md += `> 数据来源：${report.meta.dataSourceCount}个数据源\n`;
  md += `> 新闻总数：${report.meta.newsCount}条\n\n`;
  
  md += `## 一、今日概览\n\n`;
  md += `### 关键指标\n\n`;
  md += `- 总新闻数：${report.summary.keyMetrics.totalNews}条\n`;
  md += `- 情感分布：\n`;
  md += `  - 正面：${report.summary.keyMetrics.sentimentDistribution.positive}条 (${(report.summary.keyMetrics.sentimentDistribution.positive / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n`;
  md += `  - 中性：${report.summary.keyMetrics.sentimentDistribution.neutral}条 (${(report.summary.keyMetrics.sentimentDistribution.neutral / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n`;
  md += `  - 负面：${report.summary.keyMetrics.sentimentDistribution.negative}条 (${(report.summary.keyMetrics.sentimentDistribution.negative / report.summary.keyMetrics.totalNews * 100).toFixed(1)}%)\n\n`;
  
  md += `## 二、今日AI领域主要热点\n\n`;
  report.summary.hotTopics.forEach((topic: any) => {
    md += `### ${topic.rank}. ${topic.title}\n\n`;
    md += `**[${topic.significance >= 7 ? '高' : '中'}重要性]** `;
    md += `**[${topic.eventType}]** `;
    md += `**影响领域：${topic.impactAreas.join('、')}**\n\n`;
    md += `${topic.summary}\n\n`;
  });
  
  md += `## 三、趋势判断\n\n`;
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
  
  md += `## 四、热门公司\n\n`;
  report.summary.keyMetrics.topCompanies.slice(0, 5).forEach((c: any) => {
    md += `- ${c.name} (${c.count}次提及)\n`;
  });
  
  md += `\n## 五、热门技术\n\n`;
  report.summary.keyMetrics.topTechnologies.slice(0, 5).forEach((t: any) => {
    md += `- ${t.name} (${t.count}次提及)\n`;
  });
  
  md += `\n---\n\n`;
  md += `*本报告由AI自动生成，仅供参考*\n`;
  
  return md;
}

// 检查今日报告是否存在
async function checkTodayReport(): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const reportFile = path.join(process.cwd(), 'data', 'reports', `${today}-report.json`);
    
    await fs.access(reportFile);
    return true;
  } catch {
    return false;
  }
}

// 启动时自动生成今日报告
async function autoGenerateTodayReport() {
  try {
    const hasReport = await checkTodayReport();
    
    if (hasReport) {
      const today = new Date().toISOString().split('T')[0];
      console.log(`✓ 今日报告已存在 (${today})`);
      return;
    }
    
    console.log(`\n📝 检测到今日报告不存在，开始自动生成...`);
    
    const date = new Date();
    await generateReportForDate(date);
    
    console.log(`✓ 今日报告自动生成成功！\n`);
    
  } catch (error: any) {
    console.error(`\n❌ 自动生成今日报告失败:`, error.message);
    console.error(`提示：你可以稍后手动调用 POST /api/reports/generate 来生成报告\n`);
  }
}

// 启动服务器
const PORT = config.server.port;
app.listen(PORT, async () => {
  console.log(`\n🚀 服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
  
  // 启动后自动检查并生成今日报告
  await autoGenerateTodayReport();
});
