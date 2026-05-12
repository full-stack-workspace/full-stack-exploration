# full-stack-exploration

> **AI Coding 驱动的全栈架构探索** — 借助 AI 编程助手系统性地探索 Vite、React、Vue、Next.js 的架构设计，验证 AI 代码生成在真实前端工程中的边界与最佳实践。
> **AI Coding-driven full-stack architecture exploration** — systematically exploring Vite, React, Vue, and Next.js architecture design with AI assistants, validating the boundaries and best practices of AI-powered code generation in real frontend engineering.

## 核心理念 · Philosophy

本项目不是传统的手写 demo 集合，而是一次 **AI Coding 工程实验**。每个 package 代表一个独立的探索方向，代码由 AI 辅助生成，重点关注：

- **架构设计**：AI 如何理解并组织项目结构、路由、状态管理、样式系统
- **代码生成质量**：AI 生成代码的一致性、可维护性、是否符合工程最佳实践
- **工具链集成**：AI 对 Vite 插件、Next.js App Router、Design Tokens 等现代工具链的掌握程度
- **渐进式探索**：从简单的 Vite 基础配置到复杂的 Next.js 全栈应用，验证 AI 在不同复杂度层级的表现

## Packages

| Package | 探索方向 · Focus | Port |
|---------|-------------|------|
| `vite-basic` | Vite 基础能力：插件机制、HMR、SCSS 集成 — 验证 AI 对构建工具底层配置的理解 | 5173 |
| `vite-server` | Vite Dev Server 架构：proxy、CORS、中间件 — 探索 AI 对开发服务器配置的驾驭 | 5174 |
| `vite-build` | 构建优化与设计系统：code splitting、bundle analysis、三层 Design Tokens 架构 — 考验 AI 对复杂样式工程和性能优化的处理 | 5175 |
| `next-demo` | Next.js 16 全栈实践：App Router、Server Components、ISR、暗色模式 — 验证 AI 在现代全栈框架中的代码生成上限 | 3000 |

### AI Coding 亮点 · Key Highlights

- **vite-build** 中的 [Design Tokens](packages/vite-build/src/styles/tokens.css) 系统完全由 AI 设计实现，采用 Primitive → Semantic → Component 三层架构，支持 `data-theme` 亮暗切换。
- **next-demo** 展示了 AI 对 Next.js App Router 范式的理解：Server Components 优先、metadata/Open Graph API、文件系统路由、`prefers-color-scheme` 暗色模式。
- 所有 package 的 ESLint、TypeScript、Tailwind CSS、路径别名等工程化配置均由 AI 生成并保持一致。

## 快速开始 · Getting Started

### 环境要求 · Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安装 · Installation

```bash
pnpm install
```

### 开发 · Development

```bash
# Vite 生态探索
pnpm dev:basic      # Vue 3 + Vite 基础
pnpm dev:server     # React 19 + Vite Dev Server
pnpm dev:vite-build # React 19 + Vite 构建优化

# Next.js 全栈探索
pnpm dev:next

# 构建 & 类型检查
pnpm build
pnpm type-check
```

## 技术栈 · Tech Stack

**构建工具 · Build**
Vite 8 · Next.js 16

**框架 · Framework**
React 19 · Vue 3

**UI & 样式 · Styling**
Tailwind CSS 4 · Ant Design 6 · shadcn/ui · SCSS · CSS Design Tokens

**状态管理 · State**
Jotai · Zustand

**工程化 · Tooling**
TypeScript · pnpm workspace · esbuild · vite-bundle-analyzer

## 探索路径 · Learning Path

建议按复杂度递增顺序探索，观察 AI 在不同层级的表现：

1. **vite-basic** — 入门：Vite 插件、HMR、SCSS，观察 AI 对构建工具基础的理解
2. **vite-server** — 进阶：Dev Server 架构、代理配置，考验 AI 对网络层配置的掌握
3. **vite-build** — 深入：构建优化、三层 Design Tokens 系统，挑战 AI 的工程化上限
4. **next-demo** — 全栈：App Router、Server Components、ISR，验证 AI 在现代框架中的综合能力

## License

MIT
