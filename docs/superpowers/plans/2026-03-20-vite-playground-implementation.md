# Vite Playground 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化一个 Vite 学习 monorepo 项目，包含三个独立的子 package，分别侧重 Vite 的基础使用、开发服务器配置和构建优化。

**Architecture:** 使用 pnpm workspace 管理 monorepo，根目录共享 vite、typescript 等基础依赖，各子 package 独立配置自己的技术栈和构建配置。

**Tech Stack:** Vite 7, TypeScript, pnpm workspace, Vue 3, React 19, Vue Router, React Router, Jotai, Zustand, TailwindCSS, Ant Design, shadcn/ui

---

## 文件结构总览

**创建的文件：**
- `pnpm-workspace.yaml` - pnpm workspace 配置
- `.gitignore` - Git 忽略文件
- `package.json` - 根目录 package.json
- `packages/vite-basic/` - Vue 3 基础示例
- `packages/vite-server/` - React 19 + shadcn/ui 服务器示例
- `packages/vite-build/` - React 19 + Ant Design 构建优化示例

---

### Task 1: 根目录基础配置

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create/Modify: `package.json`

- [ ] **Step 1: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

- [ ] **Step 2: 创建 .gitignore**

```
# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env*.local
```

- [ ] **Step 3: 初始化根目录 package.json**

```json
{
  "name": "vite-playground",
  "private": true,
  "version": "1.0.0",
  "description": "Vite learning playground with monorepo structure",
  "scripts": {
    "dev:basic": "pnpm -C packages/vite-basic dev",
    "dev:server": "pnpm -C packages/vite-server dev",
    "dev:vite-build": "pnpm -C packages/vite-build dev",
    "build:basic": "pnpm -C packages/vite-basic build",
    "build:server": "pnpm -C packages/vite-server build",
    "build:vite-build": "pnpm -C packages/vite-build build",
    "preview:basic": "pnpm -C packages/vite-basic preview",
    "preview:server": "pnpm -C packages/vite-server preview",
    "preview:vite-build": "pnpm -C packages/vite-build preview",
    "build": "pnpm -r build",
    "type-check": "pnpm -r type-check"
  },
  "devDependencies": {},
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

- [ ] **Step 4: 安装根目录依赖**

```bash
pnpm add -Dw vite@latest typescript@latest @types/node@latest
```

- [ ] **Step 5: 提交**

```bash
git add pnpm-workspace.yaml .gitignore package.json
git commit -m "feat: setup root monorepo configuration"
```

---

### Task 2: 创建 vite-basic (Vue 3) 项目

**Files:**
- Create: `packages/vite-basic/package.json`
- Create: `packages/vite-basic/tsconfig.json`
- Create: `packages/vite-basic/tsconfig.node.json`
- Create: `packages/vite-basic/vite.config.ts`
- Create: `packages/vite-basic/index.html`
- Create: `packages/vite-basic/src/main.ts`
- Create: `packages/vite-basic/src/App.vue`
- Create: `packages/vite-basic/src/vite-env.d.ts`
- Create: `packages/vite-basic/src/router/index.ts`
- Create: `packages/vite-basic/src/composables/index.ts`
- Create: `packages/vite-basic/src/composables/useCounter.ts`
- Create: `packages/vite-basic/src/composables/useTheme.ts`
- Create: `packages/vite-basic/src/views/HomeView.vue`
- Create: `packages/vite-basic/src/views/AboutView.vue`
- Create: `packages/vite-basic/src/components/HelloWorld.vue`
- Create: `packages/vite-basic/src/assets/logo.svg` (placeholder)

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p packages/vite-basic/src/{assets,components,composables,router,views}
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "@vite-playground/basic",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "vue": "^3.0.0",
    "vue-router": "^4.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 创建 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173
  }
})
```

- [ ] **Step 6: 创建 index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/vite.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite Basic - Vue 3</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: 创建 vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

- [ ] **Step 8: 创建 main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 9: 创建 App.vue**

```vue
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
```

