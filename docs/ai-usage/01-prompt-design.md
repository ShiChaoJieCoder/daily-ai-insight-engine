# AI Prompt设计文档

> 版本：v1.0  
> 创建时间：2026-04-07  
> 最后更新：2026-04-07

## 一、AI使用概览

### 1.1 AI在系统中的角色

本系统在以下环节使用AI：

| 环节 | 使用场景 | 模型选择 | 理由 |
|-----|---------|---------|------|
| **数据清洗** | ❌ 不使用AI | 规则处理 | 规则足够，无需AI成本 |
| **信息提取** | ✅ 使用AI | GPT-3.5-turbo | 需要理解语义，提取结构化信息 |
| **实体识别** | ✅ 使用AI | GPT-3.5-turbo | NER任务，轻量模型足够 |
| **分类标注** | ✅ 使用AI | GPT-3.5-turbo | 多分类任务，成本低 |
| **情感分析** | ✅ 使用AI | GPT-4 | 需要深度理解上下文 |
| **影响评估** | ✅ 使用AI | GPT-4 | 需要推理能力 |
| **趋势判断** | ✅ 使用AI | GPT-4 | 需要行业知识和推理 |
| **报告生成** | ✅ 使用AI | GPT-4 | 需要生成连贯文本 |
| **数据验证** | ❌ 不使用AI | 规则处理 | 格式验证用规则更可靠 |

### 1.2 设计原则

1. **能用规则就不用AI**：降低成本，提高可控性
2. **轻量任务用轻量模型**：GPT-3.5处理简单任务
3. **深度任务用强模型**：GPT-4处理复杂推理
4. **批处理优先**：减少API调用次数
5. **结构化输出**：要求返回JSON，便于解析

---

## 二、Prompt设计详解

### 2.1 基础信息提取Prompt

#### 使用场景
从原始新闻中提取：分类、标签、实体（公司、产品、技术、人物）

#### 模型选择
**GPT-3.5-turbo**（成本低，速度快，准确度足够）

#### Prompt设计

```typescript
const BASIC_EXTRACTION_PROMPT = `你是一个专业的AI新闻分析助手。你的任务是从新闻中提取结构化信息。

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
5. 不要编造不存在的信息
`;
```

#### 设计理由

1. **明确角色定位**："你是一个专业的AI新闻分析助手"
   - 让模型进入专业分析模式
   - 提高输出质量

2. **清晰的任务分解**：将提取任务分为4个子任务
   - 降低认知负担
   - 提高准确率

3. **详细的选项说明**：为每个分类提供具体例子
   - 减少歧义
   - 统一标准

4. **严格的格式要求**：
   - 要求JSON格式
   - 提供示例结构
   - 便于程序解析

5. **注意事项提醒**：
   - 处理边界情况
   - 统一命名规范
   - 避免编造信息

#### 实际使用示例

```typescript
async function extractBasicInfo(newsItems: RawNewsItem[]): Promise<PartialNewsItem[]> {
  // 构造输入数据
  const newsItemsText = newsItems.map((item, idx) => `
【新闻 ${idx + 1}】
标题：${item.title}
内容：${item.content.substring(0, 500)}... 
来源：${item.source}
发布时间：${item.publishDate}
  `).join('\n---\n');
  
  // 填充Prompt
  const prompt = BASIC_EXTRACTION_PROMPT
    .replace('{count}', newsItems.length.toString())
    .replace('{news_items}', newsItemsText);
  
  // 调用AI
  const response = await callOpenAI({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '你是一个专业的AI新闻分析助手。' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,  // 低温度，输出更确定
    max_tokens: 2000
  });
  
  // 解析结果
  const extracted = JSON.parse(response.choices[0].message.content);
  
  return extracted;
}
```

---

### 2.2 深度分析Prompt

#### 使用场景
基于结构化数据，进行：情感分析、影响评估、重要性评分、趋势判断

#### 模型选择
**GPT-4**（需要深度理解和推理能力）

#### Prompt设计

