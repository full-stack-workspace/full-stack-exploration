# next-upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/next-upload` — a Next.js 16 全栈 package 演示大文件分片上传 e2e 闭环（切片/并发/合并/秒传/断点续传/暂停恢复/重试/多文件队列）。

**Architecture:** 单包全栈：Next.js App Router + Route Handlers 承载前端 UI 与后端协议；服务端状态完全由文件系统布局推导（路线 A，无 manifest）；客户端用 Zustand 全局 store 承载多任务状态机，per-task pipeline 调度分片并发 + 指数退避重试；hash 计算在 Web Worker 内用 SparkMD5 增量算法。

**Tech Stack:** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS v4 · shadcn/ui (全量 12 组件) · Zustand 5 · SparkMD5 3 · nanoid 5 · lucide-react · sonner

**Spec:** `docs/superpowers/specs/2026-06-06-next-upload-design.md`

**Test 框架说明：** 本仓库不引入测试框架（与现状一致，spec §9.1 已锁定）。验证手段：(1) `pnpm -C packages/next-upload type-check` / lint；(2) curl / 浏览器手动跑通 spec §9 V1–V10 验收场景。每个改业务逻辑的任务都有对应的验证步骤。

**注释约束（spec §8，硬约束）：** 每个新建文件顶部必须有 JSDoc 块（功能描述 / 功能特点 / `@module`）；段落用 `/* ==== ... ==== */` 分隔；函数/组件 JSDoc 含 `@param`/`@returns`/`@example`；所有注释中文。本计划中的代码块**已经按规范写好**，照搬即可。

---

## Phase 索引

| Phase | 内容 | 任务数 |
|---|---|---|
| A | 包脚手架（Next.js + Tailwind v4 + shadcn 初始化） | 4 |
| B | shadcn 12 组件 + Theme + Header | 3 |
| C | 共享类型 + 常量 + 状态样式映射 | 3 |
| D | 服务端协议（FS 层 + 4 个 Route Handlers + fixture 脚本） | 6 |
| E | Web Worker hash（worker + 主线程 client） | 2 |
| F | 客户端 API client + Zustand store + Pipeline 调度器 | 3 |
| G | UI 组件（Dropzone / ConcurrencyControl / TaskCard / TaskList） | 4 |
| H | layout + 主页 + about 页 | 3 |
| I | 根仓库集成（package.json scripts / .gitignore / README） | 3 |
| J | V1–V10 验收 + 收尾 | 11 |
| **合计** | | **42** |

预计每任务 2–5 分钟，整体约 2–3 小时手动跑完。

---

## Phase A — 包脚手架

### Task A1: 创建 package 目录与配置文件

**Files:**
- Create: `packages/next-upload/package.json`
- Create: `packages/next-upload/tsconfig.json`
- Create: `packages/next-upload/next.config.ts`
- Create: `packages/next-upload/postcss.config.mjs`
- Create: `packages/next-upload/eslint.config.mjs`
- Create: `packages/next-upload/.gitignore`
- Create: `packages/next-upload/next-env.d.ts`

- [ ] **Step 1: 创建目录结构**

```bash
cd /Users/sqliang/full-stack-workspace/full-stack-exploration
mkdir -p packages/next-upload/{app,components,data,lib/upload,types,workers,scripts,public}
```

- [ ] **Step 2: 写 `packages/next-upload/package.json`**

```json
{
  "name": "next-upload",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "eslint",
    "fix": "eslint --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.2.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: 写 `tsconfig.json`**（复用 next-demo 同款配置）

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext", "webworker"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "**/*.mts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

> 注意：`lib` 中加入了 `"webworker"`，给 `workers/hash.worker.ts` 提供类型支持。

- [ ] **Step 4: 写 `next.config.ts`**

```ts
/**
 * ============================================================================
 * Next.js 配置 — next-upload
 * ============================================================================
 *
 * 默认配置即可：
 * - Route Handlers 处理 multipart/form-data 无需特殊 body 解析配置（App Router 用 Request.formData() 流式接收）
 * - Web Worker 通过 new Worker(new URL('@/workers/hash.worker.ts', import.meta.url)) 即可
 *
 * @module next.config
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: 写 `postcss.config.mjs`**

```js
const config = {
  plugins: ["@tailwindcss/postcss"],
};
export default config;
```

- [ ] **Step 6: 写 `eslint.config.mjs`**（复用 next-demo 同款）

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 7: 写 `.gitignore`**

```
# Next.js
.next/
out/
build/

# Local
.env*.local

# IDE
.idea/
.vscode/
```

- [ ] **Step 8: 写 `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 9: Commit**

```bash
git add packages/next-upload/
git commit -m "chore(next-upload): 初始化 package 目录与基础配置文件"
```

---

### Task A2: 安装依赖

**Files:**
- Modify: `packages/next-upload/package.json` (via pnpm add)
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: 安装 runtime 依赖**

```bash
pnpm -C packages/next-upload add zustand spark-md5 nanoid sonner clsx tailwind-merge class-variance-authority lucide-react
```

- [ ] **Step 2: 安装 SparkMD5 类型 + tw-animate-css**

```bash
pnpm -C packages/next-upload add -D @types/spark-md5 tw-animate-css
```

- [ ] **Step 3: 在根目录跑一次 install 确保 workspace 链接正确**

```bash
pnpm install
```

预期：无错误，`pnpm-lock.yaml` 更新。

- [ ] **Step 4: 验证 type-check 通过（此时没有源码，应直接通过）**

```bash
pnpm -C packages/next-upload type-check
```

预期：无输出（成功）。

- [ ] **Step 5: Commit**

```bash
git add packages/next-upload/package.json pnpm-lock.yaml
git commit -m "chore(next-upload): 安装核心依赖 (zustand/spark-md5/nanoid/sonner/cva/lucide)"
```

---

### Task A3: 全局样式 + 最小 layout + 占位首页

**Files:**
- Create: `packages/next-upload/app/globals.css`
- Create: `packages/next-upload/app/layout.tsx`
- Create: `packages/next-upload/app/page.tsx`

- [ ] **Step 1: 写 `app/globals.css`**（Tailwind v4 + 暗色变体 + shadcn 变量占位）

```css
/**
 * ============================================================================
 * next-upload — Global Styles
 * ============================================================================
 *
 * 本文件包含：
 * - Tailwind CSS v4 入口
 * - 暗色模式 @custom-variant 声明（shadcn 在 v4 下官方推荐写法）
 * - @theme 自定义 token（primary 色阶 + 其他工程色）
 * - shadcn 组件用的 CSS 变量（:root / .dark）
 *
 * 设计说明：
 * - 与 next-demo 一致：用 class 策略（.dark 加到 <html>）
 * - shadcn 的 --background / --primary 等变量与我们的 --color-primary-* 共存，互不冲突
 *
 * @module globals.css
 */

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:where(.dark, .dark *));

/* =================================================================
 * Tailwind @theme — 工程色（与 next-demo 对齐）
 * ================================================================ */
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}

