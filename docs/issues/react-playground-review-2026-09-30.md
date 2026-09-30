# react-playground 深度诊断报告与优化计划

> 诊断范围：`packages/react-playground`（Rsbuild + React 19 + antd 6 + Tailwind 3 + Relay 19 + Vitest，235 个源文件 / 65 个测试文件 / 注册专题 59 个）
> 诊断维度：站点设计与品牌传播、专题划分与内容组织、子专题演示质量、代码质量与工程化
> 诊断方式：3 路并行只读探查 + 实跑 `type-check` / `lint` / `test:run` / `test:coverage`

---

# 第一部分：诊断报告

## 0. 执行摘要

**总体结论**：工程质量远高于一般学习项目（注册表单一数据源、系列导航、检验体系、286 个测试用例全绿、type-check 0 错误），internals/performance 两大分类是可复制的模范范式。主要欠账集中在四处：**品牌与传播层几乎裸奔**（通用名 + 零社交元信息）、**React 19 旗舰特性零专题**、**pre-commit lint 对本包完全失效**、**Relay 页与 apps 分类的质量断层**。

| 严重度 | 数量 | 代表问题 |
|---|---|---|
| Critical | 1 | pre-commit 钩子对本包静默失效 |
| High | 6 | 品牌名无差异化；零 og/twitter 元信息；SPA 无预渲染缓解；apps+relay 暗色模式失效；test:coverage 红线（functions 60.5% < 70%）；Tailwind v3/v4 混装 |
| Medium | 12 | slogan 与内容错位；品牌名 6 处硬编码；RSC 深度倒挂；NavBanner 两代范式并存；relay 网络层 any 塌陷；测试分布不均 等 |
| Low | 10+ | basePath 两套体系；status 死字段；双 h1；死依赖 ×2；TODOS.md 腐坏 等 |

---

## 1. 站点设计与品牌传播

### 1.1 品牌与命名（用户已知问题，确认且比预想更严重）

站点名/slogan 出现的全部位置（改名的影响面清单）：

| 位置 | 现有文案 |
|---|---|
| `index.html:13` | `<title>React Playground · 生产级工程决策</title>` |
| `index.html:10` | description：「把生产里的判断写成可运行的对照……按专题展开」 |
| `rsbuild.config.ts:14` | html title 第三处硬编码 |
| `src/App.tsx:66,68` | 顶栏品牌大字 + 副标语「生产级工程决策」 |
| `src/components/DocumentTitle.tsx:18,21` | `SITE_NAME` / `HOME_DOCUMENT_TITLE` |
| `src/pages/Home/index.tsx:46,48-55` | Hero 眉题 + 主标「把生产里的判断 / 写成可运行的对照」+ 副文 |
| `README.md:1,3` | 「React Playground · 专题练习场」（与 title 又不一致，三名并存） |

发现的问题：

- **【高】「React Playground」完全无差异化**。同名/近名项目极多（reactplayground.com、CodeSandbox 模板、GitHub 大量同名 repo），搜索与口头传播都无法被检索到；站点的真实定位（中文原创、体系化 59 专题、对照实验形态）在名字里零体现。
- **【高】slogan「生产级工程决策」抽象且与内容错位**——像架构咨询站，而真实卖点是可交互对照实验。首页 Hero 那句「把生产里的判断写成可运行的对照」准确得多，却被降级为 h1，抽象 slogan 反占据 title/顶栏/标签页三个最强曝光位。
- **【中】品牌名硬编码 6 处无单一数据源**，改名易漏（`DocumentTitle.tsx:17` 注释自称"保持一致"但靠人肉）。
- **【中】Hero 信息层级倒置**：独特主张埋在副文，首屏无 CTA 主按钮；且 **Hero 统计「56 工程专题」疑似过期硬编码**（`Home/index.tsx:25-28`），注册表实际已有 59 个专题——需核实并改为从注册表派生。

### 1.2 SEO 与分享传播（口碑最大的技术短板）

