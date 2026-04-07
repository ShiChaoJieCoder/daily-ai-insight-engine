/**
 * 地区判断工具
 * 基于内容和来源智能判断新闻属于国内还是国外
 */

import type { Region } from '../types/report';

// 国内关键词
const DOMESTIC_KEYWORDS = [
  // 中文字符
  /[\u4e00-\u9fa5]/,
  // 国内公司
  /阿里巴巴|腾讯|百度|字节跳动|华为|小米|oppo|vivo|美团|滴滴|京东|拼多多|网易|搜狗|360|商汤|旷视|依图|云从|深兰|科大讯飞|寒武纪|地平线|出门问问|思必驰|云知声/i,
  /alibaba|tencent|baidu|bytedance|huawei|xiaomi|meituan|didi|jd\.com|pinduoduo|netease|sensetime|megvii|yitu|cloudwalk|deepblue|iflytek|cambricon/i,
  // 国内机构
  /中国|中科院|清华|北大|浙大|上交|复旦|南大|中山|武大|哈工大|西交|北航|北理工|电子科大|中科大/i,
  /china|chinese|beijing|shanghai|shenzhen|hangzhou|guangzhou|chengdu/i,
  // 国内媒体
  /新华社|人民日报|央视|光明日报|科技日报|36氪|虎嗅|钛媒体|雷锋网|机器之心|量子位|AI科技评论/i,
];

// 国外关键词
const INTERNATIONAL_KEYWORDS = [
  // 国外公司
  /google|openai|microsoft|meta|facebook|amazon|apple|nvidia|intel|amd|ibm|oracle|salesforce|adobe|tesla|spacex|anthropic|deepmind|cohere|stability\.ai|midjourney|runway/i,
  // 国外机构
  /mit|stanford|berkeley|harvard|cmu|oxford|cambridge|eth|toronto|montreal|nyu|princeton|yale|caltech|cornell/i,
  // 国外媒体
  /techcrunch|verge|wired|ars technica|hacker news|reddit|arxiv|nature|science|ieee/i,
  // 国外地点
  /silicon valley|san francisco|new york|london|paris|berlin|tokyo|seoul|singapore/i,
];

// 国内域名
const DOMESTIC_DOMAINS = [
  '.cn',
  '.com.cn',
  'baidu.com',
  'qq.com',
  'weibo.com',
  'zhihu.com',
  '36kr.com',
  'huxiu.com',
  'tmtpost.com',
  'leiphone.com',
  'jiqizhixin.com',
  'qbitai.com',
];

// 国外域名
const INTERNATIONAL_DOMAINS = [
  'github.com',
  'arxiv.org',
  'reddit.com',
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'arstechnica.com',
  'news.ycombinator.com',
];

/**
 * 判断文本是否包含中文
 */
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 从 URL 中提取域名
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * 检查域名是否属于国内
 */
function isDomesticDomain(url: string): boolean {
  const domain = extractDomain(url);
  return DOMESTIC_DOMAINS.some(d => domain.includes(d));
}

/**
 * 检查域名是否属于国外
 */
function isInternationalDomain(url: string): boolean {
  const domain = extractDomain(url);
  return INTERNATIONAL_DOMAINS.some(d => domain.includes(d));
}

/**
 * 基于关键词判断地区
 */
function detectRegionByKeywords(text: string): Region {
  let domesticScore = 0;
  let internationalScore = 0;

  // 检查国内关键词
  DOMESTIC_KEYWORDS.forEach(pattern => {
    if (pattern.test(text)) {
      domesticScore += 1;
    }
  });

  // 检查国外关键词
  INTERNATIONAL_KEYWORDS.forEach(pattern => {
    if (pattern.test(text)) {
      internationalScore += 1;
    }
  });

  // 包含中文是强信号
  if (containsChinese(text)) {
    domesticScore += 3;
  }

  // 根据得分判断
  if (domesticScore > internationalScore) {
    return 'domestic';
  } else if (internationalScore > domesticScore) {
    return 'international';
  }

  return 'unknown';
}

/**
 * 智能判断新闻地区
 * @param title 标题
 * @param content 内容
 * @param urls 相关链接
 * @returns 地区分类
 */
export function detectRegion(
  title: string,
  content: string,
  urls: string[] = []
): Region {
  // 1. 检查 URL 域名
  for (const url of urls) {
    if (isDomesticDomain(url)) {
      return 'domestic';
    }
    if (isInternationalDomain(url)) {
      return 'international';
    }
  }

  // 2. 基于标题和内容的关键词判断
  const combinedText = `${title} ${content}`;
  const region = detectRegionByKeywords(combinedText);

  if (region !== 'unknown') {
    return region;
  }

  // 3. 默认判断：如果包含中文，倾向于国内；否则国外
  if (containsChinese(combinedText)) {
    return 'domestic';
  }

  return 'international';
}

/**
 * 为报告数据添加地区标签
 */
export function tagWithRegion<T extends { title: string; summary?: string; narrative?: string; related_article_ids?: string[] }>(
  item: T
): T & { region: Region } {
  const content = item.summary || item.narrative || '';
  const urls = item.related_article_ids || [];
  
  const region = detectRegion(item.title, content, urls);
  
  return {
    ...item,
    region,
  };
}
