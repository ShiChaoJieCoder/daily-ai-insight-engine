/**
 * 数据获取服务
 * 负责从各个数据源获取AI相关新闻
 * 
 * 注意：本demo使用mock数据演示，实际项目中需要实现真实的API调用
 */

import type { RawNewsItem, DataSource } from '../../types/index.js';

export class DataFetcherService {
  /**
   * 获取新闻数据
   * 
   * TODO: 实现真实的数据源调用
   * - Hacker News API
   * - Reddit API
   * - RSS Parser
   * - arXiv API
   */
  async fetchNews(date: Date, sources: DataSource[]): Promise<RawNewsItem[]> {
    console.log(`[DataFetcher] 开始获取数据，日期: ${date.toISOString().split('T')[0]}`);
    console.log(`[DataFetcher] 数据源: ${sources.map(s => s.name).join(', ')}`);
    
    // 使用mock数据演示
    const mockData = this.getMockData();
    
    console.log(`[DataFetcher] 获取到 ${mockData.length} 条原始数据`);
    return mockData;
  }
  
  /**
   * 数据清洗
   */
  async cleanData(items: RawNewsItem[]): Promise<RawNewsItem[]> {
    console.log(`[DataFetcher] 开始数据清洗，共 ${items.length} 条`);
    
    // 移除空标题或空内容
    const cleaned = items.filter(item => 
      item.title && item.title.trim().length > 0 &&
      item.content && item.content.trim().length > 0
    );
    
    // 文本清理
    cleaned.forEach(item => {
      item.title = item.title.trim();
      item.content = item.content.trim();
      // 移除HTML标签（简单处理）
      item.content = item.content.replace(/<[^>]*>/g, '');
    });
    
    console.log(`[DataFetcher] 清洗完成，剩余 ${cleaned.length} 条`);
    return cleaned;
  }
  
