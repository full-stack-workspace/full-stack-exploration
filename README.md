# vite-playgournd

Vite learning playground with monorepo structure.

## Packages

- `@vite-playground/basic` - Vue 3 + TypeScript, learn Vite basics (port 5173)
- `@vite-playground/server` - React 19 + shadcn/ui, learn Vite dev server (port 5174)
- `@vite-playground/build` - React 19 + Ant Design, learn Vite build optimization (port 5175)

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
# Run all packages
pnpm dev:basic
pnpm dev:server
pnpm dev:vite-build

# Build all packages
pnpm build

# Type check all packages
pnpm type-check
```

## Tech Stack

- Vite 7
- TypeScript
- pnpm workspace
- Vue 3 + Vue Router
- React 19 + React Router
- Jotai / Zustand
- TailwindCSS
- Ant Design / shadcn/ui
