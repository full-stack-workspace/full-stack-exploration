# full-stack-exploration

> 用于学习和演示对 Vite、Tailwind CSS、React 和 Next.js 的实践总结。
> A hands-on monorepo for learning Vite, Tailwind CSS, React, and Next.js.

## Packages

| Package | Description | Port |
|---------|-------------|------|
| `@vite-playground/basic` | Vue 3 + TypeScript — learn Vite fundamentals: plugins, HMR, SCSS integration | 5173 |
| `@vite-playground/server` | React 19 + shadcn/ui + Jotai — learn Vite dev server: proxy, CORS, middleware | 5174 |
| `@vite-playground/build` | React 19 + Ant Design + Zustand — learn Vite build: code splitting, bundle analysis, Design Tokens system | 5175 |
| `next-demo` | Next.js 16 + React 19 + Tailwind CSS 4 — App Router demo with dark mode and Chinese localization | 3000 |

### Key Highlights

- **vite-build** contains an elaborate [Design Tokens](packages/vite-build/src/styles/tokens.css) system with CSS custom properties, supporting light/dark themes via `data-theme`.
- **next-demo** demonstrates Next.js App Router patterns: Server Components, metadata API, file-system routing, and `prefers-color-scheme` dark mode.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 9.0.0

### Installation

```bash
pnpm install
```

### Development

```bash
# Vite packages
pnpm dev:basic      # Vue 3 + Vite basics
pnpm dev:server     # React 19 + Vite dev server
pnpm dev:vite-build # React 19 + Vite build optimization

# Next.js
pnpm dev:next

# Build all packages
pnpm build

# Type check all packages
pnpm type-check
```

## Tech Stack

**Build Tools**
Vite 8 · Next.js 16

**Frameworks**
React 19 · Vue 3

**UI & Styling**
Tailwind CSS 4 · Ant Design 6 · shadcn/ui · SCSS · CSS Design Tokens

**State Management**
Jotai · Zustand

**Tooling**
TypeScript · pnpm workspace · esbuild · vite-bundle-analyzer

## Learning Path

Recommended order for exploring the project:

1. **vite-basic** — Start here to understand Vite fundamentals: plugins, HMR, SCSS
2. **vite-server** — Learn dev server configuration: proxy, CORS, middleware
3. **vite-build** — Explore build optimization and the Design Tokens system
4. **next-demo** — See Next.js App Router patterns in action

## License

MIT
