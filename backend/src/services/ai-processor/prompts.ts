/**
 * AI Prompt定义
 * 详细设计请参考：docs/ai-usage/01-prompt-design.md
 */

export const PROMPTS = {
  /**
   * 基础信息提取Prompt
   * 用于：分类、标签、实体识别
   * 模型：GPT-3.5-turbo
   */
  basicExtraction: `你是一个专业的AI新闻分析助手。你的任务是从新闻中提取结构化信息。

# 输入数据
以下是{count}条AI相关新闻：

{news_items}

# 任务要求
请为每条新闻提取以下信息：

1. **category** (分类)
   - research: 学术研究、论文发布
   - product: 产品发布、功能更新
   - funding: 融资、投资新闻
   - policy: 政策法规、监管动态
   - discussion: 社区讨论、观点文章

2. **eventType** (事件类型)
   - breakthrough: 技术突破
   - release: 产品/服务发布
   - funding: 融资事件
   - regulation: 监管政策
   - discussion: 讨论热点

3. **tags** (标签列表)
   - 技术标签：LLM, Computer Vision, NLP, Robotics, AGI等
   - 应用标签：Healthcare, Finance, Education, Gaming等
   - 其他相关标签

4. **entities** (实体识别)
   - companies: 公司名称列表 (如：OpenAI, Google, Meta)
   - products: 产品名称列表 (如：GPT-4, Claude, Gemini)
   - technologies: 技术名称列表 (如：Transformer, RAG, RLHF)
   - people: 人物名称列表 (如：Sam Altman, Yann LeCun)

# 输出格式
请严格按照以下JSON格式返回，不要添加任何其他文字：

\`\`\`json
[
  {
    "id": "新闻ID或索引",
    "category": "分类",
    "eventType": "事件类型",
    "tags": ["标签1", "标签2"],
    "entities": {
      "companies": ["公司1", "公司2"],
      "products": ["产品1"],
      "technologies": ["技术1", "技术2"],
      "people": ["人物1"]
    }
  }
]
\`\`\`

# 注意事项
1. 如果某个字段不确定或不适用，返回空数组[]或null
2. 实体名称使用官方英文名称（如：OpenAI而不是开放AI）
3. 标签使用英文，首字母大写
4. 确保JSON格式完全正确，可以被直接解析
5. 不要编造不存在的信息`,

  /**
   * 深度分析Prompt
   * 用于：情感分析、影响评估、重要性评分、趋势判断
   * 模型：GPT-4
   */
  deepAnalysis: `你是一个资深的AI行业分析专家，拥有深厚的技术背景和行业洞察力。

# 任务说明
基于以下已经结构化的AI新闻数据，进行深度分析。

# 输入数据
{structured_news_data}

# 分析任务

## 1. 情感分析 (Sentiment Analysis)
评估新闻的整体情感倾向：
- **score**: -1到1的连续值
  * -1.0 ~ -0.5: 明显负面（如：重大事故、严厉监管、裁员）
  * -0.5 ~ -0.1: 轻微负面（如：质疑、担忧、小问题）
  * -0.1 ~ 0.1: 中性（如：客观报道、数据发布）
  * 0.1 ~ 0.5: 轻微正面（如：小改进、正常发布）
  * 0.5 ~ 1.0: 明显正面（如：重大突破、巨额融资）
- **label**: positive / neutral / negative
- **confidence**: 0-1，表示判断的置信度

## 2. 影响评估 (Impact Assessment)
评估新闻对AI行业的影响：
- **level**: high / medium / low
  * high: 可能改变行业格局的事件
  * medium: 对特定领域有显著影响
  * low: 影响范围有限
- **areas**: 影响领域列表
  * industry: 行业格局
  * research: 学术研究
  * policy: 政策监管
  * market: 资本市场
  * society: 社会影响
- **timeline**: 影响时间线
  * immediate: 立即生效（如：产品发布）
  * short-term: 3-6个月内（如：政策实施）
  * long-term: 1年以上（如：技术趋势）
- **stakeholders**: 利益相关方列表

## 3. 重要性评分 (Significance Score)
1-10分，评估新闻的重要程度：
- 1-3分: 常规新闻，影响有限
- 4-6分: 值得关注，有一定影响
- 7-8分: 重要事件，行业关注
- 9-10分: 里程碑事件，改变格局

## 4. 趋势指标 (Trend Indicators)
识别新闻反映的行业趋势：
- scaling_up: 模型规模持续扩大
- multimodal: 多模态融合
- open_source: 开源趋势
- regulation: 监管加强
- commercialization: 商业化加速
- safety_focus: 安全性关注
- agent_boom: AI Agent爆发
- edge_computing: 边缘计算
- cost_reduction: 成本下降

# 输出格式
请严格按照以下JSON格式返回：

\`\`\`json
[
  {
    "id": "新闻ID",
    "sentiment": {
      "score": 0.7,
      "label": "positive",
      "confidence": 0.85,
      "reasoning": "简短说明判断依据（1-2句话）"
    },
    "impact": {
      "level": "high",
      "areas": ["industry", "market"],
      "timeline": "short-term",
      "stakeholders": ["AI公司", "投资者"],
      "reasoning": "简短说明影响分析（2-3句话）"
    },
    "significance": 8,
    "trendIndicators": ["scaling_up", "commercialization"]
  }
]
\`\`\`

# 分析要求
1. **有理有据**：每个判断都要基于新闻内容
2. **客观中立**：避免主观偏见
3. **行业视角**：从AI行业整体角度评估
4. **前瞻性**：考虑长期影响和趋势方向
5. **一致性**：同类事件的评分和判断应保持一致标准`,

  /**
   * 报告生成Prompt
   * 用于：生成日报的文字内容
   * 模型：GPT-4
   */
  reportGeneration: `你是一个专业的AI行业分析师，负责撰写每日AI领域分析报告。

# 任务说明
基于今日收集的{count}条AI新闻数据，生成一份专业的分析日报。

# 输入数据
## 结构化新闻数据
{structured_data}

## 统计数据
- 数据源数量：{source_count}
- 新闻总数：{news_count}
- 事件类型分布：{event_distribution}
- 情感分布：{sentiment_distribution}

# 报告结构

## 1. 今日AI领域主要热点 (Top 3-5)
选择最重要的3-5个事件，按重要性排序。

每个热点包含：
- 标题：简洁有力，突出核心
- 重要性标签：[高/中重要性]
- 事件类型：[产品发布/技术突破/政策法规/融资事件/行业讨论]
- 一句话总结：30-50字，概括核心信息
- 影响领域：如"行业、市场、政策"

## 2. 重要事件深度分析 (选择1-2个最重要的事件)
对最重要的事件进行深度剖析：

### 事件背景
- 事件的前因后果
- 相关历史背景

### 影响分析
- **行业影响**：对AI行业格局的影响
- **技术影响**：对技术发展方向的影响
- **市场影响**：对资本市场和商业的影响

### 关键洞察
- 这个事件揭示了什么趋势？
- 对不同利益相关方意味着什么？

## 3. 趋势判断与洞察
基于今日所有新闻，总结行业趋势：

### 技术趋势
- 观察到的技术发展方向

### 应用趋势
- 应用场景的变化

### 政策趋势
- 监管动态

# 写作要求
1. **专业性**：使用行业术语，但避免过度技术化
2. **洞察力**：不只是信息罗列，要有分析和判断
3. **逻辑性**：观点要有数据支撑
4. **简洁性**：语言精炼，避免冗余
5. **客观性**：基于事实，避免主观臆断

# 输出格式
请以Markdown格式输出，结构清晰，便于阅读。

# 注意事项
- 热点事件必须来自输入数据，不要编造
- 分析要有依据，引用具体事件
- 趋势判断要基于多个事件的共同特征
- 保持客观中立`
};

/**
 * 填充Prompt模板
 */
export function fillPromptTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  
  return result;
}