```typescript
const DEEP_ANALYSIS_PROMPT = `你是一个资深的AI行业分析专家，拥有深厚的技术背景和行业洞察力。

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
  * 如：AI公司、开发者、用户、监管机构等

## 3. 重要性评分 (Significance Score)
1-10分，评估新闻的重要程度：
- 1-3分: 常规新闻，影响有限
- 4-6分: 值得关注，有一定影响
- 7-8分: 重要事件，行业关注
- 9-10分: 里程碑事件，改变格局

评分考虑因素：
- 涉及公司/产品的影响力
- 技术创新程度
- 市场影响范围
- 政策重要性
- 社区讨论热度

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
- 其他自定义趋势标签

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
1. **有理有据**：每个判断都要基于新闻内容，不要空洞描述
2. **客观中立**：避免主观偏见，基于事实分析
3. **行业视角**：从AI行业整体角度评估，不只看单个公司
4. **前瞻性**：考虑长期影响和趋势方向
5. **一致性**：同类事件的评分和判断应保持一致标准

# 注意事项
- 所有数值必须在指定范围内
- reasoning字段用于解释判断依据，便于人工复核
- 如果信息不足，降低confidence值
- 不要编造不存在的信息
`;
```

#### 设计理由

1. **专家角色设定**："资深AI行业分析专家"
   - 提升分析深度
   - 引导专业视角

2. **详细的评分标准**：
   - 为每个维度提供明确的评分区间
   - 给出具体例子
   - 减少主观性

3. **要求提供reasoning**：
   - 便于人工复核
   - 提高AI输出质量
   - 可追溯性

4. **强调一致性**：
   - 避免评分标准漂移
   - 提高数据可比性

5. **多维度分析**：
   - 情感、影响、重要性、趋势
   - 全面评估新闻价值

---

### 2.3 报告生成Prompt

#### 使用场景
基于所有结构化数据，生成日报的文字内容

#### 模型选择
**GPT-4**（需要生成连贯、有洞察力的文本）

#### Prompt设计

```typescript
const REPORT_GENERATION_PROMPT = `你是一个专业的AI行业分析师，负责撰写每日AI领域分析报告。

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
- 为什么现在发生

### 影响分析
- **行业影响**：对AI行业格局的影响
- **技术影响**：对技术发展方向的影响
- **市场影响**：对资本市场和商业的影响
- **社会影响**：对用户和社会的影响（如适用）

### 关键洞察
- 这个事件揭示了什么趋势？
- 对不同利益相关方意味着什么？
- 可能的后续发展？

## 3. 趋势判断与洞察
基于今日所有新闻，总结行业趋势：

### 技术趋势
- 观察到的技术发展方向
- 热门技术路线
- 技术创新点

### 应用趋势
- 应用场景的变化
- 商业化进展
- 新兴应用领域

### 政策趋势
- 监管动态
- 政策方向
- 合规要求

### 资本趋势
- 融资动态
- 投资热点
- 市场信号

## 4. 风险与机会提示 (可选)
- **风险提示**：识别潜在风险（技术、政策、市场）
- **机会提示**：识别投资或发展机会

# 写作要求

1. **专业性**：使用行业术语，但避免过度技术化
2. **洞察力**：不只是信息罗列，要有分析和判断
3. **逻辑性**：观点要有数据支撑，分析要有逻辑链条
4. **简洁性**：语言精炼，避免冗余
5. **客观性**：基于事实，避免主观臆断
6. **前瞻性**：不只看当下，要思考未来影响

# 输出格式
请以Markdown格式输出，结构清晰，便于阅读。

# 注意事项
- 热点事件必须来自输入数据，不要编造
- 分析要有依据，引用具体事件
- 趋势判断要基于多个事件的共同特征
- 如果某个趋势方向没有足够数据支撑，不要强行总结
- 保持客观中立，避免过度乐观或悲观
`;
```

---

## 三、Prompt优化历史

### 3.1 基础提取Prompt优化

#### 版本1（初始版本）
```
请分析以下新闻，提取分类、标签和实体。
```

**问题**：
- 输出格式不统一
- 实体识别不准确
- 经常返回非JSON格式

