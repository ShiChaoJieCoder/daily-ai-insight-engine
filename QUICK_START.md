# 快速开始指南

> 5分钟快速上手 AI舆情分析日报系统

## 前置要求

- ✅ Node.js 20.x 或更高版本
- ✅ Yarn 4.x（推荐使用 Corepack）
- ✅ OpenAI API Key

## 第一步：克隆项目

```bash
git clone <your-repo-url>
cd daily-ai-insight-engine
```

## 第二步：安装依赖

```bash
# 启用 Corepack（如果还没启用）
corepack enable

# 安装所有依赖
yarn install
```

## 第三步：配置环境变量

```bash
# 复制环境变量模板
cp backend/config/.env.example backend/config/.env

# 编辑 .env 文件，填入你的 OpenAI API Key
# 使用你喜欢的编辑器，例如：
nano backend/config/.env
# 或
code backend/config/.env
```

在 `.env` 文件中设置：

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## 第四步：生成第一份报告

```bash
# 生成今天的报告（使用mock数据演示）
yarn generate-report
```

等待几分钟，报告会生成在 `backend/data/reports/` 目录下。

## 第五步：启动应用

```bash
# 同时启动前后端
yarn dev
```

然后访问：
- 前端：http://localhost:5173
- 后端API：http://localhost:3000

## 常见问题

### Q: 提示 "OPENAI_API_KEY is required"

A: 请确保在 `backend/config/.env` 文件中正确设置了 API Key。

### Q: 端口被占用

A: 修改 `backend/config/.env` 中的 `PORT` 配置。

### Q: 依赖安装失败

A: 尝试清理缓存后重新安装：

```bash
yarn cache clean
rm -rf node_modules
yarn install
```

### Q: 想使用真实数据源而不是mock数据

A: 需要实现 `backend/src/services/data-fetcher/index.ts` 中的真实API调用。参考文档：
- [Hacker News API](https://github.com/HackerNews/API)
- [Reddit API](https://www.reddit.com/dev/api/)

## 下一步

- 📖 阅读[完整文档](./README.md)
- 🎨 查看[设计文档](./docs/design/)
- 🤖 了解[AI使用说明](./docs/ai-usage/)
- 🏗️ 学习[系统架构](./docs/architecture/)

## 项目结构速览

```
daily-ai-insight-engine/
├── backend/              # 后端服务（数据获取、AI处理、报告生成）
├── web/                  # 前端应用（报告展示）
├── docs/                 # 完整文档
└── package.json          # Yarn Workspaces 配置
```

## 有用的命令

```bash
# 只启动后端
yarn dev:backend

# 只启动前端
yarn dev:web

# 构建生产版本
yarn build

# 运行测试
yarn test

# 查看所有可用命令
yarn run
```

## 获取帮助

- 查看 [README.md](./README.md) 获取详细说明
- 查看 [docs/](./docs/) 目录获取完整文档
- 提交 Issue 到 GitHub 仓库

---

**祝你使用愉快！** 🎉