- **【高】零社交分享元信息**：`index.html:4-15` 无 `og:*`、无 `twitter:card`、无 canonical。微信/Twitter/飞书粘贴链接没有任何卡片预览。
- **【高】SPA 局限无缓解**：无预渲染/SSG、`public/` 无 robots.txt 与 sitemap.xml，59 个专题页对爬虫是同一个空壳；分享任一专题链接，预览都是首页通用 description。
- **【中】5 个「理解检验」页 document.title 完全相同**（`DocumentTitle.tsx:31-32` 只拼 `topic.title`）：浏览器历史/书签/标签页无法区分，title 在 SEO 上重复。应拼为「理解检验 · Hooks · 站点名」。
- **【低】keywords 价值趋零且不全**；缺 `theme-color`、apple-touch-icon。

### 1.3 首页与导航信息架构

- **【中】移动端导航弱**：顶栏 7 个中文分类在 md 宽度靠 antd Menu 省略号折叠（被折叠项无提示、发现性差），无抽屉导航；Sider 在 lg 以下收成 0 宽（`App.tsx:147`），窄屏只剩首页卡片一条路。
- **【中】5 张「理解检验」同名卡片**出现在首页网格（`TopicCard.tsx:47` 只显示 title），只有 1.5px 色点区分。
- **【低】basePath 两套体系**：basics/hooks/advanced 用 `/topics/<x>`，internals/performance/agent/apps 用裸前缀（`topics.tsx:88-167`），URL 不可预测。
- **【低】无 404 页**：兜底路由静默 `Navigate to="/"`（`App.tsx:215`），输错 URL 无感知；LEGACY_REDIRECTS 完备性无机制保证。
- **【低】Hero 统计单薄**：没突出 README 反复强调的差异化资产（60 道机制问答、8 个生产级 Hook、三页系列 ×4）。首页完全没有「三页系列」直达区——「梳理→演练→实战」是站点最强结构却只存在于 README。

### 1.4 视觉与交互一致性

做得好的（值得保留）：`tailwind.config.js:16-26` primary 色阶与 antd `colorPrimary: #4f46e5`（`AppProviders.tsx:19`）有纪律地对齐；分类色彩体系成体系（注册表 `CategoryTheme` 四件套，basics=indigo / hooks=violet / advanced=sky / internals=cyan / performance=amber 一一对应）；TopicPage/TopicSection 骨架统一；暗色模式有完整基建（ThemeProvider + 防闪烁脚本 + antd darkAlgorithm）。

问题：

- **【高】暗色模式在 4 页完全失效**：`topics/apps/` 全部三页 + `advanced/relay/index.tsx` 有 **0 个 `dark:` 类**，不套 TopicPage 骨架、自带 h1（如 `todo/index.tsx:50` 写死 `text-slate-900`）。暗色下对比度崩坏，恰是「综合应用」整分类 + Relay。
- **【中】双 h1**：顶栏品牌区 `<h1>`（`App.tsx:65`）+ TopicPage `<h1>`（`TopicPage.tsx:40`）+ 首页 Hero 再一个，每页恒定 2-3 个 h1。
- **【中】status 徽标纯噪音**：`TopicCard.tsx:21-25` 三态徽标 + 注册表 `status` 字段（`topics.tsx:38,49`），但 59 个专题无一设置，56+ 张卡片全挂绿色「已完成」，信息量为零。
- **【低】NavBanner 同构代码 4 份**（fn-vs-class / custom-hooks / component-comm / rsc 各自手写、仅配色不同），色系明明已在 `CategoryTheme` 里，应公共化。
- **【低】BrandMark 图形语义弱**（两页纸叠放，16px favicon 糊成色块），改名后建议一并重设计。

### 1.5 可访问性

基础意识不错（30+ 处 aria-label、SeriesNav 用 `<nav aria-label>`、专门修过 sr-only 副作用）。问题：

- **【中】无 skip link**：键盘用户每页先 Tab 过 7 项顶栏 + 整个侧边栏。
- **【中】嵌套 `<main>`**：`shopping-cart/index.tsx:44` 在 antd Content 的 `<main>` 内又手写一个。
- **【低】中英混用个别断裂**：「已完成/进行中」徽标 vs「开始练习」CTA vs title「工程决策」三个语境。

---

## 2. 专题划分与内容组织

### 2.1 注册表与路由架构（健康，小瑕疵）

- 617 行注册表是名副其实的单一数据源；`topics.test.ts:17-60` 有 7 条完整性测试；注册表与目录结构完全一致，**无孤儿页、无空注册**。
- 【低】internals 检验页路径是 `/internals/interview`，其余四分类统一 `/check`，目录名同样分叉。
- 【低】导出约定有例外：README 要求默认导出页面组件，`apps/shopping-cart` 却是命名导出 + `.then` 适配（`topics.tsx:482-486`）。

