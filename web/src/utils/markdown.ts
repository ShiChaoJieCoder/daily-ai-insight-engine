/**
 * 清理文本中的 Markdown 标记
 * 将 Markdown 格式转换为纯文本或 HTML
 */

/**
 * 移除所有 Markdown 标记，返回纯文本
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  
  return text
    // 移除粗体标记 **text** 或 __text__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // 移除斜体标记 *text* 或 _text_
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // 移除删除线 ~~text~~
    .replace(/~~(.+?)~~/g, '$1')
    // 移除代码标记 `code`
    .replace(/`(.+?)`/g, '$1')
    // 移除链接 [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // 移除图片 ![alt](url)
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    // 移除标题标记 # ## ### 等
    .replace(/^#{1,6}\s+/gm, '')
    // 移除列表标记 - * +
    .replace(/^[\-\*\+]\s+/gm, '')
    // 移除有序列表标记 1. 2. 等
    .replace(/^\d+\.\s+/gm, '')
    // 移除引用标记 >
    .replace(/^>\s+/gm, '')
    // 移除水平线 --- *** ___
    .replace(/^[\-\*_]{3,}$/gm, '')
    // 清理多余空白
    .trim();
}

/**
 * 风险/机遇等字段：空串、纯空白、或仅用 … / . / - 等占位的内容视为「无正文」
 */
export function normalizeDetailPlainText(raw: string | undefined | null): {
  text: string;
  hasSubstance: boolean;
} {
  const plain = stripMarkdown(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return { text: '', hasSubstance: false };
  if (/^[\s.·⋯…\-—–_]+$/u.test(plain)) return { text: '', hasSubstance: false };
  if (/^\.{1,3}$/.test(plain)) return { text: '', hasSubstance: false };
  if (/^(…|⋯|\.{2,}|。{2,})$/u.test(plain)) return { text: '', hasSubstance: false };
  return { text: plain, hasSubstance: true };
}

/** 超过约两行后再显示「展开」才有意义 */
export const RISK_OPPORTUNITY_EXPAND_MIN_CHARS = 120;

/**
 * 智能格式化内容 - 提取关键信息并美化排版
 */
export function formatContent(text: string): {
  summary: string;
  highlights: string[];
  links: Array<{ text: string; url: string }>;
} {
  if (!text) return { summary: '', highlights: [], links: [] };

  const highlights: string[] = [];
  const links: Array<{ text: string; url: string }> = [];
  let cleanText = text;

  // 提取 TLDR/TL;DR
  const tldrMatch = text.match(/\*\*TL;?DR:?\*\*\s*(.+?)(?=\n\n|\*\*|$)/is);
  if (tldrMatch) {
    highlights.push(tldrMatch[1].trim());
    cleanText = cleanText.replace(tldrMatch[0], '');
  }

  // 提取粗体标记的重点（如 **Paper:**、**Repo:** 等）
  const boldSections = text.match(/\*\*([^*]+?):\*\*\s*([^\n*]+)/g);
  if (boldSections) {
    boldSections.forEach(section => {
      const match = section.match(/\*\*([^*]+?):\*\*\s*(.+)/);
      if (match && !match[1].match(/TL;?DR/i)) {
        highlights.push(`${match[1]}: ${match[2].trim()}`);
        cleanText = cleanText.replace(section, '');
      }
    });
  }

  // 提取 Markdown 链接
  const markdownLinks = text.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (markdownLinks) {
    markdownLinks.forEach(link => {
      const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        links.push({ text: match[1], url: match[2] });
        cleanText = cleanText.replace(link, '');
      }
    });
  }

  // 提取纯 URL
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlPattern);
  if (urls) {
    urls.forEach(url => {
      // 避免重复添加已经在 Markdown 链接中的 URL
      if (!links.some(l => l.url === url)) {
        const domain = url.match(/https?:\/\/([^/]+)/)?.[1] || 'Link';
        links.push({ text: domain, url });
      }
      cleanText = cleanText.replace(url, '');
    });
  }

  // 清理 Markdown 标记
  cleanText = stripMarkdown(cleanText);

  // 清理多余的空白和换行
  cleanText = cleanText
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 截断过长的文本
  const maxLength = 300;
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength).trim() + '...';
  }

  return {
    summary: cleanText,
    highlights: highlights.slice(0, 3), // 最多3个亮点
    links: links.slice(0, 2), // 最多2个链接
  };
}

/**
 * 将 Markdown 转换为简单的 HTML
 * 只处理常见的内联格式
 */
export function markdownToHtml(text: string): string {
  if (!text) return '';
  
  return text
    // 粗体 **text** -> <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // 斜体 *text* -> <em>text</em>
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // 代码 `code` -> <code>code</code>
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 链接 [text](url) -> <a>text</a>
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // 换行
    .replace(/\n/g, '<br>');
}
