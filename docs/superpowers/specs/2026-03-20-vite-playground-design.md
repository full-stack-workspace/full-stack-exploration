# Vite Playground 项目设计文档

**日期**: 2026-03-20
**状态**: 设计中

## 项目概述

这是一个用于学习 Vite 的 monorepo 项目，使用 TypeScript 和 pnpm workspace 进行管理。项目包含三个独立的子 package，分别侧重 Vite 的不同方面。

> 注意：仓库目录名为 `vite-playgournd`（现有 git 仓库名称，保持不变），npm scope 为 `@vite-playground`。

### 环境要求
- Node.js: >= 18.0.0（Vite 7 和 React 19 的最低要求）
- pnpm: >= 9.0.0

## 目录结构

```
vite-playgournd/
├── packages/
│   ├── vite-basic/                    # Vue 3 + TypeScript 学习基础使用
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── composables/           # 组合式函数
│   │   │   ├── router/                 # 路由配置
│   │   │   ├── views/                  # 页面视图
│   │   │   ├── App.vue
│   │   │   ├── main.ts
│   │   │   └── vite-env.d.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   └── vite.config.ts
│   │
│   ├── vite-server/                   # React 19 + shadcn/ui 学习本地服务器
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   └── ui/                # shadcn/ui 组件
│   │   │   ├── hooks/                  # React Hooks
│   │   │   ├── lib/
│   │   │   ├── routes/                 # 路由配置
│   │   │   ├── store/                  # Jotai 状态管理
│   │   │   ├── styles/
│   │   │   ├── views/                  # 页面视图
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── vite-env.d.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── components.json
│   │
│   └── vite-build/                    # React 19 + Ant Design 学习构建优化
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/                  # React Hooks
│       │   ├── routes/                 # 路由配置
│       │   ├── store/                  # Zustand 状态管理
│       │   ├── styles/
│       │   ├── views/                  # 页面视图
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── package.json                        # 根目录：vite、typescript 等基础依赖和公共脚本
├── pnpm-workspace.yaml                 # pnpm workspace 配置
├── .gitignore
├── README.md
└── LICENSE
```

## 子 package 定位

### vite-basic（Vue 3）
- **定位**: 学习 Vite 基础使用 - 配置、插件、HMR 等
- **技术栈**: Vue 3 + TypeScript + Vue Router
- **开发服务器端口**: 5173
- **关键特性**: composables、路由配置、基础组件

### vite-server（React 19 + shadcn/ui）
- **定位**: 学习 Vite 开发服务器 - proxy、CORS、HMR 配置、中间件等
- **技术栈**: React 19 + SWC (@vitejs/plugin-react-swc) + Jotai + React Router + TailwindCSS + shadcn/ui + SCSS
  - 说明：TailwindCSS 用于原子化 CSS，SCSS 用于编写复杂的自定义样式
- **状态管理选择理由**: 使用 Jotai 而非 Zustand，目的是学习原子化状态管理模式
- **开发服务器端口**: 5174
- **关键特性**: 自定义 hooks、路由配置、shadcn/ui 组件、Jotai 状态管理
- **学习内容示例**:
  - 配置开发服务器端口、host、https
  - 配置 proxy 代理后端 API
  - 配置 CORS 和自定义响应头
  - 使用 configureServer 中间件
  - 配置 HMR 行为

### vite-build（React 19 + Ant Design）
- **定位**: 学习 Vite 构建优化 - code splitting、treeshaking、压缩、chunk 策略等
- **技术栈**: React 19 + SWC (@vitejs/plugin-react-swc) + Zustand + React Router + TailwindCSS + Ant Design + SCSS
  - 说明：同时使用 TailwindCSS 和 Ant Design 用于学习不同样式方案的集成；TailwindCSS 用于工具类，Ant Design 用于企业级组件，SCSS 用于自定义样式
- **状态管理选择理由**: 使用 Zustand 而非 Jotai，目的是学习对比不同的轻量级状态管理库的使用方式
- **开发服务器端口**: 5175
- **关键特性**: 自定义 hooks、路由配置、Zustand 状态管理、各种构建优化配置
- **学习内容示例**:
  - 配置手动和自动 code splitting
  - 配置 chunk 分割策略 (manualChunks)
  - 配置压缩工具 (terser/esbuild) 和选项
  - 使用 vite-bundle-analyzer 分析包大小
  - 配置 treeshaking 和副作用标记
  - 配置预加载和预获取
  - 配置外部依赖 (external)

## pnpm Workspace 配置

### pnpm-workspace.yaml
```yaml
packages:
  - 'packages/*'
```

## 依赖管理策略

### 根目录依赖
- **声明基础公用开发依赖** - vite、typescript、@types/node
- 提供便捷的脚本命令来运行子 package

### 子 package 依赖
- 各自在自己的 package.json 中安装业务依赖（vue、react、antd 等）
- 安装各自特有的工具依赖（如 @vitejs/plugin-vue、@vitejs/plugin-react-swc、tailwindcss 等）
- vite、typescript、@types/node 通过 pnpm workspace 从根目录共享
- 子 package 之间互不引用，保持独立

### TypeScript 配置
- 各子 package 使用独立的 tsconfig.json，互不引用
- **vite-basic**：同时包含 `tsconfig.json`（项目代码）和 `tsconfig.node.json`（Vite 配置类型检查）
- **vite-server** 和 **vite-build**：仅包含 `tsconfig.json`
- 不使用 TypeScript Project References

## 脚本配置

### 根目录脚本
- `dev:basic` - 启动 vite-basic 开发服务器 (端口 5173)
- `dev:server` - 启动 vite-server 开发服务器 (端口 5174)
- `dev:vite-build` - 启动 vite-build 开发服务器 (端口 5175)
- `build:basic` - 构建 vite-basic
- `build:server` - 构建 vite-server
- `build:vite-build` - 构建 vite-build
- `preview:basic` - 预览 vite-basic 构建结果
- `preview:server` - 预览 vite-server 构建结果
- `preview:vite-build` - 预览 vite-build 构建结果
- `build` - 构建所有子 package
- `type-check` - 运行所有子 package 的类型检查

### 子 package 脚本
- `dev` - 启动开发服务器
- `build` - 构建生产版本
- `preview` - 预览构建结果
- `type-check` - TypeScript 类型检查

## 环境变量配置

各子 package 可使用以下环境变量文件：
- `.env` - 基础环境变量（可提交到 git）
- `.env.local` - 本地覆盖（不提交到 git）
- `.env.development` - 开发环境
- `.env.production` - 生产环境

## 技术选型说明

### Monorepo 管理
- 使用 pnpm workspace，轻量级且与 pnpm 完美集成

### 包名规范
- 使用 @vite-playground 作为 scope，例如 @vite-playground/basic

### 安装方式
- 使用 `pnpm add xxx@latest` 安装依赖，确保获取最新版本
- 安装后 package.json 中会自动写入具体的版本号，保证构建可复现

### 构建配置
- 各子 package 使用 Vite 默认的 `dist` 作为构建输出目录（如 `packages/vite-basic/dist`、`packages/vite-server/dist`、`packages/vite-build/dist`）
- `.gitignore` 中忽略所有 `dist` 目录、`node_modules` 目录和 `.env*.local` 文件

### Linting & Formatting（可选）
- 本项目专注于 Vite 学习，暂不强制配置 ESLint/Prettier
- 各子 package 可根据需要独立添加
