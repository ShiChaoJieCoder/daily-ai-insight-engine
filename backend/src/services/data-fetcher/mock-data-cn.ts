/**
 * 中文Mock数据 - AI热点资讯
 * 用于演示中文内容展示
 */

import type { RawNewsItem } from '../../types/index.js';

export function getChineseMockData(): RawNewsItem[] {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return [
    {
      title: "OpenAI宣布GPT-5开发进展顺利",
      content: "OpenAI CEO Sam Altman在内部会议中透露，GPT-5的训练即将完成。新模型预计将在推理能力、多模态理解和效率方面带来显著改进。业内专家认为，这可能引发科技巨头之间新一轮的AI竞赛。",
      url: "https://example.com/news/1",
      source: "TechCrunch",
      publishDate: yesterday,
      author: "张明"
    },
    {
      title: "欧盟人工智能法案正式生效",
      content: "欧盟的《人工智能法案》正式生效，标志着全球AI监管的里程碑。该立法为AI系统建立了基于风险的框架，对高风险应用提出严格要求。预计这将对在欧洲运营的AI公司产生深远影响。",
      url: "https://example.com/news/2",
      source: "The Verge",
      publishDate: yesterday
    },
    {
      title: "Anthropic完成20亿美元C轮融资",
      content: "AI安全公司Anthropic获得20亿美元C轮融资，由谷歌和Salesforce Ventures领投。公司计划利用这笔资金扩大其Claude AI助手的规模，并推进AI对齐和安全性研究。这使Anthropic的总融资额超过70亿美元。",
      url: "https://example.com/news/3",
      source: "VentureBeat",
      publishDate: yesterday
    },
    {
      title: "最新研究：Transformer模型突破100万亿参数",
      content: "斯坦福大学和麻省理工学院的研究人员发表论文，展示了一种新的训练技术，使transformer模型能够扩展到100万亿参数。这一突破可能催生更强大的AI系统，但也引发了对计算成本和环境影响的担忧。",
      url: "https://example.com/news/4",
      source: "arXiv",
      publishDate: yesterday,
      author: "陈博士等"
    },
    {
      title: "谷歌DeepMind发布Gemini 2.0，增强多模态能力",
      content: "谷歌DeepMind发布了Gemini 2.0，在文本、图像、音频和视频的多模态理解方面有显著改进。该模型在多个基准测试中展现了最先进的性能，并包含新的安全功能以防止滥用。",
      url: "https://example.com/news/5",
      source: "Google博客",
      publishDate: yesterday
    },
    {
      title: "AI驱动的药物发现初创公司融资5亿美元",
      content: "Recursion Pharmaceuticals，一家AI驱动的药物发现公司，已筹集5亿美元资金。该公司使用机器学习分析生物数据并识别潜在的药物候选物，显著加速了药物开发过程。",
      url: "https://example.com/news/6",
      source: "BioPharma Dive",
      publishDate: yesterday
    },
    {
      title: "Meta发布开源Llama 3，参数量达4050亿",
      content: "Meta开源了其迄今为止最大的语言模型Llama 3，拥有4050亿参数。此次发布包括模型权重、训练代码和评估基准。这一举措被视为Meta对开源AI开发的承诺。",
      url: "https://example.com/news/7",
      source: "Meta AI博客",
      publishDate: yesterday
    },
    {
      title: "中国发布新AI法规，聚焦数据安全",
      content: "中国国家网信办发布了针对AI系统的新规定，重点关注数据安全和隐私保护。规定要求AI公司在部署某些AI应用前进行安全评估并获得批准。",
      url: "https://example.com/news/8",
      source: "南华早报",
      publishDate: yesterday
    },
    {
      title: "AI代理在自主软件开发中展现潜力",
      content: "加州大学伯克利分校研究人员的一项新研究表明，AI代理可以在最少人工干预的情况下自主编写、测试和调试软件代码。这些代理在真实世界编程任务中达到了73%的成功率，显示出自动化软件开发的巨大潜力。",
      url: "https://example.com/news/9",
      source: "Hacker News",
      publishDate: yesterday
    },
    {
      title: "微软将先进AI集成到Office 365套件",
      content: "微软宣布在其Office 365套件中集成先进的AI功能，包括智能文档摘要、Excel中的自动数据分析以及PowerPoint中的AI驱动演示设计。这些功能由GPT-4驱动，将向企业客户提供。",
      url: "https://example.com/news/10",
      source: "微软新闻",
      publishDate: yesterday
    },
    {
      title: "AI版权和合理使用争议加剧",
      content: "随着多家主要出版商对AI公司提起诉讼，关于AI训练数据和版权的争议愈演愈烈。法律专家对使用受版权保护的材料进行AI训练是否构成合理使用存在分歧，这可能对整个AI行业产生影响。",
      url: "https://example.com/news/11",
      source: "纽约时报",
      publishDate: yesterday
    },
    {
      title: "AI能效突破：新芯片功耗降低90%",
      content: "一组工程师开发了一种新型神经形态芯片，与传统GPU相比，AI推理功耗降低了90%。该芯片模仿生物神经网络，可以使AI更加可持续，并更适合边缘设备。",
      url: "https://example.com/news/12",
      source: "IEEE Spectrum",
      publishDate: yesterday
    },
    {
      title: "AI生成内容检测工具效果参差不齐",
      content: "一项关于AI生成内容检测工具的综合研究显示出明显的局限性，准确率在60%到80%之间。研究人员警告说，仅依赖这些工具进行学术诚信或内容验证可能不可靠。",
      url: "https://example.com/news/13",
      source: "Nature",
      publishDate: yesterday
    },
    {
      title: "初创公司开发实时语言翻译AI系统",
      content: "一家硅谷初创公司开发了一个能够实时翻译100种语言的AI系统，准确度接近人类水平。该系统使用新颖的架构，将延迟降低到100毫秒以下，适合实时对话。",
      url: "https://example.com/news/14",
      source: "TechCrunch",
      publishDate: yesterday
    },
    {
      title: "AI医疗应用：FDA批准首个全自主诊断系统",
      content: "FDA批准了首个用于从医学影像检测某些类型癌症的全自主AI诊断系统。该系统在临床试验中展现了95%的准确率，在某些情况下超过了人类放射科医生。",
      url: "https://example.com/news/15",
      source: "JAMA",
      publishDate: yesterday
    },
    {
      title: "智慧城市AI监控引发隐私担忧",
      content: "隐私倡导者对智慧城市中越来越多地使用AI监控系统表示担忧。批评者认为该技术助长了大规模监控，对公民自由构成风险，而支持者则强调其对公共安全和城市规划的益处。",
      url: "https://example.com/news/16",
      source: "卫报",
      publishDate: yesterday
    },
    {
      title: "AI研究社区就扩展定律和收益递减展开辩论",
      content: "AI研究社区就当前的扩展定律是否会继续有效展开了激烈辩论。一些研究人员认为我们正在接近收益递减点，而另一些人则相信扩展与算法改进相结合将继续产生突破。",
      url: "https://example.com/news/17",
      source: "Reddit r/MachineLearning",
      publishDate: yesterday
    },
    {
      title: "新AI模型在复杂推理任务上达到人类水平",
      content: "研究人员开发了一个在复杂推理任务上达到人类水平的AI模型，包括数学问题解决和逻辑推理。该模型结合了神经网络和符号推理，代表了通向更通用AI的潜在路径。",
      url: "https://example.com/news/18",
      source: "Science",
      publishDate: yesterday
    },
    {
      title: "AI驱动的气候建模显示更高准确性",
      content: "科学家将AI集成到气候模型中，显著提高了天气预测和长期气候预报的准确性。AI系统可以处理大量大气数据，并识别传统模型遗漏的模式。",
      url: "https://example.com/news/19",
      source: "Nature Climate Change",
      publishDate: yesterday
    },
    {
      title: "科技巨头成立负责任AI发展联盟",
      content: "包括谷歌、微软、亚马逊和Meta在内的主要科技公司成立了一个专注于负责任AI发展的新联盟。该组织将建立AI安全、伦理和透明度的共享标准，并与政策制定者合作制定监管政策。",
      url: "https://example.com/news/20",
      source: "路透社",
      publishDate: yesterday
    }
  ];
}
