# infra-fe

**前端基础工具与基础设施库** — 提供可复用的 TypeScript 工具函数、React Hooks 和类型守卫。

> ⚠️ 此 package 是一个**工具库**，Next.js 仅用于运行辅助演示页面。核心代码在 [`src/`](./src/) 目录。

## 模块

| 模块 | 路径 | 类型 | 说明 |
|------|------|------|------|
| `cn()` | `@/utils` | 纯函数 | clsx + tailwind-merge，自动去重冲突的 Tailwind 类名 |
| `useLocalStorage` | `@/use-local-storage` | Hook | SSR 安全的 localStorage 状态持久化 |
| `useDebounce` | `@/use-debounce` | Hook | 防抖 Hook，支持自定义延迟 |
| `assertNever` | `@/assert-never` | 类型工具 | 编译时穷尽性检查，保证 switch/case 覆盖所有分支 |
| `createContext` | `@/create-context` | React 工具 | 类型安全的 Context 工厂，消除默认值样板代码 |

## 使用方式

```ts
// 工具函数
import { cn } from "@/utils";

// React Hooks
import { useLocalStorage, useDebounce } from "@/index";

// 类型工具
import { assertNever, createContext } from "@/index";
```

## 开发

```bash
# 启动演示（Next.js dev server）
pnpm -C packages/infra-fe dev

# 类型检查
pnpm -C packages/infra-fe type-check

# Lint
pnpm -C packages/infra-fe lint

# 构建演示站点
pnpm -C packages/infra-fe build
```

## 目录结构

```
infra-fe/
├── src/           ★ 主代码：工具库源码（核心产物）
├── app/           辅助：Next.js 演示页面
├── components/    辅助：演示专用 UI 组件
└── package.json
```

## 扩展

在 `src/` 下添加新模块，在 `src/index.ts` 中导出。如需演示，在 `app/` 下添加对应路由页面。