- [ ] **Step 10: 创建 router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
```

- [ ] **Step 11: 创建 composables/index.ts**

```typescript
export { useCounter } from './useCounter'
export { useTheme } from './useTheme'
```

- [ ] **Step 12: 创建 composables/useCounter.ts**

```typescript
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  return {
    count,
    increment,
    decrement,
    reset
  }
}
```

- [ ] **Step 13: 创建 composables/useTheme.ts**

```typescript
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light')

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })

  return {
    theme,
    toggleTheme
  }
}
```

- [ ] **Step 14: 创建 views/HomeView.vue**

```vue
<template>
  <div class="home">
    <h1>Welcome to Vite Basic</h1>
    <HelloWorld msg="Hello Vue 3 + Vite" />
    <div class="counter-section">
      <h2>Counter Example</h2>
      <p>Count: {{ count }}</p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
      <button @click="reset">Reset</button>
    </div>
    <div class="theme-section">
      <h2>Theme Example</h2>
      <p>Current theme: {{ theme }}</p>
      <button @click="toggleTheme">Toggle Theme</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue'
import { useCounter, useTheme } from '@/composables'

const { count, increment, decrement, reset } = useCounter(0)
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.home {
  padding: 20px;
}

.counter-section,
.theme-section {
  margin-top: 40px;
}

button {
  margin: 0 5px;
  padding: 8px 16px;
  cursor: pointer;
}
</style>
```

- [ ] **Step 15: 创建 views/AboutView.vue**

```vue
<template>
  <div class="about">
    <h1>About Vite Basic</h1>
    <p>This is a Vue 3 project setup with Vite to learn the basics of Vite.</p>
    <h2>What you can learn here:</h2>
    <ul>
      <li>Vite configuration</li>
      <li>Vue 3 + TypeScript integration</li>
      <li>Vue Router setup</li>
      <li>Composables pattern</li>
      <li>Hot Module Replacement (HMR)</li>
    </ul>
  </div>
</template>

<style scoped>
.about {
  padding: 20px;
}

ul {
  text-align: left;
  display: inline-block;
}
</style>
```

- [ ] **Step 16: 创建 components/HelloWorld.vue**

```vue
<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      For a guide and recipes on how to configure / customize this project,
      <br>
      check out the
      <a href="https://vitejs.dev/guide/" target="_blank" rel="noopener">Vite documentation</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<style scoped>
h1 {
  color: #42b983;
}
</style>
```

- [ ] **Step 17: 创建 assets/logo.svg (placeholder)**

```bash
echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#41B883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110H78.8z"/><path fill="#35495E" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"/></svg>' > packages/vite-basic/src/assets/logo.svg
```

- [ ] **Step 18: 安装依赖**

```bash
cd packages/vite-basic && pnpm add vue@latest vue-router@latest && pnpm add -D @vitejs/plugin-vue@latest vue-tsc@latest
```

- [ ] **Step 19: 提交**

```bash
git add packages/vite-basic
git commit -m "feat: add vite-basic Vue 3 package"
```

---

### Task 3: 创建 vite-server (React 19 + shadcn/ui) 项目

**Files:**
- Create: `packages/vite-server/package.json`
- Create: `packages/vite-server/tsconfig.json`
- Create: `packages/vite-server/vite.config.ts`
- Create: `packages/vite-server/index.html`
- Create: `packages/vite-server/src/main.tsx`
- Create: `packages/vite-server/src/App.tsx`
- Create: `packages/vite-server/src/vite-env.d.ts`
- Create: `packages/vite-server/src/routes/index.tsx`
- Create: `packages/vite-server/src/routes/lazy.tsx`
- Create: `packages/vite-server/src/hooks/index.ts`
- Create: `packages/vite-server/src/hooks/useCounter.ts`
- Create: `packages/vite-server/src/hooks/useLocalStorage.ts`
- Create: `packages/vite-server/src/store/index.ts`
- Create: `packages/vite-server/src/store/counterAtom.ts`
- Create: `packages/vite-server/src/store/themeAtom.ts`
- Create: `packages/vite-server/src/lib/utils.ts`
- Create: `packages/vite-server/src/styles/globals.scss`
- Create: `packages/vite-server/src/views/HomeView.tsx`
- Create: `packages/vite-server/src/views/AboutView.tsx`
- Create: `packages/vite-server/tailwind.config.js`
- Create: `packages/vite-server/postcss.config.js`
- Create: `packages/vite-server/components.json`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p packages/vite-server/src/{components/ui,hooks,lib,routes,store,styles,views}
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "@vite-playground/server",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.0.0",
    "jotai": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react-swc": "^3.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "sass": "^1.0.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

- [ ] **Step 5: 创建 index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite Server - React 19</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 7: 创建 main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
```

