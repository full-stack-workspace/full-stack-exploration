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
pnpm dev:upload                                       # Next.js 16 chunked upload (port 3001)
pnpm dev:playround                                    # Rsbuild + React 19 playground (port 3002)
pnpm build                                            # Build all packages
pnpm type-check                                       # Type-check all packages
```

Within `packages/next-demo`:
```bash
pnpm -C packages/next-demo dev                         # Next.js dev server
pnpm -C packages/next-demo lint                        # ESLint
pnpm -C packages/next-demo fix                         # ESLint --fix
```

## Package Architecture

### next-demo — Next.js 16 App Router

**Tech stack:** Next.js 16, React 19, Tailwind CSS 4, SWR, clsx + tailwind-merge

**Directory conventions:**
- `app/` — App Router pages and API routes; each route is a folder with `page.tsx`
- `app/api/` — Route handlers (Next.js API routes)
- `components/` — Shared React components (both server and client components)
- `data/` — Static mock data and data access functions (e.g., `getUserById`)
- `types/` — TypeScript interfaces (no runtime code)
- `lib/` — Utility functions; notably `utils.ts` exports the `cn()` classname helper

**Key patterns:**
- Pages default to **Server Components**; opt into client with `"use client"` only when using state/effects/browser APIs
- Data fetching uses **SWR** for client-side (User detail page) or direct `fetch` in async Server Components (Blog page with ISR `revalidate = 60`)
- The `cn()` function from `lib/utils.ts` combines `clsx` (conditional classes) + `tailwind-merge` (conflict resolution); always prefer `cn()` over template literals for className
- `@/` path alias maps to the package root (configured in `tsconfig.json` paths)
- Tailwind CSS v4 uses `@theme` in `globals.css` to define design tokens (colors, radii, shadows, animations) — do not use `tailwind.config.js`
- Dark mode uses `prefers-color-scheme` media query with CSS custom properties; no JS toggle
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

### react-playround — Rsbuild + React 19 练习场

**Tech stack:** Rsbuild 1 (Rspack), React 19, TypeScript strict, React Relay 19 (GraphQL), Ant Design 6, Tailwind CSS 3 + SCSS, React Router 6, Vitest 2 + React Testing Library

**Directory conventions:**
- `src/config/topics.tsx` — **专题注册表(全站单一数据源)**:路由、顶部导航、侧边栏、首页卡片全部从 `TOPICS` 派生;新增专题 = 新建目录 + 注册一行(详见包 README)
- `src/topics/<category>/<name>/` — 专题演示页;category 为 `basics` / `hooks` / `advanced` / `apps`(综合应用如 todo/bookkeeping/shopping-cart 也在此,co-locate 组件/类型/mock 数据)
- `src/pages/Home/` — 首页(分类分组的专题导航 Hub,注册表驱动)
- `src/components/` — 共享组件(`TopicPage`/`TopicSection` 专题页骨架、`TopicCard` 导航卡、`Loading`),`React.FC`/`memo` + `displayName` 模式,测试 co-located
- `src/relay/` — Relay Environment setup;`fetchQueryWithMock` for dev, exported `fetchQuery` for production
- `src/__generated__/` — Relay compiler artifacts (NEVER edit manually; regenerate with `pnpm relay`)
- `src/test/` — shared test infra: `setupTests.ts` (jsdom mocks), `utils.tsx` (custom render with BrowserRouter)

**Key patterns:**
- Build via Rsbuild + Babel (`babel-plugin-relay` compiles `graphql` tags, artifacts → `src/__generated__/`)
- Port **3002** (configured in `rsbuild.config.ts`; 3000/3001 are taken by next-demo/next-upload)
- 设计 token:`tailwind.config.js` 定义 `primary` 色阶 / `rounded-card` / `shadow-card`,与 `App.tsx` 中 antd `ConfigProvider` 的 `theme.token`(colorPrimary `#4f46e5`)对齐
- 专题页布局统一使用 `TopicPage` + `TopicSection`;导航一律用 react-router(`useNavigate`/`Link`),禁止 `<a href>` 站内跳转
- 旧路径(`/todo`、`/bookkeeping` 等)由 `App.tsx` 的 `LEGACY_REDIRECTS` 重定向到新路径
- Styling: Tailwind v3 utilities primary (note: **v3**, unlike other packages on v4), antd for form controls
- Tests: jsdom environment, 70% coverage thresholds, `pnpm test:run` for CI mode;`src/config/topics.test.ts` 校验注册表完整性
- Standalone package-level `eslint.config.js` (eslint-plugin-react + react-hooks); does NOT extend the root Next-oriented config
- Git hooks (husky/commitlint/lint-staged) are inherited from the workspace root — the package has none of its own

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

## Design Tokens Philosophy

Both `vite-build` and `next-demo` implement design tokens, but differently:
- **vite-build** (`tokens.css`): Pure CSS custom properties with a three-layer architecture (Primitive → Semantic → Component); theme switching via `data-theme` attribute on `<html>`
- **next-demo** (`globals.css`): Tailwind CSS v4 `@theme` directive, which auto-generates utility classes; theme switching via `prefers-color-scheme` media query

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
- Scope is typically the package name (e.g., `next-demo`, `vite-basic`)
- Descriptions are in Chinese or English, describing the "why" over the "what"

## Agent Skills

Project skills for AI coding assistants are maintained **only** in `.claude/skills/`. `.agents/skills` is a git-tracked symbolic link pointing to `../.claude/skills`, so it stays in sync automatically — never edit or add files under `.agents/skills` directly. After pulling, macOS/Linux developers get the link automatically; on Windows, clone with `git config core.symlinks true` (Developer Mode enabled) for the link to materialize.
