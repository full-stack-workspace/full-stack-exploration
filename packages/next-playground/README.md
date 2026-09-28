# Next Playground · 生产级工程决策

Next.js 文档告诉你 API **能做什么**。这个站点练的是另一件事:**生产里该选哪条路,以及为什么不选另外几条。**

渲染光谱上选哪一格、Server/Client 边界画在哪、四层缓存谁说了算、AI 流式体验怎么落地——每个专题都是可运行的对照实验,而不是一页说明书。站点按专题注册表驱动,顶栏、侧边栏、首页卡片、页面 metadata 全部同源。

本地默认跑在 [http://localhost:3000](http://localhost:3000)。

## 站点里有什么

| 分类 | 你能练到什么 |
|------|----------------|
| **渲染策略** `/rendering` | ISR 静态再生;SSG⇄SSR⇄Streaming⇄PPR 的选择(后续阶段补齐) |
| **Server/Client 边界** `/rsc-boundary` | RSC 优先;交互下沉到 Client 叶子、props 跨边界序列化 |
| **路由机制** `/router` | 动态段与「Client 页面用 layout 出动态 metadata」的兜底模式 |
| **数据与缓存** `/data` | Route Handler 的存在理由;四层缓存心智模型(后续阶段) |
| **AI-Native 与 Agent** `/ai-native` | 流式加载体验基线;真实 SSE 端点与 Generative UI(后续阶段) |

## 如何新增一个专题

站点由 `config/topics.tsx` **注册表**单一驱动。App Router 的路由由文件系统决定,注册表只驱动导航与元信息——新增专题需要三步:

1. 新建 `topics/<category>/<name>/index.tsx` 编写专题内容,页面骨架用 `components/topic/TopicPage` 的 `TopicPage` + `TopicSection`
2. 新建 `app/<category.basePath 去掉前导斜杠>/<name>/page.tsx` **薄壳**:
   ```tsx
   import { getTopicMetadata } from "@/lib/topic-meta";
   import MyTopic from "@/topics/<category>/<name>";
   export const metadata = getTopicMetadata("/<basePath>/<name>");
   export default function Page() { return <MyTopic />; }
   ```
   页面级渲染约定(`revalidate`、`dynamic` 等)也留在薄壳里导出
3. 在 `config/topics.tsx` 的 `TOPICS` 数组注册一行(`path` 必须与 app/ 路由一致)

注册后顶栏、侧边栏、首页卡片、`<title>`/meta description 自动生效。

## 本地运行

在仓库根目录安装依赖后:

```bash
pnpm install
pnpm dev:next          # http://localhost:3000
```

常用命令:

```bash
pnpm -C packages/next-playground build       # 构建(含 TypeScript 检查)
pnpm -C packages/next-playground lint        # ESLint
```

## 目录约定

- `app/` — App Router 薄壳路由 + Route Handler(`app/api/`);专题页不含内容,只导出 metadata 与渲染约定
- `topics/<category>/<name>/` — 专题真实内容,co-locate 演示组件
- `config/topics.tsx` — 专题注册表(全站单一数据源)
- `components/` — 共享组件:`shell/SiteShell`(顶栏+侧边栏壳层)、`topic/TopicPage`(专题骨架)、`ThemeProvider`(class 策略暗色)
- `data/` — 静态 mock 数据与数据访问(`getPosts` 用 React `cache()` 记忆化)
- `lib/` — 工具:`utils.ts` 的 `cn()`;`topic-meta.ts` 的 `getTopicMetadata()` / `SITE_NAME`

## 技术栈

Next.js 16(App Router)+ React 19 + Tailwind CSS 4 + SWR。暗色模式为手写 ThemeProvider(`localStorage` → `prefers-color-scheme`,body 内联脚本防闪烁)。