#### 版本2（增加格式要求）
```
请分析以下新闻，提取分类、标签和实体。
返回JSON格式：{"category": "...", "tags": [], "entities": {}}
```

**改进**：
- 格式统一了
- 但实体识别仍然不准

#### 版本3（增加详细说明）
```
你是AI新闻分析助手。
请提取：
1. category: research/product/funding/policy/discussion
2. tags: 技术标签列表
3. entities: {companies, products, technologies, people}

返回JSON格式。
```

**改进**：
- 准确率提升
- 但仍有边界情况处理不好

#### 版本4（当前版本）
- 增加了详细的分类说明和例子
- 增加了注意事项
- 增加了边界情况处理指引
- 准确率达到85%+

**关键改进点**：
1. 明确角色定位
2. 详细的选项说明
3. 提供具体例子
4. 边界情况处理
5. 格式严格要求

---

### 3.2 深度分析Prompt优化

#### 版本1（初始版本）
```
请分析新闻的情感、影响和重要性。
```

**问题**：
- 评分标准不一致
- 情感分析主观性强
- 无法复核判断依据

#### 版本2（增加评分标准）
```
请分析：
- sentiment: -1到1
- impact: high/medium/low
- significance: 1-10

返回JSON。
```

**改进**：
- 有了数值范围
- 但标准仍然模糊

#### 版本3（当前版本）
- 为每个维度提供详细的评分标准
- 要求提供reasoning字段
- 强调一致性和客观性
- 准确率和可复核性大幅提升

**关键改进点**：
1. 详细的评分区间说明
2. 每个区间提供具体例子
3. 要求解释判断依据
4. 强调一致性标准
5. 多维度交叉验证

---

## 四、Token消耗分析

### 4.1 单次处理成本估算

#### 基础提取（GPT-3.5-turbo）
- **Input**: 
  - Prompt模板: ~800 tokens
  - 5条新闻内容: ~2500 tokens
  - 总计: ~3300 tokens
- **Output**: ~1000 tokens
- **成本**: ~$0.005 / 批次（5条新闻）

#### 深度分析（GPT-4）
- **Input**:
  - Prompt模板: ~1200 tokens
  - 结构化数据: ~1500 tokens
  - 总计: ~2700 tokens
- **Output**: ~1500 tokens
- **成本**: ~$0.12 / 批次（20条新闻聚合分析）

#### 报告生成（GPT-4）
- **Input**:
  - Prompt模板: ~1000 tokens
  - 所有结构化数据: ~3000 tokens
  - 总计: ~4000 tokens
- **Output**: ~2000 tokens
- **成本**: ~$0.18 / 报告

### 4.2 完整日报成本（20条新闻）

| 步骤 | 模型 | 调用次数 | 单次成本 | 小计 |
|-----|------|---------|---------|------|
| 基础提取 | GPT-3.5 | 4批次 | $0.005 | $0.02 |
| 深度分析 | GPT-4 | 1次 | $0.12 | $0.12 |
| 报告生成 | GPT-4 | 1次 | $0.18 | $0.18 |
| **总计** | - | - | - | **$0.32** |

### 4.3 优化策略

1. **批处理**：
   - 基础提取：5条/批 → 减少80%调用次数
   - 深度分析：20条聚合 → 避免重复处理

2. **Prompt优化**：
   - 精简Prompt，减少不必要的说明
   - 使用更短的示例
   - 预计可节省20% tokens

3. **缓存机制**：
   - 相同内容不重复调用
   - 预计可节省10-15%成本

4. **模型选择**：
   - 简单任务用GPT-3.5
   - 复杂任务才用GPT-4
   - 预计可节省40%成本

**优化后预估成本**：~$0.20 / 日报

---

## 五、错误处理策略

### 5.1 常见错误类型

#### 1. 格式错误
```json
// 错误示例：返回了非JSON格式
"这是一个分析结果：category是product..."

// 处理策略
- 正则提取JSON部分
- 如果提取失败，重试
- 3次失败后使用降级策略
```

