# react-playground

A modern React development playground, leveraging **TypeScript** for type safety, and seamlessly integrating **SCSS**, **Tailwind CSS**, and **Ant Design** for robust UI development. The project uses **pnpm** for efficient package management and **Rsbuild** for fast and flexible builds.

This repository is **collaboratively maintained by AI coding tools and human developers, with a primary focus on testing and validating the Vibe coding workflow**.

## Setup

Install the dependencies:

```bash
# install pnpm globally
npm install -g pnpm

# install dependencies
pnpm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:3002](http://localhost:3002).

```bash
pnpm run dev
```

Build the app for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## 信息架构与如何新增专题

站点由 `src/config/topics.tsx` **注册表**单一驱动:路由、顶部导航、侧边栏、
首页卡片全部从 `TOPICS` 派生。新增一个演示专题只需两步:

1. 新建 `src/topics/<category>/<name>/index.tsx`,默认导出演示组件
   - `<category>` 为 `basics` / `hooks` / `advanced` / `apps` 之一
   - 页面骨架使用 `TopicPage` / `TopicSection`(见 `src/components/TopicPage.tsx`),
     参考现有专题如 `src/topics/basics/event/index.tsx`
2. 在 `src/config/topics.tsx` 的 `TOPICS` 数组中注册一行
   (`path` 必须是 `<category.basePath>/<name>`)

注册后路由、侧边栏、首页卡片自动生效;`pnpm test:run` 中的注册表完整性测试
会校验 path 唯一性、分类合法性等约束。综合应用(完整业务功能)放在 `apps`
分类下,同样通过注册表登记。
