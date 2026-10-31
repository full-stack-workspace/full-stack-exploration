# vue-playground 站点建设方案

> 状态:**P0–P5 已全部实施完成**(2026-10-27),8 分类 41 专题页上线;工程验证(type-check / lint / test / build)与运行时抽查全绿。
> 日期:2026-10-27

## 1. 背景与目标

在 monorepo 新增第 8 个包 `packages/vue-playground`:一个 **Vite + Vue 3 + TypeScript + Pinia** 的专题学习站,定位与 react-playground(React 权衡录)对齐——按专题组织**可运行的对照演练**,而不是 API 罗列。

- 站点品牌:**Vue 权衡录 / Vue Tradeoffs**
- 与现有 `packages/vite-basic` 的关系:vite-basic 是 Vue 3 + Vite 最小工程演示,保持不动;vue-playground 是专题内容站,两者并存、定位不同
- 功能规划参照 `packages/react-playground`(注册表驱动、分类专题、理解检验、综合应用),但按 Vue 3 知识体系重新梳理

## 2. 技术选型

| 项 | 选择 | 理由 |
|---|---|---|
| 构建 | Vite 8 + `@vitejs/plugin-vue` | 与 vite-basic 一致,贴合仓库「Vite 学习」主题 |
| 框架 | Vue 3(`<script setup>` SFC)+ TypeScript strict + vue-tsc | 需求指定 |
| 路由 | vue-router 4(注册表驱动 + 懒加载) | 专题页按需加载 |
| 状态管理 | **Pinia**(官方)+ composables | 需求点名「Vue 相关状态数据管理」;Pinia 本身作为一个专题分类 |
| 样式 | Tailwind CSS 4(`@tailwindcss/vite`,`@theme` 令牌) | 与仓库多数包一致(react-playground 的 v3 是特例) |
| UI 组件库 | **Element Plus** + 手写基础组件 | 对照 react-playground 的 antd 角色:骨架/展示组件手写,复杂表单/表格用 Element Plus(评审确认) |
| 测试 | Vitest 2 + @vue/test-utils(jsdom) | 对齐 react-playground;注册表契约测试必备 |
| 端口 | **5176** | 5173/5174/5175 已被 vite-* 占用,3000-3002 被 next-*/react-playground 占用 |

## 3. 信息架构(Review 重点)

对应 react-playground 的分类思路,映射到 Vue 3 知识体系:

| 分类 | basePath | 专题(初版规划) |
|---|---|---|
| **basics 基础** | `/basics` | 模板语法与渲染(插值/指令/条件/列表与 key)· 事件与表单(v-model 修饰符/自定义组件 v-model)· 组件基础(props/emits/slots/SFC 与样式)· 生命周期 · 理解检验 |
| **reactivity 响应式** | `/reactivity` | ref vs reactive 取舍 · computed 与 watch/watchEffect · 响应式原理(Proxy/track/trigger 迷你实现)· nextTick 与批量更新 · shallow 家族与性能边界 · 理解检验 |
| **composables 组合式函数** | `/composables` | 深入梳理(设计原则,对照 react hooks/custom-hooks 三页专题)· 原子演练(8 个生产级 composable + 契约测试)· 组合实战 · 理解检验 |
| **advanced 进阶** | `/advanced` | 组件通信三页专题(props/emits → provide/inject → slots → URL → store)· 异步组件与 Suspense · Teleport 与 Transition · 自定义指令与插件 · 错误处理(errorCaptured)· 理解检验 |
| **state 状态管理** | `/state` | Pinia 核心(defineStore/getters/actions)· store 设计与模块化 · 持久化与跨页共享 · provide/inject vs Pinia 决策 · 理解检验 |
| **architecture 原理** | `/architecture` | 编译时与运行时分工 · 虚拟 DOM 与 Diff · 编译优化(Patch Flag/Block Tree/静态提升)· 渲染管线与调度器 · 理解检验 |
| **apps 综合应用** | `/apps` | 待办事项 · 购物车 · 记账本(与 react-playground 同名同需求,便于跨框架对照) |
| **performance 性能** | `/performance` | 懒加载与包体积 · keep-alive 与 v-memo · 大列表与虚拟滚动 · 响应式性能边界 · 理解检验 |

不照搬的 react-playground 内容:

