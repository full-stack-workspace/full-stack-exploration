# AGENTS.md

This file  provides context for AI coding assistants (Cursor, GitHub Copilot, Claude Code, etc.) when working with code in this repository.

## Project Overview

The **full-stack-exploration** is a **pnpm workspace monorepo** for learning and demonstrating Vite, Tailwind CSS, React, Vue, and Next.js. It contains four independent packages with no interdependencies.

## Common Commands

```bash
pnpm install                                          # Install all dependencies
pnpm dev:basic                                        # Vite + Vue 3 (port 5173)
pnpm dev:server                                       # Vite + React 19 + shadcn/ui (port 5174)
pnpm dev:vite-build                                   # Vite + React 19 + Ant Design (port 5175)
pnpm dev:next                                         # Next.js 16 (port 3000)
pnpm dev:playground                                   # Rsbuild + React 19 playground (port 3002)
pnpm build                                            # Build all packages
pnpm type-check                                       # Type-check all packages
```

Within `packages/next-playground`:
```bash
pnpm -C packages/next-playground dev                         # Next.js dev server
pnpm -C packages/next-playground lint                        # ESLint
pnpm -C packages/next-playground fix                         # ESLint --fix
```

## Package Architecture

### next-playground — Next.js 16 工程实践演示站

**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, SWR, clsx + tailwind-merge

**Directory conventions:**
- `config/topics.tsx` — **专题注册表(全站单一数据源)**:顶栏、侧边栏、首页卡片、页面 metadata 全部从 `TOPICS`/`CATEGORIES` 派生;新增专题 = topics/ 内容 + app/ 薄壳 + 注册一行(详见包 README)
- `app/` — App Router **薄壳路由**(只导出 metadata 与渲染约定如 `revalidate`,内容在 `topics/`)与 Route Handler(`app/api/`)
- `topics/<category>/<name>/` — 专题真实内容;category 为 `rendering` / `rsc-boundary` / `router` / `data` / `metadata` / `engineering` / `ai-native` 七类,co-locate 演示组件
- `components/` — 共享组件:`shell/SiteShell`(Client,注册表驱动的顶栏+侧边栏壳层)、`topic/TopicPage`(TopicPage/TopicSection 专题骨架)、`ThemeProvider`
- `middleware.ts` — 包根中间件演示(matcher 只命中 `/engineering/middleware`,加自定义响应头;Next 16 已将约定更名为 proxy,本站保留旧名并在专题页说明)
- `data/` — Static mock data and data access functions (e.g., `getUserById`;`getPosts` 用 React `cache()` 记忆化)
- `types/` — TypeScript interfaces (no runtime code)
- `lib/` — `utils.ts` 的 `cn()`;`topic-meta.ts` 的 `getTopicMetadata()` / `SITE_NAME`

**Key patterns:**
- Pages default to **Server Components**; opt into client with `"use client"` only when using state/effects/browser APIs
- **注册表 ≠ 路由**:App Router 路由由文件系统决定,注册表只驱动导航与元信息;不做 catch-all 查表渲染
- 页面标题用 metadata API:薄壳页 `export const metadata = getTopicMetadata(path)` 读注册表,套根 layout 的 `title.template`;无 react-playground 的 DocumentTitle 机制
- 旧路径(`/blog`、`/user`、`/ai-models`、`/about`)由 `next.config.ts` 的 `redirects()` 301 到新专题路由
- Data fetching uses **SWR** for client-side or direct `fetch` in async Server Components (ISR page with `revalidate = 60`)
- The `cn()` function from `lib/utils.ts` combines `clsx` (conditional classes) + `tailwind-merge` (conflict resolution); always prefer `cn()` over template literals for className
- `@/` path alias maps to the package root (configured in `tsconfig.json` paths)
- Tailwind CSS v4 uses `@theme` in `globals.css` to define design tokens (colors, radii, shadows, animations) — do not use `tailwind.config.js`
- Dark mode: 手写 `ThemeProvider`(class 策略,localStorage → prefers-color-scheme,body 内联脚本防闪烁)
- ESLint uses flat config format (`eslint.config.mjs`) with `eslint-config-next` presets

**API routes** call external services (jsonplaceholder) and return `NextResponse.json()`. They are independent from page data fetching — pages that need the same data call the external API directly to avoid build-time ECONNREFUSED errors.

### vite-basic — Vue 3 + Vite

Vue 3 with `vue-router`, SCSS, and `@vitejs/plugin-vue`. Uses Composables pattern (`src/composables/`) for shared reactive logic. Alias `@` → `src/`.

### vite-server — React 19 + Vite Dev Server

React 19 with `react-router-dom`, Tailwind CSS 4, Jotai state management, and shadcn/ui. Vite config demonstrates dev server proxy (proxies `/api` to `localhost:3000`). Uses `@vitejs/plugin-react-swc` for fast refresh.

### vite-build — React 19 + Vite Build Optimization

React 19 with `react-router-dom`, Tailwind CSS 4, Ant Design 6, Zustand state management, and `vite-bundle-analyzer`. Vite config demonstrates:
- **Manual code splitting** via `rolldownOptions.output.manualChunks` (react, react-dom)
- **Design Tokens system** in `src/styles/tokens.css` — CSS custom properties in three layers: Primitive → Semantic → Component, with `[data-theme="dark"]` overrides

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
- Dark mode shares the next-playground pattern: hand-rolled `ThemeProvider` Context with `.dark` class on `<html>` (no `next-themes`)

## Design Tokens Philosophy

Both `vite-build` and `next-playground` implement design tokens, but differently:
- **vite-build** (`tokens.css`): Pure CSS custom properties with a three-layer architecture (Primitive → Semantic → Component); theme switching via `data-theme` attribute on `<html>`
- **next-playground** (`globals.css`): Tailwind CSS v4 `@theme` directive, which auto-generates utility classes; theme switching via `prefers-color-scheme` media query

## Code Commenting Standards

When generating code, add structured comments following these conventions:

**File-level comments** — Every new file starts with a JSDoc-style block describing the module's purpose, features, and usage scenarios:

```tsx
/**
 * ============================================================================
 * Component Name — 组件/模块名称
 * ============================================================================
 *
 * 描述该模块的核心功能和职责。
 *
 * 功能特点：
 * - 功能点 1
 * - 功能点 2
 *
 * @module path/to/file
 */
```

**Section dividers** — Use `/* ==== ... ==== */` to separate major logical sections within a file:

```tsx
/* =================================================================
 * Section Name
 * ================================================================ */
```

**Function/component JSDoc** — Document parameters, return values, and usage examples with `@param`, `@returns`, `@example` tags. Descriptions are in Chinese.

**Inline comments** — Use `//` for explaining non-obvious logic, `//` with inline descriptions above code blocks for data flow or architectural decisions. Avoid stating what the code literally does — focus on *why*.

## Commit Style

Commits follow conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Scope is typically the package name (e.g., `next-playground`, `vite-basic`)
- Descriptions are in Chinese or English, describing the "why" over the "what"