/* =================================================================
 * shadcn CSS 变量（亮色）
 * 注意：实际值由 shadcn CLI 在 Task B1 注入；这里仅占位避免编译错
 * 等 Task B1 跑 `shadcn init` 后，本段会被覆盖
 * ================================================================ */
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary-shadcn: var(--primary);
  --color-primary-shadcn-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * {
    @apply border-[color:var(--color-border)] outline-[color:var(--color-ring)]/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> **说明**：`--color-primary-*`（工程蓝）和 shadcn 的 `--primary`（黑/白对比色）是两套独立变量。为避免与 shadcn 的 `bg-primary` utility 重名导致语义混乱，本 package 中：
> - shadcn 组件用 `bg-primary` / `text-primary-foreground`（黑白对比）
> - 自定义业务用 `bg-primary-500` / `text-primary-700`（蓝色阶）
> 这是 next-demo 没明确解决的问题；本 package 借机理清。

- [ ] **Step 2: 写最小 `app/layout.tsx`**（Task H1 会扩展）

```tsx
/**
 * ============================================================================
 * Root Layout — next-upload
 * ============================================================================
 *
 * 当前为最小可启动版本，Task H1 会扩展为：
 * - 注入 FOUC 防闪烁脚本
 * - 包裹 ThemeProvider
 * - 注入 Sonner Toaster
 * - 渲染 Header
 *
 * @module app/layout
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "next-upload",
  description: "大文件分片上传 demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 写最小 `app/page.tsx`**（Task H2 会替换）

```tsx
/**
 * ============================================================================
 * 主页（占位） — next-upload
 * ============================================================================
 *
 * 当前为占位页，仅用于验证 dev server 能起。
 * Task H2 会替换为真正的上传任务面板。
 *
 * @module app/page
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">next-upload — 大文件分片上传 Demo</h1>
      <p className="mt-4 text-sm text-muted-foreground">脚手架占位页。Phase H 会替换为完整 UI。</p>
    </main>
  );
}
```

- [ ] **Step 4: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

预期：无输出。

- [ ] **Step 5: Commit**

```bash
git add packages/next-upload/app/
git commit -m "feat(next-upload): 添加全局样式与最小 layout/page 占位"
```

---

### Task A4: 根 package.json scripts + 启动验证

**Files:**
- Modify: `package.json` (repo root)

- [ ] **Step 1: 修改根 `package.json`**

```diff
   "scripts": {
     "dev:basic": "pnpm -C packages/vite-basic dev",
     "dev:server": "pnpm -C packages/vite-server dev",
     "dev:vite-build": "pnpm -C packages/vite-build dev",
     "dev:next": "pnpm -C packages/next-demo dev",
+    "dev:upload": "pnpm -C packages/next-upload dev",
     "build:basic": "pnpm -C packages/vite-basic build",
     "build:server": "pnpm -C packages/vite-server build",
     "build:vite-build": "pnpm -C packages/vite-build build",
+    "build:upload": "pnpm -C packages/next-upload build",
```

- [ ] **Step 2: 启动 dev server**

```bash
pnpm dev:upload
```

预期：约 2-3 秒后控制台打出 `▲ Next.js 16.x` `Local: http://localhost:3001`。

- [ ] **Step 3: 浏览器访问 http://localhost:3001 验证占位页可见**

预期：白底/暗底（取决于系统主题）页面显示"next-upload — 大文件分片上传 Demo"标题。

- [ ] **Step 4: Ctrl+C 停掉 dev server**

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "chore(root): 添加 dev:upload / build:upload 脚本"
```

---

## Phase B — shadcn 全量 12 组件 + Theme

### Task B1: shadcn init

**Files:**
- Create: `packages/next-upload/components.json` (CLI 生成)
- Create: `packages/next-upload/lib/utils.ts` (CLI 生成，下一步替换为详注版)
- Modify: `packages/next-upload/app/globals.css` (CLI 注入实际 oklch 值，覆盖 Task A3 占位)

- [ ] **Step 1: 进入 package 目录跑 shadcn init**

```bash
cd packages/next-upload
pnpm dlx shadcn@latest init
```

**交互回答**（按顺序）：
- `Would you like to use TypeScript?` → **Yes**
- `Which style would you like to use?` → **Default**
- `Which color would you like to use as base color?` → **Neutral**
- `Where is your global CSS file?` → `app/globals.css`
- `Would you like to use CSS variables for theming?` → **Yes**
- `Where is your tailwind.config located?` → 留空（v4 无需）
- `Configure import alias for components?` → `@/components`
- `Configure import alias for utils?` → `@/lib/utils`
- `Are you using React Server Components?` → **Yes**

> 如果 CLI 询问是否覆盖 `app/globals.css`，选 **Yes**——A3 写的是占位，CLI 会写入官方推荐值。我们的 `@theme { --color-primary-* }` 段会被覆盖，**需要在 Step 3 手动恢复**。

- [ ] **Step 2: 回到仓库根**

```bash
cd /Users/sqliang/full-stack-workspace/full-stack-exploration
```

- [ ] **Step 3: 在 `app/globals.css` 顶部（`@custom-variant dark` 之后）补回我们的 `@theme` 块**

打开 `packages/next-upload/app/globals.css`，在 `@custom-variant dark (&:where(.dark, .dark *));` 这一行**之后**、`:root {` 之前，插入以下内容（如果 CLI 已经删掉了的话）：

```css
/* =================================================================
 * Tailwind @theme — 工程色（与 next-demo 对齐）
 * 注意：与 shadcn 的 --primary 不同——前者是蓝色阶（业务用），后者是黑白对比（组件用）
 * ================================================================ */
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}
```

- [ ] **Step 4: 用详注版替换 CLI 生成的 `lib/utils.ts`**

```ts
/**
 * ============================================================================
 * Utility Functions — next-upload
 * ============================================================================
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ============================================================================
 * cn — 类名合并工具
 * ============================================================================
 *
 * clsx（条件类名）+ tailwind-merge（冲突解析）组合。
 * 优先用 cn() 而非模板字符串拼 className。
 *
 * @example
 * cn("px-4", isActive && "bg-blue-500")
 * cn("px-2 px-4", "px-8")  // => "px-8"
 *
 * @param inputs 类名片段
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: 检查 `components.json` 内容**

打开 `packages/next-upload/components.json`，应该是这样（如不一致需校正）：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 6: 验证 type-check + 启动 dev server 验证页面仍正常**

```bash
pnpm -C packages/next-upload type-check
pnpm dev:upload  # 浏览器访问 http://localhost:3001 应仍能看到占位页（颜色可能变了）
```

Ctrl+C 停掉。

- [ ] **Step 7: Commit**

```bash
git add packages/next-upload/components.json packages/next-upload/lib/utils.ts packages/next-upload/app/globals.css packages/next-upload/package.json pnpm-lock.yaml
git commit -m "feat(next-upload): shadcn 初始化（components.json/utils.ts/css 变量）"
```

---

### Task B2: shadcn add 全量 12 组件

**Files:**
- Create: `packages/next-upload/components/ui/{button,card,progress,badge,alert-dialog,sonner,tabs,dropdown-menu,tooltip,slider,input,separator}.tsx` (12 个，CLI 生成)

- [ ] **Step 1: 一次性安装 12 个组件**

```bash
cd packages/next-upload
pnpm dlx shadcn@latest add button card progress badge alert-dialog sonner tabs dropdown-menu tooltip slider input separator -y
cd ../..
```

CLI 会自动安装对应的 `@radix-ui/*` 子包到 `package.json`。

- [ ] **Step 2: 检查 12 个文件都生成了**

```bash
ls packages/next-upload/components/ui/
```

预期看到 12 个 `.tsx` 文件：button.tsx, card.tsx, progress.tsx, badge.tsx, alert-dialog.tsx, sonner.tsx, tabs.tsx, dropdown-menu.tsx, tooltip.tsx, slider.tsx, input.tsx, separator.tsx。

- [ ] **Step 3: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

预期：无错误。

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/components/ui/ packages/next-upload/package.json pnpm-lock.yaml
git commit -m "feat(next-upload): shadcn add 全量 12 组件 (button/card/progress/badge/alert-dialog/sonner/tabs/dropdown-menu/tooltip/slider/input/separator)"
```

---

### Task B3: ThemeProvider + Header

**Files:**
- Create: `packages/next-upload/components/ThemeProvider.tsx`
- Create: `packages/next-upload/components/Header.tsx`

- [ ] **Step 1: 写 `components/ThemeProvider.tsx`**（复用 next-demo 同款）

```tsx
/**
 * ============================================================================
 * ThemeProvider — next-upload
 * ============================================================================
 *
 * 与 next-demo 同款手写 Context（不引入 next-themes）。
 *
 * 职责：
 * - 管理 light/dark 主题状态
 * - 持久化到 localStorage
 * - 应用 .dark / .light class 到 <html>，触发 shadcn 与 @custom-variant dark 的变体
 *
 * @module components/ThemeProvider
 */
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * useTheme — 在组件中读取/切换当前主题
 * @throws 在 ThemeProvider 外部使用会抛错
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * getInitialTheme — 客户端首次渲染时同步读 localStorage / prefers-color-scheme
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * ThemeProvider — 包裹整个应用
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(() => setThemeState((p) => (p === "light" ? "dark" : "light")), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: 写 `components/Header.tsx`**

```tsx
/**
 * ============================================================================
 * Header — next-upload
 * ============================================================================
 *
 * 顶部导航栏。
 *
 * 职责：
 * - 站点 Logo
 * - 「关于」页面链接
 * - 主题切换按钮
 * - 显示活跃任务数 badge（Phase F 之后，从 useUploadStore 读 in-progress 任务数）
 *
 * @module components/Header
 */
"use client";

import Link from "next/link";
import { Moon, Sun, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";

/**
 * Header — 顶部 sticky 导航栏
 *
 * 注意：activeCount 暂时硬编码为 0，Task H1 / G4 会接入真实的 useUploadStore。
 */
export default function Header() {
  const { theme, toggleTheme } = useTheme();
  // TODO(F-phase): 替换为 useUploadStore((s) => 活跃任务数)
  const activeCount = 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">next-upload</span>
        </Link>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="secondary" className="font-mono">
              active: {activeCount}
            </Badge>
          )}
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "切换到暗色" : "切换到亮色"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/components/ThemeProvider.tsx packages/next-upload/components/Header.tsx
git commit -m "feat(next-upload): 添加 ThemeProvider 与 Header（含主题切换 + active badge 占位）"
```

---

## Phase C — 共享类型 + 常量 + 状态样式

### Task C1: types/upload.ts — 全部类型

**Files:**
- Create: `packages/next-upload/types/upload.ts`

- [ ] **Step 1: 写完整类型文件**

```ts
/**
 * ============================================================================
 * 上传相关类型 — next-upload
 * ============================================================================
 *
 * 本文件集中定义：
 * - 客户端任务状态（TaskStatus）与任务对象（UploadTask）
 * - 三个上传 API 端点的请求 / 响应 DTO（CheckRequest / CheckResponse / ChunkResponse / MergeRequest / MergeResponse）
 * - 内部错误类型（HttpError）
 *
 * 状态机文档见 spec §6.1。
 *
 * @module types/upload
 */

/* =================================================================
 * 任务状态机
 * ================================================================ */

/**
 * 8 种任务状态：
 * - hashing   计算文件 hash
 * - checking  调用 /api/upload/check
 * - uploading 并发上传分片
 * - merging   调用 /api/upload/merge
 * - completed 上传成功（含合并）
 * - instant   秒传命中（check 直接返回 completed）
 * - paused    用户手动暂停
 * - failed    单分片超过 MAX_RETRY 或致命错误
 *
 * 终态：completed | instant | failed（后者可经 retryTask 复活到 checking）
 */
export type TaskStatus =
  | "hashing"
  | "checking"
  | "uploading"
  | "merging"
  | "completed"
  | "instant"
  | "paused"
  | "failed";

/**
 * 单个上传任务的完整状态
 *
 * 注意：
 * - `file`、`abortController` 是运行时引用，不应被序列化或持久化
 * - `uploadedIndices` / `inflightIndices` 使用 Set 便于增删；UI 用 .size 显示
 * - `createdAt` 由调用方传入，避免 store 内部使用 Date.now() 影响测试
 */
export interface UploadTask {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileHash: string | null;
  chunkSize: number;
  totalChunks: number;
  uploadedIndices: Set<number>;
  inflightIndices: Set<number>;
  status: TaskStatus;
  error: string | null;
  hashProgress: number; // 0..1
  uploadProgress: number; // 0..1
  createdAt: number;
  completedAt: number | null;
  url: string | null;
  abortController: AbortController;
}

/* =================================================================
 * 协议 DTO — 严格对应 spec §5
 * ================================================================ */

/**
 * POST /api/upload/check 请求体
 */
export interface CheckRequest {
  fileHash: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
}

/**
 * POST /api/upload/check 响应（三态）
 */
export type CheckResponse =
  | { status: "completed"; url: string }
  | { status: "partial"; uploaded: number[] }
  | { status: "new" };

/**
 * POST /api/upload/chunk 响应
 * （请求体是 multipart/form-data：fileHash, index, chunk）
 */
export interface ChunkResponse {
  ok: true;
  index: number;
}

/**
 * POST /api/upload/merge 请求体
 */
export interface MergeRequest {
  fileHash: string;
  fileName: string;
  totalChunks: number;
}

/**
 * POST /api/upload/merge 响应
 */
export interface MergeResponse {
  ok: true;
  url: string;
  size: number;
  mergedAt: number;
}

/* =================================================================
 * 错误类型
 * ================================================================ */

/**
 * HttpError — 包装 fetch 失败 / 非 2xx 响应
 * 用于在 pipeline.uploadWithRetry 中根据 status 区分 4xx（不重试）与 5xx（重试）
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/types/upload.ts
git commit -m "feat(next-upload): 定义上传任务状态机与协议 DTO 类型"
```

---

### Task C2: lib/upload/constants.ts

**Files:**
- Create: `packages/next-upload/lib/upload/constants.ts`

- [ ] **Step 1: 写常量文件**

```ts
/**
 * ============================================================================
 * 上传相关常量 — next-upload
 * ============================================================================
 *
 * 所有常量都附带"为什么是这个值"的说明（spec §8.2 强制要求）。
 *
 * @module lib/upload/constants
 */

/**
 * 分片大小：5 MiB
 *
 * 为什么是这个值：
 * - Cloudflare / CloudFront / S3 multipart 默认分片范围内最常用挡位
 * - 太小（如 256 KiB）→ 1 GB 文件会切出 4000+ 个 HTTP 请求，握手开销暴涨
 * - 太大（如 50 MiB）→ 暂停 / 重试粒度太粗，单次失败重传太贵
 */
export const CHUNK_SIZE = 5 * 1024 * 1024;

/**
 * 默认并发分片数：4
 *
 * 为什么是这个值：
 * - 浏览器同源连接上限通常是 6（Chrome / Firefox / Safari 一致）
 * - 留 2 个 slot 给页面其他 fetch（API 探活、下载预览等）
 * - UI Slider 允许调整 1–8
 */
export const DEFAULT_CONCURRENCY = 4;

/**
 * 单分片最大重试次数：3
 *
 * 为什么是这个值：
 * - 总尝试 = 1（首次）+ 3（重试）= 4 次
 * - 退避序列 1s + 2s + 4s = 7s 等待 + 4 次请求
 * - 7s 内仍连不通 server，再等也无意义；判失败更人性化
 */
export const MAX_RETRY = 3;

/**
 * 重试退避基数：1000ms
 *
 * 实际退避序列：1s → 2s → 4s（指数 2^attempt）
 * 设计为：第 attempt 次重试前 sleep(RETRY_BASE_MS * 2 ** attempt)
 */
export const RETRY_BASE_MS = 1000;

/**
 * Hash 时按 2 MiB 切片喂给 SparkMD5
 *
 * 为什么是这个值：
 * - 足够大：减少 FileReader 调用次数（1 GB 文件 → 512 次 read）
 * - 足够小：worker 内部不会一次分配过大 ArrayBuffer 引发 OOM
 * - 与 CHUNK_SIZE 解耦：hash 切片只影响内存，与上传协议无关
 */
export const HASH_CHUNK_SIZE = 2 * 1024 * 1024;

/**
 * 并发滑动条范围：1–8
 */
export const CONCURRENCY_MIN = 1;
export const CONCURRENCY_MAX = 8;
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/constants.ts
git commit -m "feat(next-upload): 添加上传常量（chunk size / concurrency / retry / hash chunk）"
```

---

### Task C3: lib/upload/status-style.ts

**Files:**
- Create: `packages/next-upload/lib/upload/status-style.ts`

- [ ] **Step 1: 写状态样式映射**

```ts
/**
 * ============================================================================
 * 任务状态 → UI 样式映射 — next-upload
 * ============================================================================
 *
 * 集中维护每个 TaskStatus 对应的：
 * - 文案（中文短标签）
 * - shadcn Badge 的 variant（"default" | "secondary" | "destructive" | "outline"）
 * - 自定义辅助 class（用于状态机特殊配色，如蓝色"上传中"、紫色"合并中"）
 *
 * 设计原则：
 * - TaskCard 直接调 statusStyle(status) 拿全部展示信息
 * - 改文案 / 配色 → 只改本文件
 *
 * @module lib/upload/status-style
 */

import type { TaskStatus } from "@/types/upload";

/**
 * Badge 变体（对应 shadcn badge 的 variant prop）
 */
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * 单个状态的展示信息
 */
export interface StatusStyle {
  /** 中文短标签 */
  label: string;
  /** shadcn Badge variant */
  variant: BadgeVariant;
  /** 额外 Tailwind class（叠加在 Badge 上，覆盖默认配色） */
  className?: string;
  /** 是否在徽章上展示一个旋转 spinner（hashing/checking/merging 用） */
  spinning?: boolean;
}

/**
 * statusStyle — 由 TaskStatus 取展示信息
 *
 * @param status 任务当前状态
 * @returns 用于渲染 Badge 的 { label, variant, className?, spinning? }
 *
 * @example
 * const s = statusStyle(task.status);
 * <Badge variant={s.variant} className={s.className}>{s.label}</Badge>
 */
export function statusStyle(status: TaskStatus): StatusStyle {
  switch (status) {
    case "hashing":
      return { label: "计算中", variant: "secondary", spinning: true };
    case "checking":
      return { label: "校验中", variant: "secondary", spinning: true };
    case "uploading":
      return {
        label: "上传中",
        variant: "outline",
        className: "border-primary-500/30 bg-primary-500/15 text-primary-700 dark:text-primary-300",
      };
    case "merging":
      return {
        label: "合并中",
        variant: "outline",
        className: "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300",
        spinning: true,
      };
    case "paused":
      return {
        label: "已暂停",
        variant: "outline",
        className: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
      };
    case "completed":
      return {
        label: "已完成",
        variant: "outline",
        className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      };
    case "instant":
      return {
        label: "⭐ 秒传命中",
        variant: "outline",
        className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      };
    case "failed":
      return { label: "失败", variant: "destructive" };
  }
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/status-style.ts
git commit -m "feat(next-upload): 添加状态 → UI 样式映射（statusStyle）"
```

---

## Phase D — 服务端协议

### Task D1: data/uploads.ts — 文件系统数据访问层

**Files:**
- Create: `packages/next-upload/data/uploads.ts`
- Modify: `.gitignore` (repo root) — 加 `.uploads/`

- [ ] **Step 1: 添加根 `.gitignore` 条目**

打开根 `.gitignore`，追加：

```diff
+
+# next-upload runtime storage
+.uploads/
+packages/next-upload/fixture/
```

- [ ] **Step 2: 写 `data/uploads.ts`**

```ts
/**
 * ============================================================================
 * 服务端 FS 数据访问层 — next-upload
 * ============================================================================
 *
 * 路线 A：文件系统作状态。本文件封装所有读写 .uploads/ 的纯函数。
 *
 * 目录布局（spec §4.2）：
 *   .uploads/
 *   ├── chunks/<fileHash>/<index>.part
 *   ├── merged/<fileHash>.bin
 *   └── merged/<fileHash>.name        ← 原文件名（文本）
 *
 * 设计原则：
 * - 所有路径通过 getXxx() 函数获得，禁止在 Route Handler 里手拼
 * - 写操作原子（tmp + rename），避免半截文件被误识别
 * - 暴露给 Route Handler 的函数都是 async；纯路径函数同步
 *
 * @module data/uploads
 */

import { promises as fs, createReadStream, createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";

/* =================================================================
 * 路径工具（纯函数，无 I/O）
 * ================================================================ */

/**
 * .uploads/ 根目录绝对路径（相对仓库根 process.cwd()）
 *
 * 注意：Next.js dev server 在 packages/next-upload/ 下启动时，
 * process.cwd() = 该 package 目录，所以 .uploads/ 会落在 package 内。
 * 这是预期行为：把 demo 的运行时数据隔离在 package 内不污染仓库根。
 */
export function getUploadsRoot(): string {
  return resolve(process.cwd(), ".uploads");
}

export function getChunksRoot(): string {
  return join(getUploadsRoot(), "chunks");
}

export function getMergedRoot(): string {
  return join(getUploadsRoot(), "merged");
}

export function getChunkDir(hash: string): string {
  assertValidHash(hash);
  return join(getChunksRoot(), hash);
}

export function getChunkPath(hash: string, index: number): string {
  return join(getChunkDir(hash), `${index}.part`);
}

export function getChunkTmpPath(hash: string, index: number): string {
  return join(getChunkDir(hash), `${index}.part.tmp`);
}

export function getMergedPath(hash: string): string {
  assertValidHash(hash);
  return join(getMergedRoot(), `${hash}.bin`);
}

export function getNamePath(hash: string): string {
  assertValidHash(hash);
  return join(getMergedRoot(), `${hash}.name`);
}

/**
 * 校验 hash 是合法 MD5（32 位十六进制）—— 防 path traversal
 */
function assertValidHash(hash: string): void {
  if (!/^[a-f0-9]{32}$/i.test(hash)) {
    throw new Error(`Invalid fileHash: ${hash}`);
  }
}

/* =================================================================
 * 查询
 * ================================================================ */

/**
 * 检查合并产物是否存在（秒传判定）
 */
export async function hasMerged(hash: string): Promise<boolean> {
  try {
    await fs.access(getMergedPath(hash));
    return true;
  } catch {
    return false;
  }
}

/**
 * 列出指定文件已上传的分片 index（续传判定）
 *
 * 行为：
 * - 目录不存在 → 返回 []
 * - 跳过 .part.tmp 文件（未完成的原子写）
 * - 排序升序返回
 */
export async function listChunkIndices(hash: string): Promise<number[]> {
  const dir = getChunkDir(hash);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".part") && !f.endsWith(".part.tmp"))
      .map((f) => Number(f.replace(".part", "")))
      .filter((n) => Number.isInteger(n) && n >= 0)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/* =================================================================
 * 写入
 * ================================================================ */

/**
 * 原子写单个分片：先写 .part.tmp 再 rename 成 .part
 *
 * 这样即便写入中途崩溃，旁边只会有 .part.tmp 残留，
 * 不会被 listChunkIndices 误认为成功的分片。
 */
export async function writeChunkAtomic(
  hash: string,
  index: number,
  blob: Blob,
): Promise<void> {
  await fs.mkdir(getChunkDir(hash), { recursive: true });
  const tmp = getChunkTmpPath(hash, index);
  const final = getChunkPath(hash, index);
  const buf = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(tmp, buf);
  await fs.rename(tmp, final);
}

/**
 * 合并所有分片：按 index 升序流式 cat 到 merged/<hash>.bin
 *
 * 步骤：
 * 1. 校验 0..totalChunks-1 全部到位，缺片直接抛错（Route Handler 转 400）
 * 2. 幂等：若 merged/<hash>.bin 已存在，直接 stat 返回 size
 * 3. createWriteStream 顺序 pipe 每个 .part
 * 4. 旁路写 <hash>.name 记录原文件名
 * 5. 删除整个 chunks/<hash>/ 目录
 *
 * @returns { size, mergedAt }
 */
export async function mergeChunks(
  hash: string,
  totalChunks: number,
  originalName: string,
): Promise<{ size: number; mergedAt: number }> {
  // 幂等
  if (await hasMerged(hash)) {
    const stat = await fs.stat(getMergedPath(hash));
    return { size: stat.size, mergedAt: stat.mtimeMs };
  }

  // 校验完整性
  const have = new Set(await listChunkIndices(hash));
  const missing: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!have.has(i)) missing.push(i);
  }
  if (missing.length > 0) {
    const err = new Error(`Missing chunks: ${missing.slice(0, 10).join(",")}${missing.length > 10 ? "..." : ""}`);
    (err as Error & { missing: number[] }).missing = missing;
    throw err;
  }

  await fs.mkdir(getMergedRoot(), { recursive: true });
  const outPath = getMergedPath(hash);
  const out = createWriteStream(outPath);

  // 顺序流式 pipe，避免一次性把整个文件读进内存
  for (let i = 0; i < totalChunks; i++) {
    await new Promise<void>((res, rej) => {
      const r = createReadStream(getChunkPath(hash, i));
      r.on("error", rej);
      r.on("end", res);
      r.pipe(out, { end: false });
    });
  }
  await new Promise<void>((res, rej) => {
    out.end((err: unknown) => (err ? rej(err as Error) : res()));
  });

  // 旁路写原文件名（用于下载时拼 Content-Disposition）
  await fs.writeFile(getNamePath(hash), originalName, "utf8");

  // 清理已合并的分片目录
  await fs.rm(getChunkDir(hash), { recursive: true, force: true });

  const stat = await fs.stat(outPath);
  return { size: stat.size, mergedAt: stat.mtimeMs };
}

/**
 * 读取原文件名（下载时用）
 */
export async function getOriginalName(hash: string): Promise<string | null> {
  try {
    return await fs.readFile(getNamePath(hash), "utf8");
  } catch {
    return null;
  }
}

/**
 * 打开合并产物的 ReadableStream（用于流式下载）
 *
 * @returns 可直接传给 Next.js Response 构造器的 web ReadableStream
 */
export function openMergedStream(hash: string): ReadableStream | null {
  try {
    const node = createReadStream(getMergedPath(hash));
    return Readable.toWeb(node) as ReadableStream;
  } catch {
    return null;
  }
}

/**
 * 取合并产物大小
 */
export async function getMergedSize(hash: string): Promise<number | null> {
  try {
    const stat = await fs.stat(getMergedPath(hash));
    return stat.size;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore packages/next-upload/data/uploads.ts
git commit -m "feat(next-upload): 添加服务端 FS 数据访问层（原子写 + 流式合并）"
```

---

### Task D2: POST /api/upload/check

**Files:**
- Create: `packages/next-upload/app/api/upload/check/route.ts`

- [ ] **Step 1: 写 check route handler**

```ts
/**
 * ============================================================================
 * POST /api/upload/check — 秒传 / 续传 / 全新 三态判定
 * ============================================================================
 *
 * 请求体（JSON）：
 *   {
 *     fileHash: string,        // 32 位 hex MD5
 *     fileName: string,
 *     fileSize: number,
 *     chunkSize: number,
 *     totalChunks: number
 *   }
 *
 * 响应：
 *   { status: "completed", url: "/api/files/<hash>" }    // 秒传命中
 *   { status: "partial", uploaded: [0,1,2,5,6] }          // 续传
 *   { status: "new" }                                     // 全新文件
 *
 * 错误：
 *   400 — 请求体格式不对 / fileHash 非法
 *
 * @module app/api/upload/check
 */

import { NextResponse } from "next/server";
import type { CheckRequest, CheckResponse } from "@/types/upload";
import { hasMerged, listChunkIndices } from "@/data/uploads";

export async function POST(req: Request) {
  // === 解析 + 校验请求体 ===
  let body: CheckRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.fileHash || typeof body.fileHash !== "string") {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  // === 三态判定 ===
  try {
    if (await hasMerged(body.fileHash)) {
      const res: CheckResponse = {
        status: "completed",
        url: `/api/files/${body.fileHash}`,
      };
      return NextResponse.json(res);
    }
    const uploaded = await listChunkIndices(body.fileHash);
    if (uploaded.length > 0) {
      const res: CheckResponse = { status: "partial", uploaded };
      return NextResponse.json(res);
    }
    const res: CheckResponse = { status: "new" };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: 启动 dev server 用 curl 验证**

```bash
pnpm dev:upload  # 后台启动；新开终端跑下面 curl
```

新终端：
```bash
curl -s -X POST http://localhost:3001/api/upload/check \
  -H 'Content-Type: application/json' \
  -d '{"fileHash":"00000000000000000000000000000000","fileName":"a.txt","fileSize":10,"chunkSize":5,"totalChunks":2}' | jq
```

预期输出：
```json
{ "status": "new" }
```

测试非法 hash 应 400：
```bash
curl -s -X POST http://localhost:3001/api/upload/check \
  -H 'Content-Type: application/json' \
  -d '{"fileHash":"not-a-hash","fileName":"a","fileSize":1,"chunkSize":1,"totalChunks":1}' | jq
```

预期：`{ "error": "Invalid fileHash: not-a-hash" }`，HTTP 400。

Ctrl+C 停 dev server。

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/api/upload/check/
git commit -m "feat(next-upload): POST /api/upload/check 秒传/续传/全新三态判定"
```

---

### Task D3: POST /api/upload/chunk

**Files:**
- Create: `packages/next-upload/app/api/upload/chunk/route.ts`

- [ ] **Step 1: 写 chunk route handler**

```ts
/**
 * ============================================================================
 * POST /api/upload/chunk — 上传单个分片
 * ============================================================================
 *
 * 请求：multipart/form-data
 *   fileHash : text
 *   index    : text (number)
 *   chunk    : file (Blob)
 *
 * 响应：
 *   { ok: true, index: number }
 *
 * 错误：
 *   400 — 缺字段 / index 非法 / hash 非法
 *
 * @module app/api/upload/chunk
 */

import { NextResponse } from "next/server";
import type { ChunkResponse } from "@/types/upload";
import { writeChunkAtomic } from "@/data/uploads";

export async function POST(req: Request) {
  // === 解析 multipart ===
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart" }, { status: 400 });
  }

  const fileHash = form.get("fileHash");
  const indexRaw = form.get("index");
  const chunk = form.get("chunk");

  if (typeof fileHash !== "string" || typeof indexRaw !== "string" || !(chunk instanceof Blob)) {
    return NextResponse.json({ error: "Missing fields (fileHash/index/chunk)" }, { status: 400 });
  }
  const index = Number(indexRaw);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }

  // === 原子写入 ===
  try {
    await writeChunkAtomic(fileHash, index, chunk);
    const res: ChunkResponse = { ok: true, index };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
```

- [ ] **Step 2: 验证 type-check + curl 验证**

```bash
pnpm -C packages/next-upload type-check
pnpm dev:upload  # 启动 dev
```

新终端，准备一个小文件并上传：
```bash
echo "hello world chunk 0" > /tmp/c0.bin
curl -s -X POST http://localhost:3001/api/upload/chunk \
  -F 'fileHash=11111111111111111111111111111111' \
  -F 'index=0' \
  -F 'chunk=@/tmp/c0.bin' | jq
```

预期：`{ "ok": true, "index": 0 }`

确认磁盘落盘：
```bash
ls packages/next-upload/.uploads/chunks/11111111111111111111111111111111/
# 应看到 0.part
cat packages/next-upload/.uploads/chunks/11111111111111111111111111111111/0.part
# 应是 hello world chunk 0
```

回到第一终端 Ctrl+C 停 dev。

- [ ] **Step 3: 清理测试数据**

```bash
rm -rf packages/next-upload/.uploads/chunks/11111111111111111111111111111111
```

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/api/upload/chunk/
git commit -m "feat(next-upload): POST /api/upload/chunk 原子写入单分片"
```

---

### Task D4: POST /api/upload/merge

**Files:**
- Create: `packages/next-upload/app/api/upload/merge/route.ts`

- [ ] **Step 1: 写 merge route handler**

```ts
/**
 * ============================================================================
 * POST /api/upload/merge — 合并所有分片
 * ============================================================================
 *
 * 请求体（JSON）：
 *   {
 *     fileHash: string,
 *     fileName: string,        // 原文件名，用于下载时 Content-Disposition
 *     totalChunks: number
 *   }
 *
 * 响应：
 *   { ok: true, url: "/api/files/<hash>", size: number, mergedAt: number }
 *
 * 错误：
 *   400 — 缺片（响应含 { error, missing: number[] }）/ hash 非法
 *
 * @module app/api/upload/merge
 */

import { NextResponse } from "next/server";
import type { MergeRequest, MergeResponse } from "@/types/upload";
import { mergeChunks } from "@/data/uploads";

export async function POST(req: Request) {
  // === 解析 ===
  let body: MergeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.fileHash || !body.fileName || !Number.isInteger(body.totalChunks)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // === 合并（mergeChunks 内部已做幂等 + 缺片校验 + 流式 pipe） ===
  try {
    const { size, mergedAt } = await mergeChunks(body.fileHash, body.totalChunks, body.fileName);
    const res: MergeResponse = {
      ok: true,
      url: `/api/files/${body.fileHash}`,
      size,
      mergedAt,
    };
    return NextResponse.json(res);
  } catch (e) {
    const err = e as Error & { missing?: number[] };
    return NextResponse.json(
      { error: err.message, missing: err.missing },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: 验证 type-check + curl 端到端验证**

```bash
pnpm -C packages/next-upload type-check
pnpm dev:upload
```

新终端，构造 3 个分片再合并：
```bash
HASH=22222222222222222222222222222222
echo -n "AAA" > /tmp/p0.bin
echo -n "BBB" > /tmp/p1.bin
echo -n "CCC" > /tmp/p2.bin

for i in 0 1 2; do
  curl -s -X POST http://localhost:3001/api/upload/chunk \
    -F "fileHash=$HASH" -F "index=$i" -F "chunk=@/tmp/p$i.bin" > /dev/null
done

curl -s -X POST http://localhost:3001/api/upload/merge \
  -H 'Content-Type: application/json' \
  -d "{\"fileHash\":\"$HASH\",\"fileName\":\"abc.txt\",\"totalChunks\":3}" | jq
```

预期：`{ "ok": true, "url": "/api/files/2222...", "size": 9, "mergedAt": <ts> }`

验证产物：
```bash
cat packages/next-upload/.uploads/merged/$HASH.bin
# 应输出 AAABBBCCC
cat packages/next-upload/.uploads/merged/$HASH.name
# 应输出 abc.txt
ls packages/next-upload/.uploads/chunks/$HASH 2>&1 | head
# 应报"no such file or directory"——chunks 目录已被清掉
```

回到第一终端 Ctrl+C。

- [ ] **Step 3: 清理**

```bash
rm -rf packages/next-upload/.uploads/merged/22222222222222222222222222222222.*
```

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/api/upload/merge/
git commit -m "feat(next-upload): POST /api/upload/merge 流式合并 + 原子幂等"
```

---

### Task D5: GET /api/files/[hash]

**Files:**
- Create: `packages/next-upload/app/api/files/[hash]/route.ts`

- [ ] **Step 1: 写流式下载 route handler**

```ts
/**
 * ============================================================================
 * GET /api/files/[hash] — 流式下载合并产物
 * ============================================================================
 *
 * 响应：
 *   200 — 流式 binary，含 Content-Type / Content-Length / Content-Disposition
 *   404 — 产物不存在
 *
 * 设计：
 * - 不用 public/ 静态目录，体现 Next.js Route Handlers 的流式响应能力
 * - 用 createReadStream + Readable.toWeb 转 web ReadableStream，避免大文件一次读进内存
 * - Content-Disposition 的 filename 从旁路 .name 文件读取
 *
 * @module app/api/files/[hash]
 */

import { NextResponse } from "next/server";
import { openMergedStream, getMergedSize, getOriginalName } from "@/data/uploads";

interface RouteContext {
  params: Promise<{ hash: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { hash } = await ctx.params;

  let size: number | null;
  try {
    size = await getMergedSize(hash);
  } catch {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }
  if (size === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stream = openMergedStream(hash);
  if (!stream) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = (await getOriginalName(hash)) ?? `${hash}.bin`;
  // RFC 6266 兼容：filename 编码为 UTF-8 百分号
  const filenameStar = `filename*=UTF-8''${encodeURIComponent(name)}`;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; ${filenameStar}`,
    },
  });
}
```

- [ ] **Step 2: 验证 type-check + curl 端到端**

```bash
pnpm -C packages/next-upload type-check
pnpm dev:upload
```

新终端，复用 D4 的合并产物（如果还在）或重新跑 D4 的 curl 一遍后：
```bash
HASH=22222222222222222222222222222222
echo -n "AAA" > /tmp/p0.bin && echo -n "BBB" > /tmp/p1.bin && echo -n "CCC" > /tmp/p2.bin
for i in 0 1 2; do
  curl -s -X POST http://localhost:3001/api/upload/chunk -F "fileHash=$HASH" -F "index=$i" -F "chunk=@/tmp/p$i.bin" > /dev/null
done
curl -s -X POST http://localhost:3001/api/upload/merge -H 'Content-Type: application/json' \
  -d "{\"fileHash\":\"$HASH\",\"fileName\":\"abc.txt\",\"totalChunks\":3}" > /dev/null

# 下载
curl -s -i "http://localhost:3001/api/files/$HASH" | head -10
curl -s "http://localhost:3001/api/files/$HASH" | xxd
```

预期 headers 含 `Content-Length: 9` 与 `Content-Disposition: attachment; filename*=UTF-8''abc.txt`，body 为 `AAABBBCCC`。

测试 404：
```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3001/api/files/ffffffffffffffffffffffffffffffff"
# 应输出 404
```

Ctrl+C。

- [ ] **Step 3: 清理**

```bash
rm -rf packages/next-upload/.uploads/merged/22222222222222222222222222222222.*
```

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/api/files/
git commit -m "feat(next-upload): GET /api/files/[hash] 流式下载合并产物"
```

---

### Task D6: scripts/make-fixture.mjs

**Files:**
- Create: `packages/next-upload/scripts/make-fixture.mjs`

- [ ] **Step 1: 写 fixture 生成脚本**

```js
/**
 * ============================================================================
 * make-fixture.mjs — 生成随机内容的测试用大文件
 * ============================================================================
 *
 * 用法：
 *   node scripts/make-fixture.mjs <SIZE_MB>
 *
 * 例：
 *   node scripts/make-fixture.mjs 100
 *   → 在 fixture/100MB.bin 写出 100 MiB 的随机字节
 *
 * 设计要点：
 * - 用 crypto.randomBytes 保证内容随机（避免 zero-byte 误中 hash 碰撞）
 * - 流式写，分 4 MiB 块，避免大尺寸 OOM
 * - fixture/ 目录已加 .gitignore
 *
 * @module scripts/make-fixture
 */

import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { argv, exit } from "node:process";

const sizeMB = Number(argv[2]);
if (!Number.isFinite(sizeMB) || sizeMB <= 0) {
  console.error("Usage: node scripts/make-fixture.mjs <SIZE_MB>");
  exit(1);
}

const FIXTURE_DIR = resolve(process.cwd(), "fixture");
mkdirSync(FIXTURE_DIR, { recursive: true });

const outPath = resolve(FIXTURE_DIR, `${sizeMB}MB.bin`);
const out = createWriteStream(outPath);

const BLOCK = 4 * 1024 * 1024;
const totalBytes = sizeMB * 1024 * 1024;
let written = 0;

function writeBlock() {
  while (written < totalBytes) {
    const remain = totalBytes - written;
    const size = Math.min(BLOCK, remain);
    if (!out.write(randomBytes(size))) {
      out.once("drain", writeBlock);
      written += size;
      return;
    }
    written += size;
  }
  out.end(() => {
    console.log(`✓ ${outPath} (${(totalBytes / 1024 / 1024).toFixed(0)} MiB)`);
  });
}

writeBlock();
```

- [ ] **Step 2: 验证脚本能跑**

```bash
node packages/next-upload/scripts/make-fixture.mjs 1
ls -lh packages/next-upload/fixture/
# 应看到 1MB.bin
```

清理：
```bash
rm -rf packages/next-upload/fixture
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/scripts/
git commit -m "chore(next-upload): 添加 make-fixture.mjs 生成测试用大文件"
```

---

## Phase E — Web Worker hash

### Task E1: workers/hash.worker.ts

**Files:**
- Create: `packages/next-upload/workers/hash.worker.ts`

- [ ] **Step 1: 写 worker 入口**

```ts
/**
 * ============================================================================
 * Hash Worker — next-upload
 * ============================================================================
 *
 * 在 Web Worker 内用 SparkMD5 增量算整文件 MD5。
 *
 * 消息协议（main → worker）：
 *   { file: File }
 *
 * 消息协议（worker → main）：
 *   { type: 'progress', value: number }     // 0..1，每 5 次 append 发一次
 *   { type: 'done',     hash: string }
 *   { type: 'error',    message: string }
 *
 * 实现要点：
 * - SparkMD5.ArrayBuffer 是增量 hash 算法，全过程内存峰值 ≈ HASH_CHUNK_SIZE
 * - 用 file.slice(start, end).arrayBuffer() 切块，比 FileReader 简洁
 * - worker 单例，多任务串行排队（在 main 侧的 hash-worker-client 控制）
 *
 * @module workers/hash.worker
 */

/// <reference lib="webworker" />

import SparkMD5 from "spark-md5";

import { HASH_CHUNK_SIZE } from "@/lib/upload/constants";

interface RequestMessage {
  file: File;
}

type ResponseMessage =
  | { type: "progress"; value: number }
  | { type: "done"; hash: string }
  | { type: "error"; message: string };

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener("message", async (ev: MessageEvent<RequestMessage>) => {
  const { file } = ev.data;
  try {
    const hash = await computeMD5(file);
    post({ type: "done", hash });
  } catch (e) {
    post({ type: "error", message: (e as Error).message });
  }
});

function post(msg: ResponseMessage): void {
  self.postMessage(msg);
}

/**
 * 增量计算整个 File 的 MD5
 *
 * @param file - 浏览器 File 对象
 * @returns 32 位 hex 字符串
 *
 * @example
 * const hash = await computeMD5(file); // "a3f5b21..."
 */
async function computeMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  const total = file.size;
  let offset = 0;
  let appendCount = 0;

  while (offset < total) {
    const end = Math.min(offset + HASH_CHUNK_SIZE, total);
    const buf = await file.slice(offset, end).arrayBuffer();
    spark.append(buf);
    offset = end;
    appendCount++;

    // 每 5 次 append 报一次进度，避免高频 postMessage 拖慢主线程
    if (appendCount % 5 === 0 || offset === total) {
      post({ type: "progress", value: offset / total });
    }
  }

  return spark.end();
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/workers/hash.worker.ts
git commit -m "feat(next-upload): 添加 SparkMD5 增量 hash worker"
```

---

### Task E2: lib/upload/hash-worker-client.ts — 主线程包装

**Files:**
- Create: `packages/next-upload/lib/upload/hash-worker-client.ts`

- [ ] **Step 1: 写 worker client**

```ts
/**
 * ============================================================================
 * Hash Worker Client — 主线程包装
 * ============================================================================
 *
 * 职责：
 * - 懒创建唯一的 hash worker 实例（避免多 worker 抢内存）
 * - 串行化多任务的 compute() 调用（一次只算一个文件）
 * - 把 worker 的 progress 消息转成 onProgress 回调
 * - 把 worker 的 done 消息 resolve 成 Promise<string>
 *
 * @module lib/upload/hash-worker-client
 */

"use client";

/**
 * HashWorkerClient — 单例 + 串行队列
 *
 * 用法：
 * ```ts
 * import { hashWorkerClient } from '@/lib/upload/hash-worker-client'
 * const hash = await hashWorkerClient.compute(file, p => console.log(p))
 * ```
 */
class HashWorkerClient {
  private worker: Worker | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  /**
   * 计算 file 的整文件 MD5
   *
   * @param file - 待算 hash 的浏览器 File 对象
   * @param onProgress - 进度回调（0..1）
   * @returns 32 位 hex MD5 字符串
   */
  compute(file: File, onProgress?: (p: number) => void): Promise<string> {
    // 串行：等前一个任务做完再开始
    const next = this.queue.then(() => this.runOne(file, onProgress));
    this.queue = next.catch(() => undefined); // 失败也让队列继续
    return next;
  }

  private runOne(file: File, onProgress?: (p: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const worker = this.getWorker();

      const handler = (ev: MessageEvent<{ type: string; value?: number; hash?: string; message?: string }>) => {
        const msg = ev.data;
        if (msg.type === "progress" && typeof msg.value === "number") {
          onProgress?.(msg.value);
        } else if (msg.type === "done" && typeof msg.hash === "string") {
          worker.removeEventListener("message", handler);
          resolve(msg.hash);
        } else if (msg.type === "error") {
          worker.removeEventListener("message", handler);
          reject(new Error(msg.message ?? "hash worker error"));
        }
      };

      worker.addEventListener("message", handler);
      worker.postMessage({ file });
    });
  }

  private getWorker(): Worker {
    if (!this.worker) {
      // Next.js 16 + Turbopack 原生识别这种构造方式；无需额外打包配置
      this.worker = new Worker(new URL("@/workers/hash.worker.ts", import.meta.url), {
        type: "module",
      });
    }
    return this.worker;
  }
}

/**
 * 全局单例
 */
export const hashWorkerClient = new HashWorkerClient();
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/hash-worker-client.ts
git commit -m "feat(next-upload): 添加主线程 HashWorkerClient（懒创建 + 串行队列）"
```

---

## Phase F — 客户端 API client + Store + Pipeline

### Task F1: lib/upload/api.ts

**Files:**
- Create: `packages/next-upload/lib/upload/api.ts`

- [ ] **Step 1: 写 API client**

```ts
/**
 * ============================================================================
 * 上传 API client — next-upload
 * ============================================================================
 *
 * 封装三个上传端点的 fetch 调用。所有调用都接 AbortSignal，
 * 把 AbortError 透明传出（pipeline 据此分辨"用户暂停"与"网络错误"）。
 *
 * 端点：
 * - POST /api/upload/check
 * - POST /api/upload/chunk (multipart)
 * - POST /api/upload/merge
 *
 * @module lib/upload/api
 */

"use client";

import type {
  CheckRequest,
  CheckResponse,
  ChunkResponse,
  MergeRequest,
  MergeResponse,
} from "@/types/upload";
import { HttpError } from "@/types/upload";

interface FetchOpts {
  signal?: AbortSignal;
}

/**
 * 统一的错误检查：把 非 2xx 转成 HttpError（带 status），
 * pipeline.uploadWithRetry 据此区分 4xx（不重试）与 5xx（重试）
 */
async function ensureOk(res: Response): Promise<void> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new HttpError(res.status, msg);
  }
}

/* =================================================================
 * /api/upload/check
 * ================================================================ */

/**
 * 调 check 端点，判秒传 / 续传 / 全新
 *
 * @example
 * const r = await apiCheck({ fileHash, fileName, fileSize, chunkSize, totalChunks }, { signal })
 * if (r.status === 'completed') { ... }
 */
export async function apiCheck(body: CheckRequest, opts: FetchOpts = {}): Promise<CheckResponse> {
  const res = await fetch("/api/upload/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}

/* =================================================================
 * /api/upload/chunk
 * ================================================================ */

interface UploadChunkArgs {
  fileHash: string;
  index: number;
  chunk: Blob;
}

/**
 * 上传单个分片
 */
export async function apiUploadChunk(args: UploadChunkArgs, opts: FetchOpts = {}): Promise<ChunkResponse> {
  const form = new FormData();
  form.set("fileHash", args.fileHash);
  form.set("index", String(args.index));
  form.set("chunk", args.chunk);
  const res = await fetch("/api/upload/chunk", {
    method: "POST",
    body: form,
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}

/* =================================================================
 * /api/upload/merge
 * ================================================================ */

/**
 * 触发服务端合并
 */
export async function apiMerge(body: MergeRequest, opts: FetchOpts = {}): Promise<MergeResponse> {
  const res = await fetch("/api/upload/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/api.ts
git commit -m "feat(next-upload): 添加上传 API client（check/chunk/merge）"
```

---

### Task F2: lib/upload/store.ts — Zustand 全局 store

**Files:**
- Create: `packages/next-upload/lib/upload/store.ts`

- [ ] **Step 1: 写 store**

```ts
/**
 * ============================================================================
 * Zustand Store — next-upload
 * ============================================================================
 *
 * 全局上传管理器。详见 spec §6.2。
 *
 * 状态机（spec §6.1）：
 *
 *        addFiles(File[])
 *               ↓
 *        ┌─────────────┐
 *        │   hashing   │── worker error ──┐
 *        └─────────────┘                  │
 *               ↓ hash ok                 │
 *        ┌─────────────┐                  │
 *        │  checking   │── api error ─────┤
 *        └─────────────┘                  │
 *         │           │                   │
 *         │ completed │ partial / new     │
 *         ↓           ↓                   │
 *    ┌─────────┐  ┌─────────────┐  pause  │
 *    │ instant │  │  uploading  │ ◄──────►│  ┌─────────┐
 *    └─────────┘  └─────────────┘  resume │  │ paused  │
 *                        │                │  └─────────┘
 *                        │ all uploaded   │
 *                        ↓                │
 *                 ┌─────────────┐         │
 *                 │   merging   │─────────┤
 *                 └─────────────┘         │
 *                        │ ok             ↓
 *                 ┌─────────────┐  ┌────────────┐
 *                 │  completed  │  │   failed   │←── retryTask() ──┐
 *                 └─────────────┘  └────────────┘                  │
 *                                        └──────────────────────────┘ (→ checking)
 *
 * 调度规则：
 * - 用户动作（addFiles/resumeTask/retryTask）后，由调用方（UI）自行调用 runTask(id)
 *   以避免 store ↔ pipeline 循环依赖。
 * - removeTask 不调用任何 pipeline 函数；它只是 abort + 从 Map 删除。
 *
 * @module lib/upload/store
 */

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

import type { TaskStatus, UploadTask } from "@/types/upload";
import { CHUNK_SIZE, DEFAULT_CONCURRENCY } from "./constants";

interface UploadStore {
  /** 全部任务，key = task.id */
  tasks: Map<string, UploadTask>;
  /** 全局并发分片数（UI Slider 调） */
  concurrency: number;

  // 用户动作 -----------------------------------------------------
  /**
   * 添加文件，生成对应任务对象，初始状态 'hashing'
   * @returns 新创建任务的 id 列表（调用方应对每个 id 调 runTask 启动 pipeline）
   */
  addFiles: (files: File[], now: number) => string[];
  /** 暂停（abort in-flight；状态转 'paused'） */
  pauseTask: (id: string) => void;
  /** 恢复（重置 AbortController；状态转 'checking'；调用方应紧接调 runTask） */
  resumeTask: (id: string) => void;
  /** 失败 → 重试（等同 resume，仅入口状态不同） */
  retryTask: (id: string) => void;
  /** 移除（abort + 从 Map 删除；不清服务端 chunks） */
  removeTask: (id: string) => void;
  /** 调整并发数 */
  setConcurrency: (n: number) => void;

  // 内部 dispatch（pipeline 调用，命名前缀 _） ------------------
  _setHash: (id: string, hash: string) => void;
  _setHashProgress: (id: string, p: number) => void;
  _setStatus: (id: string, status: TaskStatus, error?: string | null) => void;
  _markUploaded: (id: string, index: number) => void;
  _addInflight: (id: string, index: number) => void;
  _removeInflight: (id: string, index: number) => void;
  _setMerged: (id: string, url: string, completedAt: number) => void;
}

/* =================================================================
 * Helpers
 * ================================================================ */

/**
 * 不可变更新单个 task；返回新 Map 触发 Zustand 订阅刷新
 */
function patchTask(
  tasks: Map<string, UploadTask>,
  id: string,
  patch: (t: UploadTask) => UploadTask | void,
): Map<string, UploadTask> {
  const t = tasks.get(id);
  if (!t) return tasks;
  const draft = { ...t };
  const out = patch(draft) ?? draft;
  const next = new Map(tasks);
  next.set(id, out);
  return next;
}

function buildTask(file: File, now: number): UploadTask {
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  return {
    id: nanoid(),
    file,
    fileName: file.name,
    fileSize: file.size,
    fileHash: null,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    uploadedIndices: new Set<number>(),
    inflightIndices: new Set<number>(),
    status: "hashing",
    error: null,
    hashProgress: 0,
    uploadProgress: 0,
    createdAt: now,
    completedAt: null,
    url: null,
    abortController: new AbortController(),
  };
}

/* =================================================================
 * Store
 * ================================================================ */

export const useUploadStore = create<UploadStore>((set, _get) => ({
  tasks: new Map(),
  concurrency: DEFAULT_CONCURRENCY,

  addFiles: (files, now) => {
    const ids: string[] = [];
    set((state) => {
      const next = new Map(state.tasks);
      for (const f of files) {
        const task = buildTask(f, now);
        next.set(task.id, task);
        ids.push(task.id);
      }
      return { tasks: next };
    });
    return ids;
  },

  pauseTask: (id) =>
    set((state) => {
      const t = state.tasks.get(id);
      if (!t) return state;
      // 仅在可暂停状态生效
      const pausable: TaskStatus[] = ["hashing", "checking", "uploading", "merging"];
      if (!pausable.includes(t.status)) return state;
      t.abortController.abort();
      return {
        tasks: patchTask(state.tasks, id, (d) => {
          d.status = "paused";
          d.inflightIndices = new Set();
        }),
      };
    }),

  resumeTask: (id) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.abortController = new AbortController();
        d.status = "checking";
        d.error = null;
        d.inflightIndices = new Set();
      }),
    })),

  retryTask: (id) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.abortController = new AbortController();
        d.status = "checking";
        d.error = null;
        d.inflightIndices = new Set();
      }),
    })),

  removeTask: (id) =>
    set((state) => {
      const t = state.tasks.get(id);
      t?.abortController.abort();
      const next = new Map(state.tasks);
      next.delete(id);
      return { tasks: next };
    }),

  setConcurrency: (n) => set({ concurrency: Math.max(1, Math.min(8, n)) }),

  /* ---- 内部 dispatch（仅供 pipeline 使用） ---------------------- */

  _setHash: (id, hash) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.fileHash = hash;
        d.hashProgress = 1;
      }),
    })),

  _setHashProgress: (id, p) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.hashProgress = p;
      }),
    })),

  _setStatus: (id, status, error = null) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.status = status;
        d.error = error;
      }),
    })),

  _markUploaded: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const up = new Set(d.uploadedIndices);
        up.add(index);
        const inflight = new Set(d.inflightIndices);
        inflight.delete(index);
        d.uploadedIndices = up;
        d.inflightIndices = inflight;
        d.uploadProgress = up.size / d.totalChunks;
      }),
    })),

  _addInflight: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const next = new Set(d.inflightIndices);
        next.add(index);
        d.inflightIndices = next;
      }),
    })),

  _removeInflight: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const next = new Set(d.inflightIndices);
        next.delete(index);
        d.inflightIndices = next;
      }),
    })),

  _setMerged: (id, url, completedAt) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.url = url;
        d.completedAt = completedAt;
      }),
    })),
}));