### 2.2 分类体系合理性

七分类边界大体清晰，internals/performance 的分类级 AGENTS.md 显式声明了「不重复讲 X」的边界，值得肯定。顺序 basics→hooks→advanced→internals→performance→agent→apps 本身是合理学习梯度。

- **【中】RSC 放 basics 深度倒挂**：涉及 Server Action 鉴权、载荷安全、边界下沉（`rsc/guide/index.tsx:400,537`），难度远高于同分类的 Fragment（83 行薄页）。建议挪 advanced 或标注「进阶」。
- **【中】agent 与 performance/ai-native 相邻却互不相链**：一个讲 SSE→Store→UI 集成，一个讲 TTFT/TTFUI 指标，都在教「AI 应用的前端」但页面无交叉引用。
- **【低】分类体量悬殊**：performance 15 页 vs agent 2 页 vs apps 3 页；agent 作为顶栏一级分类只有「梳理页+演练页」，更像一个专题。

### 2.3 React 19/19.2 覆盖空白（内容最大欠账）

已覆盖：use()（读 Context）、Server Actions 规则（仅 prose）、React Compiler（仅口头提醒）。
**完全没有专题的**（package.json 装的是 react ^19.2.1，可演示但缺席）：

1. **React 19 Actions 全家桶（高优先）**：`useActionState` / `useOptimistic` / `useFormStatus` / form action——只出现在问答题干里（`hooks/check/rest.ts:476`），React 19 头牌特性全站零演示；SPA 内可用乐观更新 + mock 延迟演示。
2. **`<ViewTransition>` 与 `<Activity>`（高）**：仅 fn-vs-class guide 表格一句带过（`guide/index.tsx:362`）。
3. **React Compiler 专题（高）**：三个页面都在口头说「本包没开 Compiler」（`use-memo/index.tsx:12`、`use-callback/index.tsx:404`、`hooks-impl/index.tsx:104`）——恰恰说明需要一个专题把「开/不开的判断、ESLint 诊断、手写 memo 何时变噪音」落成页面。
4. `useEffectEvent`（中）：目前只是 use-ref 的一句话引用（`use-ref/index.tsx:365`）。
5. 表单专题（中）：受控/非受控、校验时机、key 重置表单。
6. `use(promise)` 与 Suspense 数据获取（中）：suspense-ui 只演示了 lazy。
7. Profiler / 渲染耗时测量（低）：performance/lab 已有 FrameMeter 基建，差一页讲 `<Profiler>` API 与 DevTools。

### 2.4 多页专题范式一致性（两代并存）

- **模范**：internals 与 performance——集中 `series.ts` 单一目录 + SeriesNav 组件 + `series.test.ts` 防漂移 + `pages.test.tsx` 冒烟 + 分类级 AGENTS.md。
- **次代**：fn-vs-class / component-comm / custom-hooks——NavBanner 路径硬编码在组件里（如 `fn-vs-class/components/NavBanner.tsx:21-25`），**无 series.ts 无防漂移测试**，改注册表路径后 banner 静默失效。
- 【低】custom-hooks 共享组件位置倒挂：guide/composition 从 `../playground/components/NavBanner` 导入。
- 【低】agent 分类互链是内联玫瑰色横幅（`agent-chat/index.tsx:175-185`），没有用任何抽象。

### 2.5 学习路径与引导

- **【中】无显式学习路径**：注册表无前置依赖/难度元信息（`status` 字段闲置正好可以改造），59 个专题平铺，新手只能猜顺序；跨分类路径只散落在个别 Link 里。
- 【低】agent 与 apps 无检验页（有意豁免但未声明）。
- 【低】`src/TODOS.md` 已腐坏：3 条 ref 相关 TODO 对应专题早已建成，真实内容债（Relay 单薄、19.2 缺席）无人记录。

---

## 3. 子专题演示质量抽查

