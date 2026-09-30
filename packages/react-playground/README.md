# React 权衡录 · React Tradeoffs

> 把生产里的判断，写成可运行的对照。

React 文档告诉你 API **能做什么**。这个站点练的是另一件事:**生产里该选哪条路,以及为什么不选另外几条。**

每个专题都是可点的对照实验,而不是一页说明书。你改开关、看渲染结果、对照源码,再读旁边那几句「什么时候别用」。站点按专题注册表驱动,路由、导航、首页卡片同源,打开就能练。

本地默认跑在 [http://localhost:3002](http://localhost:3002)。

## 为什么值得打开

- **先动手,再下判断。** 同一场景常有对/错两套实现并排:props 下钻 vs 组合、同步 State vs URL、类组件生命周期 vs Hooks。差别写在 UI 上,不写在注释里。
- **练的是通道选择,不是 API 背诵。** 组件通信、函数组件 vs 类组件、自定义 Hooks、渲染调度都按「四问 / 梯子 / 反模式」组织,读完能回答「这个状态该放哪」。
- **专题互相指路。** Context、外部 Store、Relay、Error Boundary 各自成篇。新专题用卡片链到已有机制,避免同一概念讲两遍。
- **信息架构是单一数据源。** `src/config/topics.tsx` 一份注册表派生路由、顶栏、侧栏、首页。加专题 = 新建目录 + 注册一行。

## 站点里有什么

| 分类 | 你能练到什么 |
|------|----------------|
| **React 基础** | JSX 渲染、事件、列表 key、函数组件如何覆盖类组件能力;末页用问答检验这几块(RSC 题保留,专题本身在进阶) |
| **Hooks** | 内置 Hook 与 React 19 Actions 逐个击破,再组合成领域 Hook(`useUserSearch` 等);末页用问答检验,较难题标星级和考察点 |
| **进阶专题** | Context、Error Boundary、组件通信决策、Relay 数据层、RSC 与 Client Component 的边界(练习场内只做规则示意)、ViewTransition 与 Activity;末页用问答检验通道和失败边界 |
| **内部机制** | Fiber、Render / Commit、更新队列、Hooks 链表、Scheduler、事件委托与水合示意,以及六十道问答,用来检验前面的梳理是否掌握 |
| **性能优化** | 原则约定、指标(含 AI-Native / Agent)、架构分区、实现规则、排查与上线档案;渲染调度仍是实现阶段的一块;React Compiler 单独一页讲开/不开的判断;末页用问答检验体系,资深题标星级和考察点 |
| **Agent 实战** | SSE → Runtime Store(不依赖 React)→ `useSyncExternalStore` → UI |
| **综合应用** | Todo / 购物车 / 记账 — 把上面的判断落到一块完整 UI |

三页系列(梳理 → 对照演练 → 实战)是这个站点的默认深度,例如:

- 组件通信:`/advanced/component-comm-guide`
- 函数组件与类组件:`/basics/fn-vs-class-guide`
- 自定义 Hooks:`/hooks/custom-hooks-guide`
- 渲染调度:`/performance/render-scheduling-guide`

## 本地运行

在仓库根目录安装依赖后:

```bash
pnpm install
pnpm dev:playground
```

或只启动本包:

```bash
pnpm -C packages/react-playground dev
```

常用命令:

```bash
pnpm -C packages/react-playground test:run      # CI 模式单测
pnpm -C packages/react-playground type-check
pnpm -C packages/react-playground build         # prebuild 会依次跑 relay-compiler 与 scripts/gen-sitemap.mjs(生成 public/sitemap.xml)
pnpm -C packages/react-playground relay         # 重新生成 Relay artifacts
```

品牌文案(站点名 / slogan / og 描述)集中在 `src/config/site.ts`,构建时注入 HTML 标题与分享元信息;部署后记得在 `site.ts` 填 `SITE_URL`,og:image 与 sitemap 依赖它输出绝对 URL。

## 如何新增一个专题

站点由 `src/config/topics.tsx` **注册表**单一驱动。新增专题只需两步:

1. 新建 `src/topics/<category>/<name>/index.tsx`,默认导出页面组件
   - `<category>` 为 `basics` / `hooks` / `advanced` / `apps` / `agent` / `performance` 之一
   - 页面骨架使用 `TopicPage` / `TopicSection`(见 `src/components/TopicPage.tsx`)
   - 站内跳转一律用 `Link` / `useNavigate`,不要写 `<a href>`
2. 在 `TOPICS` 数组中注册一行(`path` 必须是 `<category.basePath>/<name>`)

注册后路由、侧边栏、首页卡片自动生效;`pnpm test:run` 里的注册表测试会校验 path 唯一性、分类合法性。综合应用放在 `apps` 分类下,同样走注册表。分类 basePath 一律是裸前缀(`/basics`、`/hooks`、`/advanced` 等);`/topics/<key>/*` 旧路径由 `src/config/legacy-routes.ts` 的通配规则 301 迁移。

多页专题的页头互链横幅统一用共享组件 `src/components/TopicNav.tsx`,链接目录放在专题内的 `nav.tsx`(如 `topics/basics/fn-vs-class/nav.tsx`),`TopicNav.test.tsx` 会校验每个 `to` 都在注册表里。internals / performance 两个长系列仍用各自的 `series.ts` + SeriesNav。

三页系列(guide / playground / practice)的约定见仓库 `AGENTS.md` 中 react-playground 一节。

## 技术栈(知道即可)

Rsbuild 1 + React 19 + TypeScript strict。UI 用 Tailwind CSS 3 + Ant Design 6;路由是 React Router 6;GraphQL 走 React Relay 19;测试是 Vitest + Testing Library,覆盖率门槛 70%。

这不是脚手架演示,也不是组件库。打开首页,挑一个你正在犹豫的专题,点进去对照。