/* =================================================================
 * 派生 selector（供 UI 使用）
 * ================================================================ */

/**
 * 活跃任务数（hashing/checking/uploading/merging 之和）
 */
export const selectActiveCount = (s: UploadStore): number => {
  let c = 0;
  for (const t of s.tasks.values()) {
    if (t.status === "hashing" || t.status === "checking" || t.status === "uploading" || t.status === "merging") c++;
  }
  return c;
};

/**
 * 按状态分桶（用于 Tabs 计数）
 */
export const selectBuckets = (s: UploadStore) => {
  const all = [...s.tasks.values()].sort((a, b) => b.createdAt - a.createdAt);
  const uploading = all.filter(
    (t) => t.status === "hashing" || t.status === "checking" || t.status === "uploading" || t.status === "merging" || t.status === "paused",
  );
  const completed = all.filter((t) => t.status === "completed" || t.status === "instant");
  const failed = all.filter((t) => t.status === "failed");
  return { all, uploading, completed, failed };
};
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/store.ts
git commit -m "feat(next-upload): Zustand 全局上传管理 store（8 状态 + 派生 selector）"
```

---

### Task F3: lib/upload/pipeline.ts — 调度器

**Files:**
- Create: `packages/next-upload/lib/upload/pipeline.ts`

- [ ] **Step 1: 写 pipeline**

```ts
/**
 * ============================================================================
 * Pipeline — per-task 上传调度器
 * ============================================================================
 *
 * 状态机（与 store.ts 顶部注释同一份图）：
 *
 *   hashing → checking → (uploading → merging → completed) | instant
 *                              ↓
 *                       paused (pause) / failed (max retry exhausted)
 *
 * 重试规则（spec §6.5）：
 * - 仅在网络错误 / 5xx 上重试；4xx 与 AbortError 立刻终止
 * - 退避序列：1s → 2s → 4s（exponential，base = RETRY_BASE_MS）
 * - 单分片超过 MAX_RETRY 次重试 → 整任务转 failed
 *
 * 调用规约：
 * - addFiles 后，UI 对每个新建 id 调 runTask(id)
 * - resumeTask / retryTask 后，UI 也调 runTask(id)（store 已重置 AbortController）
 *
 * @module lib/upload/pipeline
 */