| 专题 | 评价 |
|---|---|
| basics/list-key | **模范**：双栏错位实验→三条规则→key 重置→渲染期生成 key 的坑→速查；反模式一律 ❌/✅ 对照标注 |
| hooks/use-effect | **好**：FlowList 时序图 + DepsProbe 交互探针，明确提示 StrictMode 双跑 |
| internals/fiber | **好**：术语现代（flags/subtreeFlags，主动纠正 effectTag 旧说法），步进遍历演示 |
| performance/transition-deferred | **好**：三场景 + FrameMeter 帧条实证，跨专题复用 useRequest |
| agent/agent-chat | **好**：完整 SSE→Store→UI 链路，RenderBadge 实证精准订阅 |
| advanced/relay | **明显低于全站水准**：纯静态列表零交互；不用 TopicPage 骨架；无文件级 JSDoc、无 memo/displayName、无测试；与「每个专题都是可点的对照实验」的站训相悖 |

其他：

- 【低】fragment 页有过时代码：`className="contents-none"` 不是真实 Tailwind 类（死类名，`fragment/index.tsx:19`）；`closest('div')!` 脆弱断言；83 行单 Section 偏薄。
- 【低】hooks 分类测试不齐：use-state（365 行）与 use-reducer（545 行）两个大页偏偏没有 co-located 测试。
- 正面：过时说法（事件池、effectTag、虚拟 DOM）都在页面里被主动纠正并标注版本，误导性内容处理得好。

---

## 4. 代码质量与工程化

静态检查实测：`type-check` 0 错误；`lint` 0 error / 26 warning；`test:run` 65 文件 286 用例全绿（15.1s）；**`test:coverage` 退出码 1**。

### 4.1 工程红线

- **【Critical】pre-commit lint 对本包完全失效**：根 `eslint.config.mjs:158` 用 `globalIgnores` 排除整个包，而 lint-staged 从仓库根执行走根配置 → 提交本包代码时 eslint 被静默跳过（`--no-warn-ignored` 吞掉提示），包级 `eslint.config.js` 只有手动跑才生效。husky 覆盖形同虚设。
- **【High】`test:coverage` 是红的**：functions 60.53% < 70% 阈值（`vitest.config.ts:38-43` 自己定的），说明阈值设定后从未纳入验证。
- **【High】Tailwind v3/v4 混装**：`@tailwindcss/postcss ^4.1.17`（`package.json:41`）与 `tailwindcss ^3.4.10` 并存；`postcss.config.js:3` 实际用 v3 插件，全包零引用 → 死依赖 + 将来双版本混用风险。

### 4.2 依赖与配置

- 【中】确证死依赖：`ts-node`、`happy-dom` 全包零引用。
- 【中】`vitest.config.ts:62-66` 的 `@` 别名是死配置：tsconfig 无 paths、全 src 零 `@/` 导入、rsbuild 也未配别名——配置/文档（AGENTS.md 声称有 `@/` 别名）/代码三者漂移。二选一：删别名或补齐迁移。
- 【中】vite ^5 是 vitest 2 的必需依赖（非死依赖），但与根目录 vite ^8 共存，需注释说明用途。
- 【低】Relay artifact 当前与源码同步，但 `pnpm relay` 未接入 build/dev/CI 任何环节。

### 4.3 共享代码与反模式

- 【中】`relay/Environment.ts:5,7,28,30,59` 网络层类型塌陷（5 处 `any`），可用 relay-runtime 的 `RequestParameters`/`GraphQLResponse` 收口。
- 【中】`hooks/useLocalStorage.ts:26-41` 潜伏 bug：`key` 变化时旧 value 会被写入新 key 且不重读（当前调用方都用常量 key 未触发，但签名暴露了 key 参数）。
- 【低】`AppErrorBoundary.tsx:22-41` state 初始化写两遍；`test/setupTests.ts:59-69` 注释说"过滤 React 18 警告"（项目已是 19）且 act 过滤会吞真实问题；`test/utils.tsx:53-56` 的 `createMockFunction` 无人使用。
- 26 条 lint warning 分布：`curly` ×12（`pnpm fix` 可自动修）、`no-explicit-any` ×7、非空断言 ×3、`no-console` ×2、exhaustive-deps ×2。
- 反模式扫描健康：useEffect 缺依赖 0、`dangerouslySetInnerHTML` 0、forwardRef 0、`@ts-ignore` 仅 relay 自动生成物；`key={index}` 8 处多为故意的教学对照。

### 4.4 测试基建

