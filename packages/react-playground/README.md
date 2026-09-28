# React Playground · 专题练习场

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
| **React 基础** | JSX 渲染、事件、列表 key,以及函数组件如何覆盖类组件能力 |
| **Hooks** | 内置 Hook 逐个击破,再组合成领域 Hook(`useUserSearch` 等) |
| **进阶专题** | Context、Error Boundary、组件通信决策、Relay 数据层 |
| **综合应用** | Todo / 记账 / 购物车 — 把上面的判断落到一块完整 UI |
| **Agent 实战** | SSE → Runtime Store(不依赖 React)→ `useSyncExternalStore` → UI |
| **性能优化** | Transition / Deferred / Suspense 的渲染竞态,对着帧条图看卡顿从哪来 |

三页系列(梳理 → 对照演练 → 实战)是这个站点的默认深度,例如:

- 组件通信:`/topics/advanced/component-comm-guide`
- 函数组件与类组件:`/topics/basics/fn-vs-class-guide`
- 自定义 Hooks:`/topics/hooks/custom-hooks-guide`
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
pnpm -C packages/react-playground build
pnpm -C packages/react-playground relay         # 重新生成 Relay artifacts
```

## 如何新增一个专题

站点由 `src/config/topics.tsx` **注册表**单一驱动。新增专题只需两步:

1. 新建 `src/topics/<category>/<name>/index.tsx`,默认导出页面组件
   - `<category>` 为 `basics` / `hooks` / `advanced` / `apps` / `agent` / `performance` 之一
   - 页面骨架使用 `TopicPage` / `TopicSection`(见 `src/components/TopicPage.tsx`)
   - 站内跳转一律用 `Link` / `useNavigate`,不要写 `<a href>`
2. 在 `TOPICS` 数组中注册一行(`path` 必须是 `<category.basePath>/<name>`)

注册后路由、侧边栏、首页卡片自动生效;`pnpm test:run` 里的注册表测试会校验 path 唯一性、分类合法性。综合应用放在 `apps` 分类下,同样走注册表。

三页系列(guide / playground / practice)的约定见仓库 `AGENTS.md` 中 react-playground 一节。

## 技术栈(知道即可)

Rsbuild 1 + React 19 + TypeScript strict。UI 用 Tailwind CSS 3 + Ant Design 6;路由是 React Router 6;GraphQL 走 React Relay 19;测试是 Vitest + Testing Library,覆盖率门槛 70%。

这不是脚手架演示,也不是组件库。打开首页,挑一个你正在犹豫的专题,点进去对照。