"use client";

import { apiCheck, apiUploadChunk, apiMerge } from "./api";
import { useUploadStore } from "./store";
import { MAX_RETRY, RETRY_BASE_MS } from "./constants";
import { hashWorkerClient } from "./hash-worker-client";
import { HttpError } from "@/types/upload";

/**
 * runTask — 启动 / 续跑某个 task 的 pipeline
 *
 * 幂等性：被同一个 id 重复调用是安全的，
 * 因为 store.resumeTask / retryTask 已把状态重置到 'checking' 并换了 AbortController。
 *
 * @param taskId 任务 id
 */
export async function runTask(taskId: string): Promise<void> {
  const store = useUploadStore.getState();
  const task = store.tasks.get(taskId);
  if (!task) return;

  const signal = task.abortController.signal;

  try {
    /* ---- Phase 1: Hash（如果尚未算过） ---- */
    let hash = task.fileHash;
    if (!hash) {
      store._setStatus(taskId, "hashing");
      hash = await hashWorkerClient.compute(task.file, (p) => {
        store._setHashProgress(taskId, p);
      });
      store._setHash(taskId, hash);
    }
    if (signal.aborted) return;

    /* ---- Phase 2: Check ---- */
    store._setStatus(taskId, "checking");
    const check = await apiCheck(
      {
        fileHash: hash,
        fileName: task.fileName,
        fileSize: task.fileSize,
        chunkSize: task.chunkSize,
        totalChunks: task.totalChunks,
      },
      { signal },
    );

    if (check.status === "completed") {
      store._setMerged(taskId, check.url, Date.now());
      store._setStatus(taskId, "instant");
      return;
    }

    const uploaded = check.status === "partial" ? new Set(check.uploaded) : new Set<number>();
    // 写回 uploadedIndices（resume 时跳过）
    for (const idx of uploaded) {
      store._markUploaded(taskId, idx);
    }

    /* ---- Phase 3: 并发上传剩余分片 ---- */
    store._setStatus(taskId, "uploading");
    const todo: number[] = [];
    for (let i = 0; i < task.totalChunks; i++) {
      if (!uploaded.has(i)) todo.push(i);
    }
    await runChunkPool(taskId, todo, signal);
    if (signal.aborted) return;

    /* ---- Phase 4: 合并 ---- */
    store._setStatus(taskId, "merging");
    const merge = await apiMerge(
      { fileHash: hash, fileName: task.fileName, totalChunks: task.totalChunks },
      { signal },
    );
    store._setMerged(taskId, merge.url, merge.mergedAt);
    store._setStatus(taskId, "completed");
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      // 暂停 / 移除引发；store 状态已被对应 action 设置好
      return;
    }
    store._setStatus(taskId, "failed", (e as Error).message);
  }
}