- 【中】分类分布不均：internals 29 个源文件仅 4 个测试，basics 7/42、agent 3/16 偏薄；hooks/performance/apps 较好。
- 【中】antd Table 在 jsdom 下大量刷 `Not implemented: getComputedStyle` stderr 噪音，应在 setupTests 补 mock。
- 【低】bookkeeping 集成测试单文件 12.9s（占全套近 1/3）。

---

## 5. 品牌重命名专项

站点真实差异化资产：**中文原创、体系化（7 分类 59 专题）、「对照实验」形态（对/错实现并排）、三页系列深度（梳理→演练→实战）、覆盖到 Fiber/性能治理/AI-Native 的前沿广度**。命名应放弃通用词，在「React + 中文记忆点 + 对照/练习/决策语义」交叉处找。

候选方向：

1. **「React 演武场」系**——「演武」精准传达「练习+对照比武」双义，中文社区辨识度高，搜索几乎无竞争。slogan：「同一道题，两种写法，跑给你看」。
2. **「对照 React / React in Contrast」系**——直接品牌化最强形态「对照实验」。slogan：「每个决策，都有反例陪跑」。
3. **「React 决策实验室」系**——保留现有「决策」资产 + 「实验室」可运行语义。slogan 直接征用现成好文案：「把生产里的判断，写成可运行的对照」。
4. **「React 深水区」系**——打 Fiber/Scheduler/性能治理深度定位，与入门教程区隔。slogan：「文档教你能做什么，这里练该选哪条」。
5. **「React 练功房 / React Dojo」系**——契合「专题+理解检验+星级题」的道场结构，亲和易传播。

与命名解耦、可先行的文案动作：

- slogan 改为 Hero 现成的「把生产里的判断，写成可运行的对照」（全站唯一同时包含生产/判断/可运行/对照四个差异点的句子）。
- README 首句「React 文档告诉你 API 能做什么，这个站点练的是另一件事」是对外介绍的最佳 elevator pitch，建议提升为 og:description。
- 品牌名收敛到 `config/site.ts` 单一数据源，一次改净 6 处硬编码。

---

## 6. 优化路线图（建议优先级）

**P0 — 工程红线（先止血）**
1. 修 lint-staged：按包分派，`packages/react-playground/**` 走包级 eslint。
2. test:coverage 红线：补测试到 70% functions，或调阈值 + 建爬坡计划。
3. 删死依赖 `@tailwindcss/postcss` / `ts-node` / `happy-dom`。

**P1 — 传播与品牌（用户痛点）**
4. 补 og/twitter 全套 meta + og 图；robots.txt / sitemap。
5. 定新品牌名 → `config/site.ts` 单一数据源 → 6 处硬编码改净 → BrandMark/favicon 重设计。
6. 修暗色盲区 4 页（apps ×3 + relay，套 TopicPage 骨架 + 补 dark: 类）。
7. 修「理解检验」重名：DocumentTitle 拼分类前缀；首页卡片同步。
8. Hero 统计改为注册表派生；增加「三页系列」直达区与 CTA。

**P2 — 内容补强**
9. React 19 Actions 专题（useActionState/useOptimistic/useFormStatus）。
10. `<ViewTransition>` + `<Activity>` 专题。
11. React Compiler 专题。
12. Relay 页重做（交互化 + 骨架回归）。
13. 互链机制统一：NavBanner 公共化或三页专题补 series.ts + 防漂移测试。

**P3 — 打磨**
14. basePath 统一（LEGACY_REDIRECTS 消化迁移）；interview→check；404 页。
15. 学习路径元信息（prerequisites / orderHint）；status 字段激活或删除。
16. relay 网络层 any 收口；useLocalStorage key 语义；测试补强 internals/basics/agent。
17. 清 TODOS.md → 换成真实内容路线图；`pnpm fix` 清 12 条 curly 警告。

---

# 第二部分：本次执行计划

本计划的交付物是**诊断报告落盘**（本文件即报告全文），便于后续引用与跟踪。

## 步骤

1. 将上述报告（第一部分全文）写入 `docs/issues/react-playground-review-2026-09-30.md`（遵循 code-health-check 技能的报告归档约定，目录不存在则创建）。
2. 不做任何源代码修改——所有优化项留给后续按路线图分批实施。

## 验证

- 文件写入后用 Read 复核完整性。
- 报告中的 文件:行号 引用已在诊断阶段经探查代理实际读文件验证。

---