- [ ] **Step 8: 创建 App.tsx**

```tsx
import { Link, useRoutes } from 'react-router-dom'
import { routes } from './routes'

export default function App() {
  const element = useRoutes(routes)

  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link> |
        <Link to="/about">About</Link>
      </nav>
      {element}
    </div>
  )
}
```

- [ ] **Step 9: 创建 routes/index.tsx**

```tsx
import { RouteObject } from 'react-router-dom'
import { HomeView, AboutView } from './lazy'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeView />
  },
  {
    path: '/about',
    element: <AboutView />
  }
]
```

- [ ] **Step 10: 创建 routes/lazy.tsx**

```tsx
import { lazy, Suspense } from 'react'

const HomeView = lazy(() => import('@/views/HomeView'))
const AboutView = lazy(() => import('@/views/AboutView'))

function withSuspense<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Component {...props} />
      </Suspense>
    )
  }
}

export const HomeViewLazy = withSuspense(HomeView)
export const AboutViewLazy = withSuspense(AboutView)

export { HomeView, AboutView }
```

- [ ] **Step 11: 创建 hooks/index.ts**

```typescript
export { useCounter } from './useCounter'
export { useLocalStorage } from './useLocalStorage'
```

- [ ] **Step 12: 创建 hooks/useCounter.ts**

```typescript
import { useState } from 'react'

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = () => setCount((c) => c + 1)
  const decrement = () => setCount((c) => c - 1)
  const reset = () => setCount(initialValue)

  return { count, increment, decrement, reset }
}
```

- [ ] **Step 13: 创建 hooks/useLocalStorage.ts**

```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

- [ ] **Step 14: 创建 store/index.ts**

```typescript
export { counterAtom } from './counterAtom'
export { themeAtom } from './themeAtom'
```

- [ ] **Step 15: 创建 store/counterAtom.ts**

```typescript
import { atom } from 'jotai'

export const counterAtom = atom(0)
```

- [ ] **Step 16: 创建 store/themeAtom.ts**

```typescript
import { atom } from 'jotai'

type Theme = 'light' | 'dark'

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme') as Theme
    return saved || 'light'
  }
  return 'light'
}

export const themeAtom = atom<Theme>(getInitialTheme())