- `agent`(React 的 useSyncExternalStore 衔接)、`Relay`(GraphQL)、`RSC`(React Server Components)在 Vue 侧无对应物,首版不做
- 后续可考虑 `/ecosystem` 分类(Nuxt、Vapor Mode、VueUse 等),不在首版范围

## 4. 目录结构(镜像 react-playground 约定)

```
packages/vue-playground/
├── index.html
├── vite.config.ts            # @vitejs/plugin-vue + tailwindcss + alias @ → src + port 5176
├── vitest.config.ts
├── tsconfig.json
├── eslint.config.js          # 包级 flat config(eslint-plugin-vue),不继承根 Next 向配置
├── package.json
├── README.md                 # 「新增专题 = 目录 + 注册一行」说明
└── src/
    ├── main.ts
    ├── App.vue               # 壳层:Header(品牌区+分类导航+md 以下抽屉)+ RouterView + Footer
    ├── index.css             # Tailwind v4 @theme 设计令牌(primary 色阶与 Vue 绿对齐)
    ├── config/
    │   ├── site.ts           # 品牌单一数据源(SITE_NAME/slogan/描述/SITE_URL)
    │   ├── topics.ts         # CATEGORIES + TOPICS 注册表(全站单一数据源)
    │   └── topics.test.ts    # 注册表契约测试(path 唯一/category 存在/目录存在)
    ├── router/index.ts       # 从 TOPICS 派生路由 + NotFound + afterEach 写 document.title
    ├── components/           # TopicPage/TopicSection/TopicCard/TopicNav/CodeBlock/Loading/BrandMark
    ├── pages/Home/           # 注册表驱动的分类分组导航 Hub
    └── topics/<category>/<name>/  # 专题内容,co-locate 演示组件与 mock
```

## 5. 关键机制(与 react-playground 一一对应)

- **注册表 ≠ 路由表手写两份**:路由从 `TOPICS` 派生,顶栏/首页卡片/页头标题/文档标题全部同源;新增专题 = 新建目录 + 注册一行
- **DocumentTitle 等价物**:vue-router `afterEach` 查注册表写 `document.title`,格式「专题 · 分类 · Vue 权衡录」
- **TopicNav**:多页专题页头互链横幅,配色取注册表分类主题(对照 react-playground 的 CategoryTheme.banner)
- **理解检验**:每个分类末页 `check/`(basics/reactivity/composables/advanced/state 优先)
- **暗色模式**:手写 class 策略(localStorage → prefers-color-scheme,index.html inline script 防闪烁),以 composable 暴露
- **壳层约定**:skip link 落点 `#main-content`、品牌区不占 h1、`/:pathMatch(.*)*` 渲染 NotFound(不静默跳回首页)

## 6. 根仓库改动

- 根 `package.json` 增加 `dev:vue-playground` / `build:vue-playground` / `preview:vue-playground`
- 根 `AGENTS.md` 增加 vue-playground 段落(架构与约定),包数量描述 seven → eight
- lint-staged 仿照 react-playground 补一条 vue-playground 包级 eslint 条目

## 7. 分期实施

| 期 | 内容 | 验收 |
|---|---|---|
| P0 脚手架 | 工程配置 + site.ts + 空注册表 + App 壳层 + Home + NotFound + 契约测试,根脚本接入 | `pnpm dev:vue-playground` 起站(5176);`type-check`/`test:run` 绿;根 `pnpm build` 不受影响 |
| P1 | basics 分类全部专题 + 理解检验 | 分类完整可浏览 |
| P2 | reactivity 分类(本站灵魂,优先于其他) | 同上 |
| P3 | composables + state(Pinia) | 同上 |
| P4 | advanced + apps(三个综合应用) | 同上 |
| P5 | architecture + performance | 同上 |

每期独立可交付,顺序可按 review 意见调整。

## 8. 评审决议(2026-10-27 已确认)

1. **UI 组件库**:引入 **Element Plus**,承担复杂表单/表格/抽屉等控件(对照 react-playground 的 antd);骨架与展示组件仍手写
2. **专题清单粒度**:basics 的「SFC 与样式」并入「组件基础」专题,不单独成页
3. **Vuex**:不做演示,仅在 state 分类的「provide/inject vs Pinia 决策」页提及其已进入维护期;一律使用最新技术架构
4. **端口**:5176
5. **品牌名**:沿用「权衡录」系列——Vue 权衡录 / Vue Tradeoffs

方案评审通过,进入 P0 脚手架实施。