# 附录：修复执行记录（2026-09-30 当日完成）

## 已解决（对照路线图）

**P0 工程红线** ✅ 全部完成
1. lint-staged 按包分派：根 package.json 新增 `packages/react-playground/**` 专属键，shell 包装 cd 进包目录加载包级 flat config（探针实测包级 curly 规则生效）
2. coverage 红线：functions 60.53% → **70.12%**（新增 40+ 用例：agent runtime/script、internals demos、fragment/jsx-render、use-state/use-reducer 等），四条阈值全绿
3. 死依赖 `@tailwindcss/postcss`/`ts-node`/`happy-dom` 已删；vite ^5 注释说明；vitest 死 `@` 别名已删；`prebuild` = `relay-compiler && node scripts/gen-sitemap.mjs`

**P1 传播与品牌** ✅ 全部完成
4. og/twitter 全套 meta + 1200×630 og.png（已目检）+ robots.txt + sitemap.xml（60 URL，构建期从注册表生成）+ theme-color + apple-touch-icon
5. 品牌改名 **React 权衡录 / React Tradeoffs**（首版为「演武场」，复审后定为权衡录），slogan「把生产里的判断，写成可运行的对照」；收敛到 `src/config/site.ts` 单一数据源，6 处硬编码清零（index.html 经 rsbuild templateParameters 注入）；BrandMark/favicon 重设计（对阵取舍意象）
6. 暗色盲区修复：apps 三页 + relay 页全量 dark: 适配并套 TopicPage 骨架（84 处 dark: 类）
7. 「理解检验」重名：DocumentTitle 改为「专题 · 分类 · 站点名」，TopicCard 同名自动加分类前缀（含防回归测试）
8. Hero 统计注册表派生 + 主 CTA + 三页系列直达区

**P2 内容补强** ✅ 全部完成
9. React 19 Actions 专题 `/hooks/actions`（form action/useActionState/useOptimistic/useFormStatus，5 Section + 5 测试）
10. ViewTransition + Activity 专题 `/advanced/view-transition-activity`（实测 19.2 stable 未导出 ViewTransition/addTransitionType → 讲解形态；Activity 三栏对照实验真实运行）
11. React Compiler 专题 `/performance/react-compiler`（memo 噪音对照实验 + 四步判断框架，已入 series.ts）
12. Relay 专题重做：fragment colocation + 变量查询缓存实验，5 Section + 测试；Environment.ts 5 处 any 清零；修复 mock 数据 User/Post id 撞车违反归一化的潜伏 bug
13. 互链统一：新共享组件 `TopicNav`（色系取注册表 CategoryTheme.banner），消灭 4 份 NavBanner + agent 内联横幅共 13 处迁移，新增防漂移测试

**P3 打磨** ✅ 大部分完成
14. basePath 统一裸前缀（/basics /hooks /advanced）；RSC 从 basics 挪到 advanced；LEGACY_REDIRECTS 收敛为 `src/config/legacy-routes.ts`（纯函数 + 5 用例测试，含通配迁移）；404 NotFound 页
15. status 死字段与徽标已删；双 h1、skip link、移动端 Drawer、嵌套 main 已修
16. relay any 收口 ✅；useLocalStorage key 变更语义修复 + 3 条新测试 ✅；internals/basics/agent 测试补强 ✅
17. TODOS.md 重写为内容路线图；12 条 curly 清零；setupTests 删掉吞 act 警告的过滤 + 补 getComputedStyle stub；fragment 死类名/脆弱断言已修

## 未做 / 后续项
- internals/interview → check 改名（题库引用多、收益低，暂缓；AGENTS.md 已注明现状）
- 学习路径 prerequisites 元信息（首页已加三页系列直达区作为折中）
- SITE_URL 留空：部署后填 `src/config/site.ts` 重建即可（og:image/sitemap/robots 三处占位均有注释）
- 表单专题、use(promise)+Suspense 数据获取、useEffectEvent、Profiler 页、agent 分类扩充：见 src/TODOS.md 内容路线图

## 终验数据（2026-09-30）
type-check 0 错误 | lint 0 error / 4 warning（基线存量）| **78 测试文件 / 365 用例全绿** | coverage functions 70.12% / lines 81.28% / branches 86.21% / statements 81.28% | build 成功 + preview 冒烟通过（新 title/路由/og.png 均 200）