export const themeWithPersistenceAtom = atom(
  (get) => get(themeAtom),
  (get, set, newTheme: Theme) => {
    set(themeAtom, newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }
)
```

- [ ] **Step 17: 创建 lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 18: 创建 styles/globals.scss**

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
}

[data-theme='dark'] {
  --background: #1a1a1a;
  --foreground: #ffffff;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  text-align: center;
  padding: 20px;
}

nav {
  padding: 20px;
}

nav a {
  margin: 0 10px;
  color: #646cff;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}
```

- [ ] **Step 19: 创建 views/HomeView.tsx**

```tsx
import { useAtom } from 'jotai'
import { useCounter, useLocalStorage } from '@/hooks'
import { counterAtom, themeWithPersistenceAtom } from '@/store'

export default function HomeView() {
  const { count, increment, decrement, reset } = useCounter(0)
  const [jotaiCount, setJotaiCount] = useAtom(counterAtom)
  const [theme, setTheme] = useAtom(themeWithPersistenceAtom)
  const [name, setName] = useLocalStorage('name', 'Guest')

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="home">
      <h1>Welcome to Vite Server</h1>
      <p>Learn Vite dev server configuration!</p>

      <div className="section">
        <h2>Local State Counter</h2>
        <p>Count: {count}</p>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="section">
        <h2>Jotai State Counter</h2>
        <p>Count: {jotaiCount}</p>
        <button onClick={() => setJotaiCount((c) => c + 1)}>+</button>
        <button onClick={() => setJotaiCount((c) => c - 1)}>-</button>
        <button onClick={() => setJotaiCount(0)}>Reset</button>
      </div>

      <div className="section">
        <h2>Theme (persisted)</h2>
        <p>Current theme: {theme}</p>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>

      <div className="section">
        <h2>Local Storage Hook</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <p>Hello, {name}!</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 20: 创建 views/AboutView.tsx**

```tsx
export default function AboutView() {
  return (
    <div className="about">
      <h1>About Vite Server</h1>
      <p>This package focuses on learning Vite dev server features.</p>
      <h2>What you can learn here:</h2>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li>Dev server port configuration</li>
        <li>Proxy configuration for API requests</li>
        <li>CORS and custom headers</li>
        <li>ConfigureServer middleware</li>
        <li>HMR behavior customization</li>
      </ul>
    </div>
  )
}
```

- [ ] **Step 21: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 22: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 23: 创建 components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.scss",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 24: 安装依赖**

```bash
cd packages/vite-server && pnpm add react@latest react-dom@latest react-router-dom@latest jotai@latest class-variance-authority@latest clsx@latest tailwind-merge@latest lucide-react@latest && pnpm add -D @types/react@latest @types/react-dom@latest @vitejs/plugin-react-swc@latest tailwindcss@latest postcss@latest autoprefixer@latest sass@latest
```

- [ ] **Step 25: 提交**

```bash
git add packages/vite-server
git commit -m "feat: add vite-server React 19 + shadcn/ui package"
```

---

### Task 4: 创建 vite-build (React 19 + Ant Design) 项目

**Files:**
- Create: `packages/vite-build/package.json`
- Create: `packages/vite-build/tsconfig.json`
- Create: `packages/vite-build/vite.config.ts`
- Create: `packages/vite-build/index.html`
- Create: `packages/vite-build/src/main.tsx`
- Create: `packages/vite-build/src/App.tsx`
- Create: `packages/vite-build/src/vite-env.d.ts`
- Create: `packages/vite-build/src/routes/index.tsx`
- Create: `packages/vite-build/src/hooks/index.ts`
- Create: `packages/vite-build/src/hooks/useDebounce.ts`
- Create: `packages/vite-build/src/hooks/useToggle.ts`
- Create: `packages/vite-build/src/store/index.ts`
- Create: `packages/vite-build/src/store/useCounterStore.ts`
- Create: `packages/vite-build/src/styles/globals.scss`
- Create: `packages/vite-build/src/views/HomeView.tsx`
- Create: `packages/vite-build/src/views/AboutView.tsx`
- Create: `packages/vite-build/tailwind.config.js`
- Create: `packages/vite-build/postcss.config.js`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p packages/vite-build/src/{components,hooks,routes,store,styles,views}
```

- [ ] **Step 2: 创建 package.json**

```json
{
  "name": "@vite-playground/build",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.0.0",
    "zustand": "^4.0.0",
    "antd": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react-swc": "^3.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "sass": "^1.0.0",
    "vite-bundle-analyzer": "^1.0.0"
  }
}
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 创建 vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5175
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
          store: ['zustand']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

- [ ] **Step 5: 创建 index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite Build - React 19</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
```

- [ ] **Step 7: 创建 main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App'
import './styles/globals.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
)
```

- [ ] **Step 8: 创建 App.tsx**

```tsx
import { Link, useRoutes } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { HomeOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { routes } from './routes'

const { Header, Content } = Layout

export default function App() {
  const element = useRoutes(routes)

  const items: MenuProps['items'] = [
    {
      label: <Link to="/">Home</Link>,
      key: '/',
      icon: <HomeOutlined />
    },
    {
      label: <Link to="/about">About</Link>,
      key: '/about',
      icon: <InfoCircleOutlined />
    }
  ]

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" items={items} />
      </Header>
      <Content style={{ padding: '20px 50px' }}>
        <div className="site-layout-content">{element}</div>
      </Content>
    </Layout>
  )
}
```

- [ ] **Step 9: 创建 routes/index.tsx**

```tsx
import { RouteObject } from 'react-router-dom'
import HomeView from '@/views/HomeView'
import AboutView from '@/views/AboutView'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomeView />
  },
  {
    path: '/about',
    element: <AboutView />
  }
]
```

- [ ] **Step 10: 创建 hooks/index.ts**

```typescript
export { useDebounce } from './useDebounce'
export { useToggle } from './useToggle'
```

- [ ] **Step 11: 创建 hooks/useDebounce.ts**

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

- [ ] **Step 12: 创建 hooks/useToggle.ts**

```typescript
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((v) => !v)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return { value, toggle, setTrue, setFalse }
}
```

- [ ] **Step 13: 创建 store/index.ts**

```typescript
export { useCounterStore } from './useCounterStore'
```

- [ ] **Step 14: 创建 store/useCounterStore.ts**

```typescript
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}))
```

- [ ] **Step 15: 创建 styles/globals.scss**

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.layout {
  min-height: 100vh;
}

.logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout-content {
  background: #fff;
  padding: 24px;
  min-height: 280px;
}
```