  /**
   * 数据去重
   */
  deduplicateData(items: RawNewsItem[]): RawNewsItem[] {
    console.log(`[DataFetcher] 开始去重，共 ${items.length} 条`);
    
    const seen = new Set<string>();
    const deduplicated = items.filter(item => {
      // 基于URL去重
      if (seen.has(item.url)) {
        return false;
      }
      seen.add(item.url);
      
      // 基于标题相似度去重（简单处理）
      const titleLower = item.title.toLowerCase();
      for (const seenTitle of Array.from(seen)) {
        if (this.similarity(titleLower, seenTitle.toLowerCase()) > 0.8) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`[DataFetcher] 去重完成，剩余 ${deduplicated.length} 条`);
    return deduplicated;
  }
  
  /**
   * 计算字符串相似度（简单实现）
   */
  private similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * 编辑距离（简单实现）
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
  
  /**
   * Mock数据（用于演示）
   * 实际项目中应该从真实API获取
   */
  private getMockData(): RawNewsItem[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return [
      {
        title: "OpenAI Announces GPT-5 Development Progress",
        content: "OpenAI CEO Sam Altman revealed in an internal meeting that GPT-5 training is nearing completion. The new model is expected to bring significant improvements in reasoning capabilities, multimodal understanding, and efficiency. Industry experts believe this could trigger a new round of AI competition among major tech companies.",
        url: "https://example.com/news/1",
        source: "TechCrunch",
        publishDate: yesterday,
        author: "Sarah Johnson"
      },
      {
        title: "EU AI Act Officially Takes Effect",
        content: "The European Union's AI Act has officially come into force, marking a milestone in global AI regulation. The legislation establishes a risk-based framework for AI systems, with strict requirements for high-risk applications. This is expected to have far-reaching implications for AI companies operating in Europe.",
        url: "https://example.com/news/2",
        source: "The Verge",
        publishDate: yesterday
      },
      {
        title: "Anthropic Raises $2B in Series C Funding",
        content: "AI safety company Anthropic has secured $2 billion in Series C funding, led by Google and Salesforce Ventures. The company plans to use the funds to scale its Claude AI assistant and advance its research in AI alignment and safety. This brings Anthropic's total funding to over $7 billion.",
        url: "https://example.com/news/3",
        source: "VentureBeat",
        publishDate: yesterday
      },
      {
        title: "New Research: Transformers Reach 100 Trillion Parameters",
        content: "Researchers from Stanford and MIT have published a paper demonstrating a new training technique that enables transformer models to scale to 100 trillion parameters. The breakthrough could enable more capable AI systems but also raises concerns about computational costs and environmental impact.",
        url: "https://example.com/news/4",
        source: "arXiv",
        publishDate: yesterday,
        author: "Dr. Emily Chen et al."
      },
      {
        title: "Google DeepMind Unveils Gemini 2.0 with Enhanced Multimodal Capabilities",
        content: "Google DeepMind has released Gemini 2.0, featuring significant improvements in multimodal understanding across text, images, audio, and video. The model demonstrates state-of-the-art performance on multiple benchmarks and includes new safety features to prevent misuse.",
        url: "https://example.com/news/5",
        source: "Google Blog",
        publishDate: yesterday
      },
      {
        title: "AI-Powered Drug Discovery Startup Raises $500M",
        content: "Recursion Pharmaceuticals, an AI-driven drug discovery company, has raised $500 million in funding. The company uses machine learning to analyze biological data and identify potential drug candidates, significantly accelerating the drug development process.",
        url: "https://example.com/news/6",
        source: "BioPharma Dive",
        publishDate: yesterday
      },
      {
        title: "Meta Releases Open-Source Llama 3 with 405B Parameters",
        content: "Meta has open-sourced Llama 3, its largest language model to date with 405 billion parameters. The release includes model weights, training code, and evaluation benchmarks. This move is seen as Meta's commitment to open-source AI development.",
        url: "https://example.com/news/7",
        source: "Meta AI Blog",
        publishDate: yesterday
      },
      {
        title: "China Announces New AI Regulations Focusing on Data Security",
        content: "China's Cyberspace Administration has announced new regulations for AI systems, with a strong focus on data security and privacy protection. The rules require AI companies to conduct security assessments and obtain approval before deploying certain AI applications.",
        url: "https://example.com/news/8",
        source: "South China Morning Post",
        publishDate: yesterday
      },
      {
        title: "AI Agents Show Promise in Autonomous Software Development",
        content: "A new study from researchers at UC Berkeley demonstrates that AI agents can autonomously write, test, and debug software code with minimal human intervention. The agents achieved a 73% success rate on real-world programming tasks, suggesting significant potential for automating software development.",
        url: "https://example.com/news/9",
        source: "Hacker News",
        publishDate: yesterday
      },
      {
        title: "Microsoft Integrates Advanced AI into Office 365 Suite",
        content: "Microsoft has announced the integration of advanced AI capabilities across its Office 365 suite, including intelligent document summarization, automated data analysis in Excel, and AI-powered presentation design in PowerPoint. The features are powered by GPT-4 and will be available to enterprise customers.",
        url: "https://example.com/news/10",
        source: "Microsoft News",
        publishDate: yesterday
      },
      {
        title: "Debate Intensifies Over AI Copyright and Fair Use",
        content: "The ongoing debate over AI training data and copyright has intensified as several major publishers file lawsuits against AI companies. Legal experts are divided on whether using copyrighted material for AI training constitutes fair use, with potential implications for the entire AI industry.",
        url: "https://example.com/news/11",
        source: "The New York Times",
        publishDate: yesterday
      },
      {
        title: "Breakthrough in AI Energy Efficiency: New Chip Reduces Power by 90%",
        content: "A team of engineers has developed a new neuromorphic chip that reduces AI inference power consumption by 90% compared to traditional GPUs. The chip mimics biological neural networks and could make AI more sustainable and accessible for edge devices.",
        url: "https://example.com/news/12",
        source: "IEEE Spectrum",
        publishDate: yesterday
      },
      {
        title: "AI-Generated Content Detection Tools Show Mixed Results",
        content: "A comprehensive study of AI-generated content detection tools reveals significant limitations, with accuracy rates ranging from 60% to 80%. Researchers warn that relying solely on these tools for academic integrity or content verification may not be reliable.",
        url: "https://example.com/news/13",
        source: "Nature",
        publishDate: yesterday
      },
      {
        title: "Startup Develops AI System for Real-Time Language Translation",
        content: "A Silicon Valley startup has developed an AI system capable of real-time translation across 100 languages with near-human accuracy. The system uses a novel architecture that reduces latency to under 100 milliseconds, making it suitable for live conversations.",
        url: "https://example.com/news/14",
        source: "TechCrunch",
        publishDate: yesterday
      },
      {
        title: "AI in Healthcare: FDA Approves First Fully Autonomous Diagnostic System",
        content: "The FDA has approved the first fully autonomous AI diagnostic system for detecting certain types of cancer from medical imaging. The system demonstrated 95% accuracy in clinical trials, surpassing human radiologists in some cases.",
        url: "https://example.com/news/15",
        source: "JAMA",
        publishDate: yesterday
      },
      {
        title: "Concerns Grow Over AI-Powered Surveillance in Smart Cities",
        content: "Privacy advocates are raising concerns about the increasing use of AI-powered surveillance systems in smart cities. Critics argue that the technology enables mass surveillance and poses risks to civil liberties, while proponents cite benefits for public safety and urban planning.",
        url: "https://example.com/news/16",
        source: "The Guardian",
        publishDate: yesterday
      },
      {
        title: "AI Research Community Debates Scaling Laws and Diminishing Returns",
        content: "A heated debate has emerged in the AI research community about whether current scaling laws will continue to hold. Some researchers argue that we're approaching diminishing returns, while others believe that scaling combined with algorithmic improvements will continue to yield breakthroughs.",
        url: "https://example.com/news/17",
        source: "Reddit r/MachineLearning",
        publishDate: yesterday
      },
      {
        title: "New AI Model Achieves Human-Level Performance on Complex Reasoning Tasks",
        content: "Researchers have developed an AI model that achieves human-level performance on complex reasoning tasks, including mathematical problem-solving and logical inference. The model uses a combination of neural networks and symbolic reasoning, representing a potential path toward more general AI.",
        url: "https://example.com/news/18",
        source: "Science",
        publishDate: yesterday
      },
      {
        title: "AI-Powered Climate Modeling Shows Improved Accuracy",
        content: "Scientists have integrated AI into climate models, resulting in significantly improved accuracy for weather prediction and long-term climate forecasting. The AI system can process vast amounts of atmospheric data and identify patterns that traditional models miss.",
        url: "https://example.com/news/19",
        source: "Nature Climate Change",
        publishDate: yesterday
      },
      {
        title: "Tech Giants Form Alliance for Responsible AI Development",
        content: "Major tech companies including Google, Microsoft, Amazon, and Meta have formed a new alliance focused on responsible AI development. The group will establish shared standards for AI safety, ethics, and transparency, and work with policymakers on regulation.",
        url: "https://example.com/news/20",
        source: "Reuters",
        publishDate: yesterday
      }
    ];
  }
}

// 导出单例
export const dataFetcher = new DataFetcherService();
