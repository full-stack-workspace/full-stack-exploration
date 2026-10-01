# Next 权衡录 · 把选型放到同一把尺子上

**Next 权衡录 / Next Tradeoffs**。Next.js 文档告诉你 API **能做什么**。这个站点写的是另一件事:**这一页该选哪条,以及为什么不选另外几条。**

渲染光谱上选哪一格、Server/Client 边界画在哪、四层缓存谁说了算、AI 流式体验怎么落地——每个专题都是可运行的对照实验,而不是一页说明书。站点按专题注册表驱动,顶栏、侧边栏、首页卡片、页面 metadata 全部同源;品牌文案(站点名、slogan、og 描述)收敛在 `config/site.ts` 单一数据源。

本地默认跑在 [http://localhost:3000](http://localhost:3000)。

## 站点里有什么

| 分类 | 你能练到什么 |
|------|----------------|
| **Server/Client 边界** `/rsc-boundary` | RSC 心智模型、可序列化 props 与 children 槽、Server Actions 渐进增强留言板、末页理解检验 |
| **渲染策略** `/rendering` | SSG⇄ISR⇄SSR⇄Streaming⇄PPR 光谱决策;SSR 整页可刷新对照;真实流式 Suspense;PPR 与 Cache Components;ViewTransition 页面转场;末页理解检验 |
| **路由机制** `/router` | 动态段保持 Server、约定文件、error/not-found 活演示、平行路由拦截弹层、Link prefetch 与 Router Cache、路由组与多根布局、i18n 路由 |
| **数据与缓存** `/data` | 四层缓存对照台、cacheTag 按需失效、Route Handler、zod 表单校验、动态 API 与 Suspense 洞、SWR 的合理场景、末页理解检验 |
| **Metadata 与 SEO** `/metadata` | 静态/动态/约定文件合并顺序;sitemap、robots 与 JSON-LD |
| **工程化** `/engineering` | middleware 改头可在页面读到,并对照 Next 16 的 proxy.ts;缓存策略设计;Image/Font/包体治理;Turbopack 构建、bundle 分析与 standalone 部署 |
| **安全** `/security` | 安全响应头与 CSP 活证据(客户端 HEAD 自读)、环境变量/taint/Server Actions 三条信任边界 |
| **AI-Native 与 Agent** `/ai-native` | 真实 SSE 流式端点(含取消=省计费)、Generative UI 组件映射、Agent 多步时间线串并行对照、手写 SSE vs Vercel AI SDK |

专题清单(37 个,全部注册在 `config/topics.tsx`):

- `/rsc-boundary`:guide(RSC 心智模型)、props-boundary、server-actions、check
- `/rendering`:spectrum、isr、ssr、streaming、ppr、view-transition、check
- `/router`:dynamic-routes、conventions、errors、parallel、navigation、route-groups、i18n
- `/data`:cache-layers、revalidation、route-handlers、forms、dynamic-apis、client-fetching、check
- `/metadata`:guide、crawl
- `/engineering`:middleware、caching-strategy、asset-perf、build-deploy
- `/security`:headers、boundaries
- `/ai-native`:streaming-endpoint、generative-ui、agent-page、ai-sdk

## 全站能力

- **cacheComponents 全站开启**(`next.config.ts`):取数默认动态,`"use cache"` + `cacheLife`/`cacheTag` 显式标记静态部分;**禁止**在薄壳导出 `export const dynamic` / `revalidate` 等旧 route segment config;动态 API(`cookies()`/`headers()`/`connection()`)必须待在 Suspense 洞内;渲染期不裸写 `new Date()`(进缓存产物或进洞)
- **Cmd+K 搜索**:`components/shell/SearchPalette.tsx`,注册表驱动的全站专题检索
- **面包屑与相关专题**:TopicPage 骨架必填 `path`,自动渲染面包屑;注册表 `related` 数组驱动页尾互链 chips
- **OG 图**:`app/opengraph-image.tsx` 动态生成,品牌文案取自 `config/site.ts`
- **理解检验页**:rsc-boundary / rendering / data 三个分类的 `/check` 末页,`components/topic/CheckList.tsx` 问答展开式自测
- **品牌 404 / 全局错误**:`app/not-found.tsx` 与 `app/global-error.tsx`
- **页面转场**:`experimental.viewTransition` + React 19.2 `<ViewTransition>`,顶栏与专题页方向感知转场
- **bundle 分析**:`ANALYZE=true` + `--webpack` 回退(`@next/bundle-analyzer`),报告输出到 `.next/analyze/`

## 如何新增一个专题

站点由 `config/topics.tsx` **注册表**单一驱动。App Router 的路由由文件系统决定,注册表只驱动导航与元信息——新增专题需要三步:

1. 新建 `topics/<category>/<name>/index.tsx` 编写专题内容,页面骨架用 `components/topic/TopicPage` 的 `TopicPage` + `TopicSection`;`TopicPage` 必填 `path`,且 `path`/`title`/`description` 必须与注册表逐字一致(契约测试会拦截漂移)
2. 新建 `app/<category.basePath 去掉前导斜杠>/<name>/page.tsx` **薄壳**:
   ```tsx
   import { getTopicMetadata } from "@/lib/topic-meta";
   import MyTopic from "@/topics/<category>/<name>";
   export const metadata = getTopicMetadata("/<basePath>/<name>");
   export default function Page() { return <MyTopic />; }
   ```
   cacheComponents 下薄壳**不再导出** `revalidate`/`dynamic`;缓存声明下沉到取数函数上的 `"use cache"` + `cacheLife`
3. 在 `config/topics.tsx` 的 `TOPICS` 数组注册一行(`path` 必须与 app/ 路由一致,可附 `related` 相关专题)

注册后顶栏、侧边栏、首页卡片、`<title>`/meta description、Cmd+K 搜索自动生效。`config/topics.test.ts` 的契约测试(117 条)会校验:path 唯一、category 合法、related 已注册且不自引、`app<path>/page.tsx` 与 `topics<path>/index.tsx` 存在、页头 path/title/description 与注册表同源。

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
pnpm -C packages/next-playground test        # 注册表契约测试(vitest run,纯 node 环境)
pnpm -C packages/next-playground analyze     # bundle 分析(ANALYZE=true + --webpack,报告在 .next/analyze/)
pnpm -C packages/next-playground start       # 生产模式启动(需先 build)
```

## 目录约定

- `config/site.ts` — **站点品牌单一数据源**(站点名 Next 权衡录 / Next Tradeoffs、slogan、论点、og 描述、SITE_URL);根 layout metadata、顶栏/页脚品牌区、首页 Hero、OG 图、sitemap/robots 全部从这里派生
- `config/topics.tsx` — **专题注册表(全站单一数据源)**;`config/topics.test.ts` 为其契约测试
- `app/` — App Router 薄壳路由 + Route Handler(`app/api/`);专题页不含内容,只导出 metadata;另有 `opengraph-image.tsx`、`not-found.tsx`、`global-error.tsx`、`sitemap.ts`、`robots.ts`
- `topics/<category>/<name>/` — 专题真实内容,co-locate 演示组件;category 为 `rsc-boundary` / `rendering` / `router` / `data` / `metadata` / `engineering` / `security` / `ai-native` 八类
- `components/` — 共享组件:`shell/SiteShell`(顶栏+侧边栏壳层)与 `shell/SearchPalette`(Cmd+K 搜索)、`topic/TopicPage`(专题骨架)与 `topic/CheckList`(理解检验)、`home/`(SpectrumHero/CategoryMap)、`ui/Panel`、`ThemeProvider`(class 策略暗色)
- `data/` — 静态 mock 数据与数据访问(`getPosts` 用 React `cache()` 记忆化)
- `lib/` — 工具:`utils.ts` 的 `cn()`;`topic-meta.ts` 的 `getTopicMetadata()`(品牌常量 re-export 自 `config/site.ts`)

## 技术栈

Next.js 16(App Router,cacheComponents 全站开启)+ React 19 + Tailwind CSS 4 + SWR;AI 专题依赖 `ai` / `@ai-sdk/react` / `zod`;测试用 Vitest 2(纯 node 环境);bundle 分析用 `@next/bundle-analyzer`。暗色模式为手写 ThemeProvider(class 策略,`localStorage` → `prefers-color-scheme` 兜底,body 内联脚本防闪烁)。