- [ ] **Step 16: 创建 views/HomeView.tsx**

```tsx
import { useState, useEffect } from 'react'
import { Button, Card, Typography, Input, Switch, Space } from 'antd'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useCounterStore } from '@/store'
import { useDebounce, useToggle } from '@/hooks'

const { Title, Paragraph, Text } = Typography

export default function HomeView() {
  const { count, increment, decrement, reset } = useCounterStore()
  const { value: isDark, toggle: toggleTheme } = useToggle(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [debouncedCount, setDebouncedCount] = useState(0)

  useEffect(() => {
    setDebouncedCount(count)
  }, [debouncedSearch])

  return (
    <div className="home">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>Welcome to Vite Build</Title>
          <Paragraph>Learn Vite build optimization features!</Paragraph>
        </Card>

        <Card title="Zustand Counter">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={increment}
            >
              Increment
            </Button>
            <Button icon={<MinusOutlined />} onClick={decrement}>
              Decrement
            </Button>
            <Button icon={<ReloadOutlined />} onClick={reset}>
              Reset
            </Button>
          </Space>
          <Title level={3} style={{ marginTop: '20px' }}>
            Count: {count}
          </Title>
        </Card>

        <Card title="Debounce Example">
          <Input
            placeholder="Type something..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Text>Debounced value: {debouncedSearch}</Text>
        </Card>

        <Card title="Toggle Example">
          <Space>
            <Text>Dark Mode:</Text>
            <Switch checked={isDark} onChange={toggleTheme} />
          </Space>
          <Paragraph style={{ marginTop: '10px' }}>
            Dark mode is {isDark ? 'enabled' : 'disabled'}
          </Paragraph>
        </Card>
      </Space>
    </div>
  )
}
```

- [ ] **Step 17: 创建 views/AboutView.tsx**

```tsx
import { Card, Typography, List } from 'antd'

const { Title, Paragraph } = Typography

export default function AboutView() {
  const buildFeatures = [
    'Manual and automatic code splitting',
    'Chunk splitting strategy (manualChunks)',
    'Minification options (terser/esbuild)',
    'Bundle analysis with vite-bundle-analyzer',
    'Treeshaking and sideEffects',
    'Preload and prefetch configuration',
    'External dependencies (external)'
  ]

  return (
    <div className="about">
      <Card>
        <Title level={2}>About Vite Build</Title>
        <Paragraph>
          This package focuses on learning Vite build optimization features.
        </Paragraph>

        <Title level={3}>What you can learn here:</Title>
        <List
          dataSource={buildFeatures}
          renderItem={(item) => <List.Item>• {item}</List.Item>}
        />
      </Card>
    </div>
  )
}
```

- [ ] **Step 18: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
```

- [ ] **Step 19: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 20: 安装依赖**

```bash
cd packages/vite-build && pnpm add react@latest react-dom@latest react-router-dom@latest zustand@latest antd@latest && pnpm add -D @types/react@latest @types/react-dom@latest @vitejs/plugin-react-swc@latest tailwindcss@latest postcss@latest autoprefixer@latest sass@latest vite-bundle-analyzer@latest
```

- [ ] **Step 21: 提交**

```bash
git add packages/vite-build
git commit -m "feat: add vite-build React 19 + Ant Design package"
```

---

### Task 5: 验证项目和更新 README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 运行类型检查**

```bash
pnpm type-check
```

- [ ] **Step 2: 构建所有项目**

```bash
pnpm build
```

- [ ] **Step 3: 更新 README.md**

```markdown
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
```

- [ ] **Step 4: 提交**

```bash
git add README.md
git commit -m "docs: update README with project information"
```
