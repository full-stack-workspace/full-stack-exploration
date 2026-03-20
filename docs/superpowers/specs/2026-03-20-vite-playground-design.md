# Vite Playground 项目设计文档

**日期**: 2026-03-20
**状态**: 设计中

## 项目概述

这是一个用于学习 Vite 的 monorepo 项目，使用 TypeScript 和 pnpm workspace 进行管理。项目包含三个独立的子 package，分别侧重 Vite 的不同方面。

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
├── package.json                        # 根目录：vite, typescript 等核心依赖
├── pnpm-workspace.yaml                 # pnpm workspace 配置
├── .gitignore
├── README.md
└── LICENSE
```

## 子 package 定位

### vite-basic（Vue 3）
- **定位**: 学习 Vite 基础使用 - 配置、插件、HMR 等
- **技术栈**: Vue 3 + TypeScript + Vue Router
- **关键特性**: composables、路由配置、基础组件

### vite-server（React 19 + shadcn/ui）
- **定位**: 学习 Vite 开发服务器 - proxy、CORS、HMR 配置、中间件等
- **技术栈**: React 19 + SWC + Jotai + React Router + TailwindCSS + shadcn/ui + SCSS
- **关键特性**: 自定义 hooks、路由配置、shadcn/ui 组件、Jotai 状态管理

### vite-build（React 19 + Ant Design）
- **定位**: 学习 Vite 构建优化 - code splitting、treeshaking、压缩、chunk 策略等
- **技术栈**: React 19 + SWC + Zustand + React Router + TailwindCSS + Ant Design + SCSS
- **关键特性**: 自定义 hooks、路由配置、Zustand 状态管理、各种构建优化配置

## 依赖管理策略

### 根目录依赖
- vite (latest)
- typescript (latest)
- @types/node (latest)

### 子 package 依赖
- 各自安装自己的业务依赖（vue、react、antd 等）
- 通过 pnpm workspace 继承根目录的 vite、typescript 等工具依赖
- 子 package 之间互不引用，保持独立

## 脚本配置

### 根目录脚本
- `dev:basic` - 启动 vite-basic 开发服务器
- `dev:server` - 启动 vite-server 开发服务器
- `dev:build` - 启动 vite-build 开发服务器
- `build:basic` - 构建 vite-basic
- `build:server` - 构建 vite-server
- `build:build` - 构建 vite-build
- `preview:basic` - 预览 vite-basic 构建结果
- `preview:server` - 预览 vite-server 构建结果
- `preview:build` - 预览 vite-build 构建结果
- `build` - 构建所有子 package
- `type-check` - 运行所有子 package 的类型检查

### 子 package 脚本
- `dev` - 启动开发服务器
- `build` - 构建生产版本
- `preview` - 预览构建结果
- `type-check` - TypeScript 类型检查

## 技术选型说明

### Monorepo 管理
- 使用 pnpm workspace，轻量级且与 pnpm 完美集成

### 包名规范
- 使用 @vite-playground 作为 scope，例如 @vite-playground/basic

### 安装方式
- 使用 `pnpm add xxx@latest` 安装依赖，确保获取最新版本