/* =================================================================
 * 内部辅助
 * ================================================================ */

/**
 * runChunkPool — 维持 `concurrency` 个并发上传 worker，喂队列
 *
 * 单一 worker 失败（throw）会让整个 Promise.all 失败，pipeline 据此把任务转 failed。
 */
async function runChunkPool(taskId: string, todo: number[], signal: AbortSignal): Promise<void> {
  const queue = [...todo];
  const store = useUploadStore.getState();
  const concurrency = store.concurrency;

  const workers = Array.from({ length: Math.max(1, Math.min(queue.length, concurrency)) }, async () => {
    while (queue.length > 0 && !signal.aborted) {
      const index = queue.shift();
      if (index === undefined) return;
      try {
        await uploadWithRetry(taskId, index, signal);
        useUploadStore.getState()._markUploaded(taskId, index);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        throw err;
      }
    }
  });
  await Promise.all(workers);
}

/**
 * uploadWithRetry — 单分片带指数退避重试
 *
 * 不重试：AbortError / 4xx
 * 重试：网络错误 / 5xx
 * 序列：1s → 2s → 4s
 */
async function uploadWithRetry(taskId: string, index: number, signal: AbortSignal): Promise<void> {
  const store = useUploadStore.getState();
  const task = store.tasks.get(taskId)!;
  const start = index * task.chunkSize;
  const end = Math.min(start + task.chunkSize, task.fileSize);
  const blob = task.file.slice(start, end);

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    try {
      useUploadStore.getState()._addInflight(taskId, index);
      await apiUploadChunk({ fileHash: task.fileHash!, index, chunk: blob }, { signal });
      return;
    } catch (err) {
      useUploadStore.getState()._removeInflight(taskId, index);
      if ((err as Error).name === "AbortError") throw err;
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) throw err;
      if (attempt === MAX_RETRY) throw err;
      await sleep(RETRY_BASE_MS * 2 ** attempt, signal);
    }
  }
}