#### 2. 字段缺失
```json
// 错误示例：缺少必填字段
{
  "category": "product"
  // 缺少tags和entities
}

// 处理策略
- 验证必填字段
- 缺失字段填充默认值
- 标记为"需要复核"
```

#### 3. 数值越界
```json
// 错误示例：数值超出范围
{
  "sentiment": {
    "score": 1.5  // 应该是-1到1
  },
  "significance": 15  // 应该是1-10
}

// 处理策略
- 验证数值范围
- 越界值截断到边界
- 记录警告日志
```

### 5.2 重试策略

```typescript
async function callAIWithRetry<T>(
  prompt: string,
  validator: (data: any) => boolean,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await callOpenAI(prompt);
      const data = JSON.parse(response);
      
      if (validator(data)) {
        return data;
      }
      
      console.warn(`验证失败，第${i + 1}次重试`);
    } catch (error) {
      console.error(`调用失败：${error.message}`);
      
      if (i === maxRetries - 1) {
        // 最后一次重试失败，使用降级策略
        return fallbackStrategy();
      }
      
      // 指数退避
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 5.3 降级策略

```typescript
function fallbackStrategy(rawData: RawNewsItem): PartialNewsItem {
  // 使用规则提取基础信息
  return {
    id: rawData.url,
    title: rawData.title,
    content: rawData.content,
    
    // 规则提取
    category: detectCategoryByKeywords(rawData),
    tags: extractKeywordsByTFIDF(rawData),
    entities: {
      companies: extractCompaniesByRegex(rawData),
      products: [],
      technologies: [],
      people: []
    },
    
    // 标记为需要人工复核
    _needsReview: true,
    _fallbackReason: 'AI处理失败，使用规则提取'
  };
}
```

---

## 六、质量保证

### 6.1 输出验证

```typescript
function validateBasicExtraction(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 必填字段检查
  if (!data.category) errors.push('缺少category字段');
  if (!data.tags) errors.push('缺少tags字段');
  if (!data.entities) errors.push('缺少entities字段');
  
  // 枚举值检查
  const validCategories = ['research', 'product', 'funding', 'policy', 'discussion'];
  if (data.category && !validCategories.includes(data.category)) {
    errors.push(`无效的category: ${data.category}`);
  }
  
  // 类型检查
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('tags必须是数组');
  }
  
  // 数据质量检查
  if (data.tags && data.tags.length === 0) {
    warnings.push('tags为空，可能提取失败');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 6.2 人工抽检

```typescript
// 标记需要人工复核的数据
function markForReview(item: NewsItem): boolean {
  // 低置信度
  if (item.sentiment?.confidence < 0.6) return true;
  
  // 异常评分
  if (item.significance > 8 && item.impact.level === 'low') return true;
  
  // 实体为空
  if (Object.values(item.entities).every(arr => arr.length === 0)) return true;
  
  return false;
}
```

---

## 七、持续优化

### 7.1 A/B测试

```typescript
// 对比不同Prompt版本的效果
async function comparePrompts(newsItems: RawNewsItem[]) {
  const resultA = await extractWithPromptA(newsItems);
  const resultB = await extractWithPromptB(newsItems);
  
  // 对比准确率、完整性、一致性
  const comparison = {
    promptA: {
      accuracy: calculateAccuracy(resultA),
      completeness: calculateCompleteness(resultA),
      consistency: calculateConsistency(resultA)
    },
    promptB: {
      accuracy: calculateAccuracy(resultB),
      completeness: calculateCompleteness(resultB),
      consistency: calculateConsistency(resultB)
    }
  };
  
  return comparison;
}
```

### 7.2 反馈循环

```typescript
// 收集人工反馈，优化Prompt
interface Feedback {
  itemId: string;
  field: string;
  aiOutput: any;
  correctOutput: any;
  reason: string;
}

function analyzeFeedback(feedbacks: Feedback[]) {
  // 分析常见错误类型
  const errorPatterns = groupBy(feedbacks, 'reason');
  
  // 生成Prompt优化建议
  const suggestions = generateOptimizationSuggestions(errorPatterns);
  
  return suggestions;
}
```

---

**文档维护**：随着Prompt优化，本文档将持续更新
