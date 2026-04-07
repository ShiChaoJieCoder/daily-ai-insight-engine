# Yarn 工作区设置指南

本项目使用 Yarn Workspaces 管理 monorepo 结构。

## 项目结构

```
daily-ai-insight-engine/
├── package.json          # 根 package.json (workspace 配置)
├── backend/              # 后端工作区
│   └── package.json
├── web/                  # 前端工作区
│   └── package.json
└── yarn.lock            # 统一的依赖锁文件
```

## 安装 Yarn

### 方法1：通过 Corepack（推荐，Node.js 16.10+）

```bash
# 启用 Corepack
corepack enable

# Corepack 会自动使用 package.json 中指定的 yarn 版本
```

### 方法2：通过 npm 全局安装

```bash
npm install -g yarn
```

### 方法3：通过 Homebrew（macOS）

```bash
brew install yarn
```

## 初始化项目

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/daily-ai-insight-engine.git
cd daily-ai-insight-engine
```

### 2. 安装所有依赖

```bash
# 在根目录执行，会安装所有工作区的依赖
yarn install
```

这个命令会：
- 安装根目录的依赖
- 安装 backend 工作区的依赖
- 安装 web 工作区的依赖
- 创建统一的 yarn.lock 文件
- 建立工作区之间的符号链接

## 常用命令

### 开发模式

```bash
# 同时启动前后端（推荐）
yarn dev

# 只启动后端
yarn dev:backend

# 只启动前端
yarn dev:web
```

### 构建

```bash
# 构建所有工作区
yarn build

# 只构建后端
yarn build:backend

# 只构建前端
yarn build:web
```

### 生成报告

```bash
# 生成今天的报告
yarn generate-report

# 生成指定日期的报告
yarn generate-report --date=2026-04-07
```

### 测试

```bash
# 运行所有测试
yarn test

# 只测试后端
yarn workspace backend test

# 只测试前端
yarn workspace web test
```

### 代码检查

```bash
# 运行所有 lint
yarn lint

# 只检查后端
yarn workspace backend lint

# 只检查前端
yarn workspace web lint
```

### 添加依赖

```bash
# 添加根依赖（开发工具等）
yarn add -D <package>

# 添加后端依赖
yarn workspace backend add <package>

# 添加前端依赖
yarn workspace web add <package>

# 添加所有工作区的共同依赖
yarn workspaces foreach add <package>
```

### 删除依赖

```bash
# 删除后端依赖
yarn workspace backend remove <package>

# 删除前端依赖
yarn workspace web remove <package>
```

### 清理

```bash
# 清理所有 node_modules 和构建产物
yarn clean

# 重新安装
yarn install
```

## Yarn Workspaces 优势

### 1. 统一依赖管理
- 所有工作区共享一个 `yarn.lock` 文件
- 相同的依赖只会安装一次，节省磁盘空间
- 确保所有工作区使用相同版本的共享依赖

### 2. 高效的开发体验
- 工作区之间可以相互引用
- 修改一个工作区的代码，其他工作区立即可用
- 无需发布到 npm 就能测试包之间的集成

### 3. 简化的脚本管理
- 在根目录统一管理所有脚本
- 可以并行或串行执行多个工作区的命令
- 使用 `concurrently` 同时运行多个开发服务器

## 工作区命令详解

### 在特定工作区执行命令

```bash
# 格式
yarn workspace <workspace-name> <command>

# 示例
yarn workspace backend dev
yarn workspace web build
yarn workspace backend add express
```

### 在所有工作区执行命令

```bash
# 并行执行（默认）
yarn workspaces foreach run build

# 串行执行
yarn workspaces foreach -p run build

# 包含根目录
yarn workspaces foreach -A run test
```

### 查看工作区信息

```bash
# 列出所有工作区
yarn workspaces list

# 查看工作区依赖树
yarn workspaces info
```

## 配置文件

### 根 package.json

```json
{
  "name": "daily-ai-insight-engine",
  "private": true,
  "packageManager": "yarn@4.0.0",
  "workspaces": [
    "backend",
    "web"
  ],
  "scripts": {
    "dev": "concurrently \"yarn workspace backend dev\" \"yarn workspace web dev\""
  }
}
```

### 工作区 package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts"
  }
}
```

## 常见问题

### Q: 为什么要使用 Yarn Workspaces？

A: 
- 统一管理前后端依赖
- 避免重复安装相同的包
- 简化开发流程
- 更好的 monorepo 支持

### Q: 如何升级 Yarn 版本？

A:
```bash
# 使用 Corepack
corepack prepare yarn@stable --activate

# 或者修改 package.json 中的 packageManager 字段
```

### Q: 如何处理依赖冲突？

A:
```bash
# 删除所有 node_modules
yarn clean

# 删除 yarn.lock
rm yarn.lock

# 重新安装
yarn install
```

### Q: 如何查看某个包的安装位置？

A:
```bash
yarn why <package-name>
```

### Q: 如何升级所有依赖？

A:
```bash
# 交互式升级
yarn upgrade-interactive

# 升级所有到最新版本
yarn upgrade
```

## 性能优化

### 1. 使用 Yarn 缓存

```bash
# 查看缓存目录
yarn cache dir

# 清理缓存
yarn cache clean
```

### 2. 启用 PnP（Plug'n'Play）模式（可选）

在 `.yarnrc.yml` 中配置：

```yaml
nodeLinker: pnp
```

### 3. 并行安装

Yarn 默认并行安装依赖，无需额外配置。

## 最佳实践

1. **始终在根目录执行 `yarn install`**
   - 确保所有工作区的依赖都被正确安装

2. **使用工作区命令**
   - `yarn workspace <name> <command>` 而不是 `cd` 到目录

3. **共享依赖放在根目录**
   - 开发工具（如 TypeScript、ESLint）可以放在根目录

4. **保持 yarn.lock 在版本控制中**
   - 确保团队成员使用相同的依赖版本

5. **定期更新依赖**
   - 使用 `yarn upgrade-interactive` 定期检查更新

## 参考资料

- [Yarn Workspaces 官方文档](https://yarnpkg.com/features/workspaces)
- [Yarn CLI 命令](https://yarnpkg.com/cli)
- [Monorepo 最佳实践](https://monorepo.tools/)

---

**最后更新**：2026-04-07