/**
 * 可中断的 sleep
 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/lib/upload/pipeline.ts
git commit -m "feat(next-upload): per-task 上传调度器（hash → check → 并发 chunk → merge + 指数退避重试）"
```

---

## Phase G — UI 组件

### Task G1: UploadDropzone.tsx

**Files:**
- Create: `packages/next-upload/components/UploadDropzone.tsx`

- [ ] **Step 1: 写 dropzone**

```tsx
/**
 * ============================================================================
 * UploadDropzone — 拖拽 + 点击选文件
 * ============================================================================
 *
 * 职责：
 * - 接收用户拖拽 / 选择的多文件
 * - 调用 addFiles + runTask 启动 pipeline
 * - 高亮 dragover 视觉反馈（用 Tailwind class 切换）
 *
 * 实现要点：
 * - 用原生 HTML5 DnD API（dragenter / dragover / dragleave / drop），不引外部库
 * - dragenter / dragleave 用计数器规避子元素引起的抖动
 *
 * @module components/UploadDropzone
 */
"use client";

import { useRef, useState, useCallback } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/lib/upload/store";
import { runTask } from "@/lib/upload/pipeline";

export default function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const [hovering, setHovering] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const ids = useUploadStore.getState().addFiles(list, Date.now());
    ids.forEach((id) => void runTask(id));
  }, []);

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current === 1) setHovering(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) setHovering(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setHovering(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-all",
        hovering
          ? "border-primary-500 bg-primary-500/5 scale-[1.01]"
          : "border-border bg-muted/30 hover:bg-muted/50",
      )}
    >
      <UploadIcon className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm">
          <span className="font-medium">拖拽文件到此处</span>，或
        </p>
        <Button
          variant="link"
          className="mt-1 h-auto p-0 text-primary-600 dark:text-primary-400"
          onClick={() => inputRef.current?.click()}
        >
          点击选择文件
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">支持多文件 · 单文件无大小限制</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/components/UploadDropzone.tsx
git commit -m "feat(next-upload): UploadDropzone 拖拽 + 点选 + dragenter 计数器"
```

---

### Task G2: ConcurrencyControl.tsx

**Files:**
- Create: `packages/next-upload/components/ConcurrencyControl.tsx`

- [ ] **Step 1: 写并发滑动条**

```tsx
/**
 * ============================================================================
 * ConcurrencyControl — 全局并发数滑动条
 * ============================================================================
 *
 * 调整 store 的 concurrency 字段。生效范围：所有 *新启动的* 分片调度器；
 * 已经在跑的 worker 数量不会动态变化（pipeline.runChunkPool 在启动时读快照）。
 * 调整对下一次 resume / retry 立即生效。
 *
 * @module components/ConcurrencyControl
 */
"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useUploadStore } from "@/lib/upload/store";
import { CONCURRENCY_MIN, CONCURRENCY_MAX } from "@/lib/upload/constants";

export default function ConcurrencyControl() {
  const concurrency = useUploadStore((s) => s.concurrency);
  const setConcurrency = useUploadStore((s) => s.setConcurrency);

  return (
    <div className="flex items-center gap-4">
      <Label htmlFor="concurrency-slider" className="whitespace-nowrap text-sm">
        并发数
      </Label>
      <Slider
        id="concurrency-slider"
        min={CONCURRENCY_MIN}
        max={CONCURRENCY_MAX}
        step={1}
        value={[concurrency]}
        onValueChange={(v) => setConcurrency(v[0] ?? concurrency)}
        className="w-64"
      />
      <span className="w-8 text-right font-mono text-sm tabular-nums">{concurrency}</span>
      <span className="text-xs text-muted-foreground">
        ({CONCURRENCY_MIN}–{CONCURRENCY_MAX})
      </span>
    </div>
  );
}
```

> 注意：此组件依赖 shadcn `label` 组件，但 Task B2 的 12 个列表里没有 label。需要补装：

```bash
pnpm -C packages/next-upload dlx shadcn@latest add label -y
```

把这条命令加到 Step 1 之前。

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/components/ConcurrencyControl.tsx packages/next-upload/components/ui/label.tsx packages/next-upload/package.json pnpm-lock.yaml
git commit -m "feat(next-upload): ConcurrencyControl 全局并发数滑动条（含 shadcn label）"
```

---

### Task G3: TaskCard.tsx

**Files:**
- Create: `packages/next-upload/components/TaskCard.tsx`

- [ ] **Step 1: 写任务卡片**

```tsx
/**
 * ============================================================================
 * TaskCard — 单个上传任务卡片
 * ============================================================================
 *
 * 展示：
 * - 文件名 + 大小
 * - 状态徽章（来自 status-style.ts）
 * - 进度信息：x/y chunks · z inflight
 * - 进度条（hashing 阶段显示 hashProgress；其余显示 uploadProgress）
 * - fileHash（计算完成后才有）
 * - 操作菜单（DropdownMenu）：暂停/恢复/重试/删除/复制下载链接
 * - 完成态显示"下载"按钮
 *
 * @module components/TaskCard
 */
"use client";

import { useState } from "react";
import { FileIcon, MoreVertical, Pause, Play, RotateCcw, Trash2, Download, Copy, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

import type { UploadTask } from "@/types/upload";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/lib/upload/store";
import { runTask } from "@/lib/upload/pipeline";
import { statusStyle } from "@/lib/upload/status-style";

interface TaskCardProps {
  task: UploadTask;
}

export default function TaskCard({ task }: TaskCardProps) {
  const pauseTask = useUploadStore((s) => s.pauseTask);
  const resumeTask = useUploadStore((s) => s.resumeTask);
  const retryTask = useUploadStore((s) => s.retryTask);
  const removeTask = useUploadStore((s) => s.removeTask);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const s = statusStyle(task.status);
  const isUploading = task.status === "uploading";
  const isHashing = task.status === "hashing";
  const isPaused = task.status === "paused";
  const isFailed = task.status === "failed";
  const isDone = task.status === "completed" || task.status === "instant";

  const progress = isHashing ? task.hashProgress : task.uploadProgress;
  const progressPct = Math.round(progress * 100);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTask(task.id);
      void runTask(task.id);
    } else {
      pauseTask(task.id);
    }
  };
  const handleRetry = () => {
    retryTask(task.id);
    void runTask(task.id);
  };
  const handleRemove = () => {
    // 已完成的任务直接删；进行中需二次确认
    if (isDone || isFailed) {
      removeTask(task.id);
    } else {
      setConfirmOpen(true);
    }
  };
  const confirmRemove = () => {
    removeTask(task.id);
    setConfirmOpen(false);
  };
  const copyUrl = () => {
    if (!task.url) return;
    void navigator.clipboard.writeText(window.location.origin + task.url);
    toast.success("下载链接已复制");
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <FileIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          {/* 顶行：文件名 + badge + 操作菜单 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium">{task.fileName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={s.variant} className={cn("font-normal", s.className)}>
                {s.spinning && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
                {s.label}
              </Badge>
              <TaskMenu
                task={task}
                onPauseResume={handlePauseResume}
                onRetry={handleRetry}
                onRemove={handleRemove}
                onCopyUrl={copyUrl}
              />
            </div>
          </div>

          {/* 元信息行 */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(task.fileSize)}</span>
            {(isUploading || isPaused) && (
              <>
                <span>·</span>
                <span>
                  {task.uploadedIndices.size}/{task.totalChunks} chunks
                </span>
                {task.inflightIndices.size > 0 && (
                  <>
                    <span>·</span>
                    <span>{task.inflightIndices.size} inflight</span>
                  </>
                )}
              </>
            )}
            {isDone && task.completedAt && (
              <>
                <span>·</span>
                <span>{formatDuration(task.completedAt - task.createdAt)}</span>
              </>
            )}
          </div>

          {/* 进度条 */}
          {!isDone && !isFailed && (
            <div className="mt-3 flex items-center gap-2">
              <Progress value={progressPct} className="h-2 flex-1" />
              <span className="w-12 text-right font-mono text-xs tabular-nums">{progressPct}%</span>
            </div>
          )}

          {/* hash 显示 */}
          {task.fileHash && (
            <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
              MD5: {task.fileHash}
            </p>
          )}

          {/* 错误信息 */}
          {isFailed && task.error && (
            <p className="mt-2 text-xs text-destructive">{task.error}</p>
          )}

          {/* 完成态：下载按钮 */}
          {isDone && task.url && (
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <a href={task.url} download={task.fileName}>
                  <Download className="mr-1 h-4 w-4" />
                  下载
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除上传任务?</AlertDialogTitle>
            <AlertDialogDescription>
              「{task.fileName}」正在上传中。删除将中断上传，但服务端已上传的分片会保留——下次再传同一文件可秒传/续传。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* =================================================================
 * 操作菜单（抽出来便于阅读）
 * ================================================================ */

interface TaskMenuProps {
  task: UploadTask;
  onPauseResume: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onCopyUrl: () => void;
}

function TaskMenu({ task, onPauseResume, onRetry, onRemove, onCopyUrl }: TaskMenuProps) {
  const isPaused = task.status === "paused";
  const isFailed = task.status === "failed";
  const isDone = task.status === "completed" || task.status === "instant";
  const isPausable = task.status === "hashing" || task.status === "checking" || task.status === "uploading" || task.status === "merging";

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>操作</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {isPausable && (
            <DropdownMenuItem onClick={onPauseResume}>
              <Pause className="mr-2 h-4 w-4" /> 暂停
            </DropdownMenuItem>
          )}
          {isPaused && (
            <DropdownMenuItem onClick={onPauseResume}>
              <Play className="mr-2 h-4 w-4" /> 恢复
            </DropdownMenuItem>
          )}
          {isFailed && (
            <DropdownMenuItem onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" /> 重试
            </DropdownMenuItem>
          )}
          {isDone && task.url && (
            <DropdownMenuItem onClick={onCopyUrl}>
              <Copy className="mr-2 h-4 w-4" /> 复制下载链接
            </DropdownMenuItem>
          )}
          {(isPausable || isPaused || isFailed || isDone) && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> 删除任务
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

/* =================================================================
 * 格式化工具
 * ================================================================ */

function formatBytes(n: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `完成于 ${s}s`;
  const m = Math.floor(s / 60);
  return `完成于 ${m}m${s % 60}s`;
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/components/TaskCard.tsx
git commit -m "feat(next-upload): TaskCard 单任务卡片（进度 + 状态徽章 + 操作菜单 + 删除确认）"
```

---

### Task G4: TaskList.tsx

**Files:**
- Create: `packages/next-upload/components/TaskList.tsx`

- [ ] **Step 1: 写任务列表**

```tsx
/**
 * ============================================================================
 * TaskList — 任务列表（Tabs 分组）
 * ============================================================================
 *
 * 按 status 分桶：
 * - 全部
 * - 上传中（含 paused）
 * - 已完成（含 instant）
 * - 失败
 *
 * 每桶显示对应的 TaskCard 列表；空时显示占位文案。
 *
 * @module components/TaskList
 */
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadStore, selectBuckets } from "@/lib/upload/store";
import TaskCard from "./TaskCard";

export default function TaskList() {
  const buckets = useUploadStore(selectBuckets);
  const { all, uploading, completed, failed } = buckets;

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        暂无任务。把文件拖到上方区域即可开始上传。
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">全部 {all.length}</TabsTrigger>
        <TabsTrigger value="uploading">上传中 {uploading.length}</TabsTrigger>
        <TabsTrigger value="completed">已完成 {completed.length}</TabsTrigger>
        <TabsTrigger value="failed">失败 {failed.length}</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4 flex flex-col gap-3">
        {all.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </TabsContent>
      <TabsContent value="uploading" className="mt-4 flex flex-col gap-3">
        {uploading.length === 0 ? (
          <EmptyHint text="目前没有上传中的任务" />
        ) : (
          uploading.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
      <TabsContent value="completed" className="mt-4 flex flex-col gap-3">
        {completed.length === 0 ? (
          <EmptyHint text="还没有完成的任务" />
        ) : (
          completed.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
      <TabsContent value="failed" className="mt-4 flex flex-col gap-3">
        {failed.length === 0 ? (
          <EmptyHint text="没有失败的任务" />
        ) : (
          failed.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}
```

