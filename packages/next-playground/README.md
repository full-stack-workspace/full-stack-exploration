# Next Playground · 该选哪条

Next.js 文档告诉你 API **能做什么**。这个站点写的是另一件事:**这一页该选哪条,以及为什么不选另外几条。**

渲染光谱上选哪一格、Server/Client 边界画在哪、四层缓存谁说了算、AI 流式体验怎么落地——每个专题都是可运行的对照实验,而不是一页说明书。站点按专题注册表驱动,顶栏、侧边栏、首页卡片、页面 metadata 全部同源。

本地默认跑在 [http://localhost:3000](http://localhost:3000)。

## 站点里有什么

| 分类 | 你能练到什么 |
|------|----------------|
| **渲染策略** `/rendering` | SSG⇄ISR⇄SSR⇄Streaming⇄PPR 光谱决策;SSR 整页可刷新对照;真实流式 Suspense;Cache Components 讲解 |
| **Server/Client 边界** `/rsc-boundary` | RSC 心智模型、可序列化 props 与 `use()`、Server Actions 渐进增强留言板 |
| **路由机制** `/router` | 动态段保持 Server、约定文件、error/not-found 活演示、平行路由拦截弹层、Link prefetch 与 Router Cache |
| **数据与缓存** `/data` | 四层缓存对照台、Route Handler 与 Server Action / 直取的分界、SWR 的合理场景 |
| **Metadata 与 SEO** `/metadata` | 静态/动态/约定文件合并顺序;sitemap、robots 与 JSON-LD |
| **工程化** `/engineering` | middleware 改头可在页面读到,并对照 Next 16 的 proxy.ts;缓存策略;Image/Font/包体 |
| **AI-Native 与 Agent** `/ai-native` | 真实 SSE 流式端点(含取消=省计费)、Generative UI 组件映射、Agent 多步时间线串并行对照 |

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