- [ ] **Step 2: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/components/TaskList.tsx
git commit -m "feat(next-upload): TaskList Tabs 分组展示任务列表"
```

---

## Phase H — Layout + 主页 + about 页

### Task H1: 替换 app/layout.tsx（接入 ThemeProvider + Toaster + Header）

**Files:**
- Modify: `packages/next-upload/app/layout.tsx`

- [ ] **Step 1: 完整替换 `app/layout.tsx`**

```tsx
/**
 * ============================================================================
 * Root Layout — next-upload (final)
 * ============================================================================
 *
 * 完整版根布局：
 * - FOUC 防闪烁脚本（在 React hydrate 前先把 theme class 套上 <html>）
 * - ThemeProvider 包裹整树
 * - 全局 Header（含主题切换 + active badge）
 * - Sonner Toaster 全局通知
 *
 * @module app/layout
 */
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: {
    default: "next-upload — 大文件分片上传 Demo",
    template: "%s | next-upload",
  },
  description: "演示 Next.js 16 Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui 的大文件分片上传 e2e 闭环。",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "next-upload",
    title: "next-upload — 大文件分片上传 Demo",
    description: "演示 Next.js 16 Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui 的大文件分片上传 e2e 闭环。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {/* FOUC 防闪烁：在 hydrate 前同步应用 theme class */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var e=t||(p?'dark':'light');document.documentElement.classList.add(e)})()`,
          }}
        />
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 修改 `components/Header.tsx` 接入真实 activeCount**

把 `Header.tsx` 中：

```tsx
  // TODO(F-phase): 替换为 useUploadStore((s) => 活跃任务数)
  const activeCount = 0;
```

替换为：

```tsx
  // 从 store 读活跃任务数（hashing/checking/uploading/merging）
  const activeCount = useUploadStore(selectActiveCount);
```

并在文件顶部 import 处补：

```tsx
import { useUploadStore, selectActiveCount } from "@/lib/upload/store";
```

- [ ] **Step 3: 验证 type-check**

```bash
pnpm -C packages/next-upload type-check
```

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/layout.tsx packages/next-upload/components/Header.tsx
git commit -m "feat(next-upload): layout 接入 ThemeProvider/Toaster/Header；Header 接入真实 activeCount"
```

---

### Task H2: 写主页 app/page.tsx

**Files:**
- Modify: `packages/next-upload/app/page.tsx`

- [ ] **Step 1: 替换主页**

```tsx
/**
 * ============================================================================
 * 主页 — next-upload
 * ============================================================================
 *
 * 布局：
 * - 标题 + 简介
 * - UploadDropzone
 * - ConcurrencyControl
 * - TaskList（Tabs）
 *
 * 注意：主页是 Server Component，但所有子组件都是 client（"use client"）；
 * 这是符合 App Router 范式的——server 仅负责输出静态 HTML，交互在 client 接管。
 *
 * @module app/page
 */

import UploadDropzone from "@/components/UploadDropzone";
import ConcurrencyControl from "@/components/ConcurrencyControl";
import TaskList from "@/components/TaskList";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">大文件分片上传</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          演示 Next.js 16 Route Handlers + Web Worker MD5 + Zustand 状态机 + shadcn/ui。
        </p>
      </header>

      <UploadDropzone />

      <ConcurrencyControl />

      <TaskList />
    </div>
  );
}
```

- [ ] **Step 2: 启动 dev 看主页能渲染**

```bash
pnpm dev:upload
```

浏览器开 http://localhost:3001 ——应看到完整 UI（dropzone + slider + 空任务提示）。
Ctrl+C。

- [ ] **Step 3: Commit**

```bash
git add packages/next-upload/app/page.tsx
git commit -m "feat(next-upload): 主页装配 dropzone + 并发 slider + 任务列表"
```

---

### Task H3: app/about/page.tsx

**Files:**
- Create: `packages/next-upload/app/about/page.tsx`

- [ ] **Step 1: 写技术说明页**

```tsx
/**
 * ============================================================================
 * About 页 — next-upload
 * ============================================================================
 *
 * 技术说明页：协议时序、状态机、目录布局、设计取舍。
 * 内容为静态（Server Component），便于搜索引擎索引。
 *
 * @module app/about/page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "next-upload 的协议、状态机与设计取舍说明。",
};

export default function AboutPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl p-4 dark:prose-invert sm:p-6">
      <h1>关于 next-upload</h1>

      <h2>核心能力</h2>
      <ul>
        <li>浏览器内 Blob.slice 切片 + 并发上传 + 服务端流式合并</li>
        <li>Web Worker 增量 MD5（SparkMD5），主线程不卡</li>
        <li>秒传判定（merged 文件存在）+ 断点续传（按目录扫描已上传 index）</li>
        <li>暂停 / 恢复 / 失败重试（指数退避 1s/2s/4s）</li>
        <li>多文件拖拽 + 任务队列</li>
      </ul>

      <h2>服务端协议</h2>
      <table>
        <thead>
          <tr>
            <th>方法 + 路径</th>
            <th>用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>POST /api/upload/check</code>
            </td>
            <td>秒传 / 续传 / 全新三态判定</td>
          </tr>
          <tr>
            <td>
              <code>POST /api/upload/chunk</code>
            </td>
            <td>multipart 上传单分片（原子写）</td>
          </tr>
          <tr>
            <td>
              <code>POST /api/upload/merge</code>
            </td>
            <td>流式合并所有分片</td>
          </tr>
          <tr>
            <td>
              <code>GET /api/files/[hash]</code>
            </td>
            <td>流式下载合并产物</td>
          </tr>
        </tbody>
      </table>

      <h2>客户端状态机（8 状态）</h2>
      <pre>
{`hashing → checking ─┬─ instant
                    └─ uploading ⇄ paused
                                    │
                                    ↓
                                  merging → completed
                                    │
                                    └─ failed → (retry) → checking`}
      </pre>

      <h2>目录布局</h2>
      <pre>
{`.uploads/
├── chunks/<fileHash>/<index>.part        # 上传中
├── merged/<fileHash>.bin                 # 合并完成
└── merged/<fileHash>.name                # 原文件名`}
      </pre>

      <h2>已知边界</h2>
      <ul>
        <li>任务列表 <strong>不持久化</strong>——刷新即丢；但服务端 FS 状态保留</li>
        <li>单实例 server，未引入文件锁</li>
        <li>无清理机制（孤儿 chunks 不会自动 GC）</li>
        <li>无鉴权（任何人持 hash 即可下载）</li>
        <li>chunk size 写死 5 MiB（常量里改）；并发数 UI 可调</li>
      </ul>

      <p>完整设计文档：<code>docs/superpowers/specs/2026-06-06-next-upload-design.md</code>。</p>
    </article>
  );
}
```

- [ ] **Step 2: 安装 tailwind typography 插件（用于 prose-* 样式）**

```bash
pnpm -C packages/next-upload add -D @tailwindcss/typography
```

在 `app/globals.css` 顶部 `@import "tailwindcss";` 行**之后**插入：

```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 3: 验证 type-check + 浏览器**

```bash
pnpm -C packages/next-upload type-check
pnpm dev:upload
# 浏览器开 http://localhost:3001/about
```

预期：能看到完整 about 页，prose-* 样式生效（标题、表格、代码块都有合适排版）。
Ctrl+C。

- [ ] **Step 4: Commit**

```bash
git add packages/next-upload/app/about/ packages/next-upload/app/globals.css packages/next-upload/package.json pnpm-lock.yaml
git commit -m "feat(next-upload): About 技术说明页 + @tailwindcss/typography"
```

---

## Phase I — 根仓库集成

### Task I1: 根 README.md 追加 next-upload 条目

**Files:**
- Modify: `README.md` (repo root)

- [ ] **Step 1: 在 Packages 表后追加一行**

打开根 `README.md`，找到 `| Package | 探索方向 · Focus | Port |` 表格，在最后一行 `| next-demo | ... | 3000 |` **下面**追加：

```diff
 | `next-demo` | Next.js 16 全栈实践：App Router、Server Components、ISR、暗色模式 — 验证 AI 在现代全栈框架中的代码生成上限 | 3000 |
+| `next-upload` | Next.js 16 全栈分片上传：Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui — 验证 AI 在"复杂客户端状态机 + 协议设计"题型下的产出 | 3001 |
```

- [ ] **Step 2: 在「AI Coding 亮点」段落追加一句**

找到 `### AI Coding 亮点 · Key Highlights` 小节末尾，追加一个 `-` 项：

```diff
 - **next-demo** 展示了 AI 对 Next.js App Router 范式的理解：Server Components 优先、metadata/Open Graph API、文件系统路由、`prefers-color-scheme` 暗色模式。
+- **next-upload** 演示 Next.js 16 Route Handlers 处理 `multipart/form-data` + Web Worker hash + Zustand 状态机 + shadcn/ui 完整集成，验证 AI 在"复杂客户端状态机 + 协议设计"题型下的产出。
 - 所有 package 的 ESLint、TypeScript、Tailwind CSS、路径别名等工程化配置均由 AI 生成并保持一致。
```

- [ ] **Step 3: 在「开发」代码块追加一行**

找到 `# Next.js 全栈探索` 注释下面：

```diff
 # Next.js 全栈探索
 pnpm dev:next
+pnpm dev:upload     # 大文件分片上传
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs(root): README 追加 next-upload 条目与开发命令"
```

---

### Task I2: packages/next-upload/README.md

**Files:**
- Create: `packages/next-upload/README.md`

- [ ] **Step 1: 写包内 README**

```markdown
# next-upload — 大文件分片上传 Demo

> Next.js 16 + Tailwind CSS 4 + shadcn/ui + Zustand + SparkMD5(Web Worker)
> Port: **3001**

完整设计：[`docs/superpowers/specs/2026-06-06-next-upload-design.md`](../../docs/superpowers/specs/2026-06-06-next-upload-design.md)

## 快速开始

```bash
# 从仓库根目录
pnpm install
pnpm dev:upload         # → http://localhost:3001
```

## 核心能力

- **e2e 分片上传**：浏览器 Blob.slice → 并发上传 → 服务端流式合并
- **秒传 / 续传**：整文件 MD5（Web Worker 增量算）+ 服务端按目录扫描已上传 index
- **暂停 / 恢复 / 重试**：AbortController 全链路；指数退避 1s/2s/4s
- **多文件队列**：拖拽 / 点选；状态机 8 状态
- **流式下载**：合并产物通过 Route Handler 流式响应（不放 `public/`）

## 服务端协议

| 方法 + 路径 | 用途 |
|---|---|
| `POST /api/upload/check` | 秒传 / 续传 / 全新三态判定 |
| `POST /api/upload/chunk` | multipart 上传单分片（原子写） |
| `POST /api/upload/merge` | 流式合并 |
| `GET  /api/files/[hash]` | 流式下载合并产物 |

详见 spec §5。

## 目录布局

```
packages/next-upload/
├── app/                            # Next.js App Router
├── components/                     # React 组件（含 shadcn ui/）
├── data/uploads.ts                 # 服务端 FS 数据访问层
├── lib/upload/                     # 客户端业务逻辑
├── types/upload.ts                 # 共享类型 + 协议 DTO
├── workers/hash.worker.ts          # SparkMD5 Web Worker
└── scripts/make-fixture.mjs        # 生成测试用大文件
```

服务端运行时数据：`packages/next-upload/.uploads/`（已加 .gitignore）。

## 手动验证 V1–V10

详细场景见 spec §9。这里给出最常用 5 条：

```bash
# 生成测试文件
node scripts/make-fixture.mjs 22      # 22 MiB
node scripts/make-fixture.mjs 100     # 100 MiB

# V1: 小文件
# 拖一个 8 KiB 文件 → 应瞬完
echo "tiny" > /tmp/tiny.txt   # 然后浏览器拖 /tmp/tiny.txt

# V2: 多分片
# 拖 fixture/22MB.bin → DevTools Network 看 4 并发

# V3: 秒传
# V2 完成后再次拖 fixture/22MB.bin → 应直接进 instant 状态

# V4: 续传
# 拖 fixture/100MB.bin，传到 ~50% 时刷新页面，再拖同一文件 → 应跳过已传分片

# V5: 暂停/恢复
# 拖 fixture/100MB.bin → 点暂停 → 5s 后恢复
```

## 已知边界

1. 任务列表不持久化（刷新即丢；服务端 FS 状态保留）
2. 单实例 server，未引入文件锁
3. 无清理机制（孤儿 chunks 不会自动 GC）
4. 无鉴权（任何人持 hash 即可下载）
5. chunk size 写死 5 MiB；并发数 UI 可调（1–8）
6. hash worker 单实例，多文件 hash 串行排队

## 脚本

| 脚本 | 用途 |
|---|---|
| `pnpm dev` | dev server 起在 :3001 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 起生产构建 |
| `pnpm lint` / `pnpm fix` | ESLint |
| `pnpm type-check` | tsc --noEmit |
```

- [ ] **Step 2: Commit**

```bash
git add packages/next-upload/README.md
git commit -m "docs(next-upload): 添加包 README（快速开始 + 协议表 + 验证步骤 + 已知边界）"
```

---

### Task I3: 更新 CLAUDE.md / AGENTS.md 添加 next-upload 段落

**Files:**
- Modify: `CLAUDE.md` (also mirrors to `AGENTS.md` — they're identical)

- [ ] **Step 1: 检查现状**

```bash
diff CLAUDE.md AGENTS.md
```

预期：无差异。如有差异，先在主分支统一一下。

- [ ] **Step 2: 在 CLAUDE.md 的"Package Architecture"小节追加 next-upload 段落**

在 `### vite-build — React 19 + Vite Build Optimization` 段落**之后**（紧贴 `## Design Tokens Philosophy` 之前），插入：

```markdown
### next-upload — Next.js 16 全栈分片上传

**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (12 components), Zustand, SparkMD5 (Web Worker)

**Directory conventions:**
- `app/` — App Router pages and Route Handlers
- `app/api/upload/{check,chunk,merge}/route.ts` — three upload endpoints
- `app/api/files/[hash]/route.ts` — streaming download
- `data/uploads.ts` — server-side filesystem data access layer (atomic write + streaming merge)
- `lib/upload/` — client-side upload logic (Zustand store / pipeline / api client / hash worker client / constants / status-style)
- `types/upload.ts` — shared protocol DTOs and state machine types
- `workers/hash.worker.ts` — SparkMD5 incremental hashing in a Web Worker

**Key patterns:**
- Server state model is **convention-based**: filesystem layout `.uploads/chunks/<hash>/<index>.part` + `.uploads/merged/<hash>.bin` IS the upload session state — no manifest, no DB
- Client state is a single Zustand store with 8-state task machine; per-task pipeline (`runTask`) does hash → check → concurrent chunk pool → merge with exponential-backoff retry
- AbortController on each task enables clean pause/resume/cancel — `pauseTask` aborts, `resumeTask` swaps in a new controller and re-runs pipeline from check
- Hash worker is a singleton serializing multi-file hash (avoid memory contention); upload phase remains parallel
- shadcn/ui + Tailwind v4: uses `@custom-variant dark (&:where(.dark, .dark *));` and `tw-animate-css` (the v4 replacement for `tailwindcss-animate`)
- Dark mode shares the next-demo pattern: hand-rolled `ThemeProvider` Context with `.dark` class on `<html>` (no `next-themes`)
```

- [ ] **Step 3: 同步到 AGENTS.md**

```bash
cp CLAUDE.md AGENTS.md
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md AGENTS.md
git commit -m "docs: CLAUDE/AGENTS.md 添加 next-upload package 架构说明"
```

---

## Phase J — V1–V10 手工验收

> 这一节是"完成定义"。Phase A–I 全部跑完后，按下列顺序逐条手工跑通；任一失败需返回对应 phase 修复后再继续。每个 V 不一定要 commit（除非修了 bug），但**全部跑通后必须有一个总结性 commit**。

**前置准备**（一次性）：

```bash
# 1. 启动 dev server（在专用终端常驻）
pnpm dev:upload

# 2. 在另一终端生成 fixture
cd packages/next-upload
node scripts/make-fixture.mjs 22
node scripts/make-fixture.mjs 100
cd ../..
```

---

### Task J1: V1 — 小文件 e2e

- [ ] **Step 1: 浏览器拖一个 < 1 KiB 文件**

```bash
echo "tiny" > /tmp/tiny.txt
# 浏览器打开 http://localhost:3001，拖 /tmp/tiny.txt
```

预期：
- 任务卡瞬间显示 `计算中` → `校验中` → `上传中` → `合并中` → `已完成`
- 进度条到 100%
- MD5 行显示 hash
- 出现"下载"按钮

- [ ] **Step 2: 点下载，确认内容**

```bash
diff <(curl -s http://localhost:3001/api/files/<复制 MD5>) /tmp/tiny.txt
# 应无差异输出
```

- [ ] **结果**：通过 / 不通过（不通过则记录 bug，先修复再继续）

---

### Task J2: V2 — 多分片并发（22 MiB / 5 分片 / 并发 4）

- [ ] **Step 1: 把并发滑动条调到 4（默认）**

- [ ] **Step 2: 浏览器拖 `packages/next-upload/fixture/22MB.bin`**

- [ ] **Step 3: 打开 DevTools → Network → 过滤 chunk**

预期：
- 同一时刻最多 4 个 `chunk` 请求在 pending
- 上传完成后 `merge` 请求触发，状态转完成

- [ ] **Step 4: 下载并比对**

```bash
curl -s -o /tmp/out.bin http://localhost:3001/api/files/<MD5>
md5 /tmp/out.bin packages/next-upload/fixture/22MB.bin
# 两个 hash 应一致
```

- [ ] **结果**：通过 / 不通过

---

### Task J3: V3 — 秒传

- [ ] **Step 1: V2 完成后，再次拖 `22MB.bin`**

预期：
- `计算中`（约 0.5s）→ 直接进入 `⭐ 秒传命中` 状态
- 没有任何 chunk 上传请求（DevTools 确认只有 1 个 check 请求）

- [ ] **结果**：通过 / 不通过

---

### Task J4: V4 — 续传

- [ ] **Step 1: 浏览器拖 `100MB.bin`，等进度到 ~40-60%**

- [ ] **Step 2: 直接刷新页面（F5）**

任务列表会清空（符合"不持久化"设计），但服务端已上传的 chunks 还在。

- [ ] **Step 3: 再次拖同一个 `100MB.bin`**

预期：
- `计算中` → `校验中`（返回 partial 含 uploaded 数组）→ `上传中`，从断点继续
- DevTools 看到 chunk 请求数 = totalChunks - 已上传数

- [ ] **Step 4: 完成后下载，md5 一致**

- [ ] **结果**：通过 / 不通过

---

### Task J5: V5 — 暂停 / 恢复

- [ ] **Step 1: 拖 `100MB.bin`，等进度到 ~30%，点 `⋯ → 暂停`**

- [ ] **Step 2: 检查无半截 .part.tmp**

```bash
find packages/next-upload/.uploads/chunks -name "*.tmp"
# 应无输出（原子写保证）
```

- [ ] **Step 3: 5s 后点 `⋯ → 恢复`，等完成，下载比对**

```bash
md5 /tmp/out.bin packages/next-upload/fixture/100MB.bin
```

- [ ] **结果**：通过 / 不通过

---

### Task J6: V6 — 失败重试（指数退避）

**Goal**: 验证 5xx 自动重试 + MAX_RETRY 耗尽后 failed + 手动重试。

- [ ] **Step 1: 临时修改 `app/api/upload/chunk/route.ts` 模拟 5xx**

在 `writeChunkAtomic(...)` 调用之前**临时**插入：

```ts
// === [V6 临时 mock] ===
if (index % 7 === 3 && Math.random() < 0.6) {
  return NextResponse.json({ error: "simulated 500" }, { status: 500 });
}
// === [end V6 mock] ===
```

- [ ] **Step 2: 重启 dev server**（保存即热重载，但 Route Handler 改动有时需 hard restart）

- [ ] **Step 3: 拖 `22MB.bin`，观察 DevTools**

预期：
- 某些 chunk 失败返回 500
- 自动重试（DevTools 显示同 index 多次请求）
- 多数任务最终成功，**不**进 failed 状态

- [ ] **Step 4: 把 mock 改成 100% 失败（去掉 random）**

```ts
if (index % 7 === 3) {
  return NextResponse.json({ error: "simulated 500" }, { status: 500 });
}
```

重新拖 `22MB.bin`：
- 应在 1 + 2 + 4 = 7s 内尝试 4 次（attempt 0,1,2,3），然后任务转 `失败`
- TaskCard 显示红色 destructive badge 与错误信息

- [ ] **Step 5: 把 mock 删除恢复正常**

- [ ] **Step 6: 点 `⋯ → 重试`，等完成**

- [ ] **结果**：通过 / 不通过

> ⚠️ 验证完务必把临时 mock 删干净，否则后续场景会被污染。

---

### Task J7: V7 — 多文件并行

- [ ] **Step 1: 同时拖 3 个不同文件**（任选 tiny.txt + 22MB + 100MB）

预期：
- 3 个任务卡同时出现
- Hash 阶段串行排队（worker 单例）
- Upload 阶段 3 任务并行
- Tabs 计数正确：上传中 3 → 已完成 3

- [ ] **结果**：通过 / 不通过

---

### Task J8: V8 — 上传中删除（保留服务端 chunks）

- [ ] **Step 1: 拖 `100MB.bin`，传到 ~30%**

- [ ] **Step 2: 点 `⋯ → 删除任务`，确认对话框选「删除」**

预期：
- 卡片从 UI 消失
- 服务端 `chunks/<hash>/` 目录**仍存在**

```bash
ls packages/next-upload/.uploads/chunks/
# 应能看到对应 hash 子目录，里面有若干 .part 文件
```

- [ ] **Step 3: 再次拖同一个 `100MB.bin`，验证续传命中**

预期：check 返回 partial，自动续传剩余分片。

- [ ] **结果**：通过 / 不通过

---

### Task J9: V9 — 暗色模式

- [ ] **Step 1: 点 Header 主题切换按钮**

预期：
- `<html>` class 在 `light` / `dark` 间切换
- 所有 shadcn 组件正确响应（Card 背景色、Badge 配色、Progress 轨道色、Dialog 背景、Dropdown 菜单）
- `@custom-variant dark` 生效（自定义状态徽章的 `dark:text-primary-300` 等切换正常）

- [ ] **Step 2: 刷新页面，确认主题被 localStorage 持久化（不闪烁）**

- [ ] **结果**：通过 / 不通过

---

### Task J10: V10 — 流式下载

- [ ] **Step 1: V2 或 V4 完成后，点下载按钮**

- [ ] **Step 2: DevTools → Network → 点对应请求 → Headers**

预期：
- `Content-Length: <真实字节数>`
- `Content-Disposition: attachment; filename*=UTF-8''<原文件名>`

- [ ] **Step 3: 用 curl 监控**

```bash
curl -s -i -o /tmp/dl.bin --write-out "TIME_TOTAL=%{time_total}\nSIZE=%{size_download}\n" \
  "http://localhost:3001/api/files/<MD5>"
```

如果文件 ≥ 100 MiB，下载耗时应大于 1s（流式传输，不是一次性载入内存返回）。

- [ ] **Step 4: 启动 dev 时 Node 进程 RSS 应远小于文件大小**

```bash
# 在下载过程中查询（macOS）：
ps -o pid,rss,command -ax | grep "next dev" | head -3
# RSS 不应随文件大小线性增长
```

- [ ] **结果**：通过 / 不通过

---

### Task J11: 全部跑通后的总结 commit

- [ ] **Step 1: 清理本地测试产物**

```bash
rm -rf packages/next-upload/.uploads
rm -rf packages/next-upload/fixture
```

- [ ] **Step 2: 跑全量 lint + type-check 收尾**

```bash
pnpm -C packages/next-upload type-check
pnpm -C packages/next-upload lint
pnpm -r build       # 整 monorepo 编译验证
```

预期：全部通过。

- [ ] **Step 3: Commit（如有清理 / 修复）**

```bash
git add -A
git commit -m "test(next-upload): V1–V10 手工验收全部通过" --allow-empty
```

- [ ] **Step 4: 推送 / 开 PR**

```bash
git push -u origin <branch-name>
gh pr create --title "feat(next-upload): 大文件分片上传 demo 包" --body "完整实施 spec 2026-06-06-next-upload-design.md。V1–V10 手工验收已跑通。"
```

---

## 附录 A — 跨任务文件清单

实施完成后，新增 / 修改的全部文件：

### 新增（packages/next-upload/）
```
app/layout.tsx
app/page.tsx
app/globals.css
app/about/page.tsx
app/api/upload/check/route.ts
app/api/upload/chunk/route.ts
app/api/upload/merge/route.ts
app/api/files/[hash]/route.ts
components/ThemeProvider.tsx
components/Header.tsx
components/UploadDropzone.tsx
components/ConcurrencyControl.tsx
components/TaskCard.tsx
components/TaskList.tsx
components/ui/{button,card,progress,badge,alert-dialog,sonner,tabs,dropdown-menu,tooltip,slider,input,separator,label}.tsx
data/uploads.ts
lib/utils.ts
lib/upload/api.ts
lib/upload/constants.ts
lib/upload/hash-worker-client.ts
lib/upload/pipeline.ts
lib/upload/status-style.ts
lib/upload/store.ts
types/upload.ts
workers/hash.worker.ts
scripts/make-fixture.mjs
components.json
next.config.ts
next-env.d.ts
package.json
postcss.config.mjs
eslint.config.mjs
tsconfig.json
.gitignore
README.md
```

### 修改（根目录）
```
package.json          (scripts: dev:upload / build:upload)
.gitignore            (.uploads/ / packages/next-upload/fixture/)
README.md             (Packages 表 + AI Coding 亮点 + dev 段)
CLAUDE.md             (Package Architecture 段追加 next-upload)
AGENTS.md             (与 CLAUDE.md 同步)
```

---

## 附录 B — 任务依赖图

```
A1 → A2 → A3 → A4
         ↓
A3 → B1 → B2
         ↓
B1 + ThemeProvider 模式 → B3

(C 系列各自独立，B3 之后可并行)
B1, C1 → C3

A1 → D1 → D2,D3,D4,D5 (D2-D5 可并行) → D6

(E 独立)
A2 → E1 → E2

C1, C2 → F1
F1, C1, C2, E2 → F2 → F3

B1, F2 → G1, G2
B1, F2, C3 → G3
B1, G3 → G4

B2, B1, F2 → H1 (含 Header.tsx 修改)
G1-G4 → H2
B1 → H3

(I 独立)
I1, I2, I3 可并行

H1-H3 + D + F → J1-J11 (顺序跑)
```

---

## 实施结束

**全部 42 任务、跨 10 个 phase 完成后**：

1. spec §1–§12 全部覆盖（含 V1–V10 验收）
2. `pnpm dev:upload` 起 :3001 完全可用
3. `pnpm -r build` 全 monorepo 编译通过
4. PR / commit 链可追溯

