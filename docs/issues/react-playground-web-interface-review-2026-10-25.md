# react-playground 界面设计合规审查报告(Web Interface Guidelines)

> 审查范围:`packages/react-playground` 全部约 200 个 UI 源文件(≈2.7 万行,含 `src/index.css`、`App.tsx`、`context/`、`components/`、`pages/`、七大专题分类)
> 审查基准:[vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)(104 条规则,审查当日拉取)
> 审查方式:6 路并行审查代理,逐文件全文核对,只报告实锤违规
> 审查日期:2026-10-25

---

## 0. 执行摘要

**共 98 处发现,归并为 14 类。** 站点整体底子不错(暗色模式 `color-scheme`、共享 `Input` 的焦点环替换、CheckList/CheckAnswer 的无障碍细节都到位),欠账集中在四个系统性问题:

1. **表单控件可访问名称大面积缺失**(约 30 处)——antd `Input`/`Switch`/`Segmented` 只靠 placeholder,无 `aria-label`/关联 label
2. **`transition-all` 反模式 + `outline-none` 弱替换 + hover/focus 态缺失**——交互反馈层的通杀问题
3. **全局缺 `prefers-reduced-motion` 兜底**——`index.css` 无 reduce 覆盖,`animate-pulse`/keyframes 全站无条件播放
4. **异步更新无 `aria-live` 播报**——日志流、请求结果、加载态屏幕阅读器静默

| 严重度 | 数量 | 代表问题 |
|---|---|---|
| 🔴 高 | ~45 | 表单控件无可访问名称;图标按钮无 aria-label;Menu 导航非真链接;异步更新无 aria-live;焦点落在隐形控件;删除无确认 |
| 🟡 中 | ~40 | transition-all ×13;focus-visible 缺失/过弱;reduced-motion 未遵守;tabular-nums 缺失;链接无 hover 态 |
| 🟢 低 | ~13 | 无效 ARIA(aria-label 写在 p/div 上);`...`→`…`;placeholder 缺结尾 `…`;硬编码金额格式;死按钮 |

---

# 第一部分:🔴 高优先级

## 1. 表单控件缺可访问名称(最普遍,约 30 处)

placeholder 不是 label。集中爆发点:

- `apps/bookkeeping/AddRecordForm.tsx:69` — 5 个 Form.Item 全无 label
- `performance/transition-deferred/` — Segmented/Slider/Input 大面积缺 `aria-label`:`InputLagDemo.tsx:97,104,119`、`StaleSearchDemo.tsx:81,90`、`TabSwitchDemo.tsx:82,93`
- `performance/suspense-ui/` — `BoundaryGranularityDemo.tsx:62`、`NoFallbackFlashDemo.tsx:64,75`
- `performance/react-compiler/components/MemoNoiseDemo.tsx:128`
- `basics/` — `ResetStateDemo.tsx:56`(email 还缺 `type="email"`/`autocomplete`),`:62`、`DynamicKeyDemo.tsx:41`、`IdentityExperiment.tsx:53`、`ListRenderDemo.tsx:50`、`PoolingHistoryDemo.tsx:65`、`SpecialCasesDemo.tsx:75`
- `hooks/` — Switch 无关联标签:`custom-hooks/composition/index.tsx:148`、`RequestDemo.tsx:34`、`ToggleDemo.tsx:23`、`use-effect/index.tsx:247`;Input:`composition/index.tsx:139`、`DebouncedDemo.tsx:33`、`LocalStorageDemo.tsx:25`
- `apps/shopping-cart/SearchBar.tsx:45`、`apps/todo/TodoComposer.tsx:38`、`TodoItem.tsx:97`、`advanced/view-transition-activity/components/LabPanel.tsx:90`

## 2. 图标按钮缺 aria-label

- `basics/jsx-render/components/ConditionalDemo.tsx:73,79`(-/+)
- `hooks/custom-hooks/playground/components/PreviousDemo.tsx:36,37`
- `apps/bookkeeping/RecordTable.tsx:81`(删除)

## 3. 导航不是真链接

- `App.tsx:171,202,242` — antd `Menu` 用 `onClick` + `navigate()`,失去 Cmd+click/中键新标签页。改用 `items` 的 label 渲染 `<Link>`

## 4. 异步更新无 aria-live 播报

- `components/Loading.tsx:10`(加 `role="status"`)
- `basics/jsx-render/components/AsyncStatusDemo.tsx:146`
- `performance/governance/implement/components/WaterfallDemo.tsx:67`
- `advanced/error-boundary/components/RethrowDemo.tsx:53`
- `hooks/custom-hooks/composition/index.tsx:61`
- `agent/agent-chat/components/EventLogPanel.tsx:67`

## 5. 键盘焦点落在隐形控件上

- `apps/todo/TodoItem.tsx:125,143` — 编辑/删除按钮 `opacity-0` 仅靠 `group-hover` 显现;补 `group-focus-within:opacity-100 focus-visible:opacity-100`

## 6. 危险操作无确认/撤销

- `apps/todo/TodoItem.tsx:142` — 单条删除即时生效(站点里"全部清空"已有两步确认,应对齐)

---

# 第二部分:🟡 中优先级

## 7. `transition:all` 反模式(13 处)

`components/BackToTop.tsx:66`、`components/TopicCard.tsx:34`、`apps/todo/TodoItem.tsx`(6 处)、`TodoComposer.tsx:44,50,67`、`TodoFilterBar.tsx:72`、`todo/index.tsx:257` → 改为 `transition-colors` / 显式列属性

## 8. focus-visible 缺失或过弱

- `outline-none` 仅靠 1px 边框变色(对比不足):`hooks/actions/components/ActionStateForm.tsx:72`、`FormActionBasic.tsx:68,123`、`FormStatusDemo.tsx:99` → 补 `focus-visible:ring-2`
- 完全无焦点样式:`performance/components/AmberTopics.tsx:25`、`SeriesNav.tsx:40`、`TodoFilterBar.tsx:67-80`、`todo/index.tsx:237-264`、`architecture/constraints/YieldCompare.tsx:22,29`
- `App.tsx:163` — skip link 用 `:focus` 而非 `:focus-visible`(轻微)

## 9. 动画未遵守 prefers-reduced-motion

根因:**`src/index.css` 没有全局 reduced-motion 覆盖**,`animate-pulse`/keyframes 全站无条件播放。

- `advanced/view-transition-activity/components/ManualTransitionDemo.tsx:41-47`、`TransitionTypePlayground.tsx:60-69`(keyframes 需包 `@media (prefers-reduced-motion: no-preference)`)
- `animate-pulse` → `motion-safe:animate-pulse`:`advanced/relay/components/UserDirectory.tsx:26`、`UserLookupDemo.tsx:143-144`、`basics/jsx-render/components/AsyncStatusDemo.tsx:39`、`agent/agent-chat/components/PartRenderer.tsx:24`

## 10. 跳动数字缺 tabular-nums

`performance/ai-native/agent-lab/components/AgentPipeline.tsx:263`、`lab/components/StreamRig.tsx:216`、`performance/lab/FrameMeter.tsx:72`、`advanced/view-transition-activity/components/LabPanel.tsx:97,102`、`ActivityLab.tsx:84-85`、`hooks/use-state/index.tsx:63`、`use-reducer/index.tsx:310`、`PreviousDemo.tsx:42`、`apps/bookkeeping/SummaryCards.tsx:37`

## 11. 链接/按钮缺 hover 态

`architecture/` 十个页面的 prose Link 无 hover(`map/index.tsx:43-55`、`fiber/index.tsx:31,96,101`、`events/index.tsx:50`、`double-buffer/index.tsx:52`、`render/index.tsx:93`、`runtime-map/index.tsx:149`、`scheduler/index.tsx:79`、`ssr/index.tsx:111`、`work-unit/index.tsx:68,72`、`constraints/index.tsx:54`);`basics/fn-vs-class/practice/WatchClass.tsx:103`、`WatchFn.tsx:44`

---

# 第三部分:🟢 低优先级

## 12. 无效 ARIA(`aria-label` 写在 `<p>`/`<div>` 上,AT 忽略)

`advanced/relay/components/UserDirectory.tsx:34`、`component-comm/playground/components/UrlStateDemo.tsx:59`、`component-comm/practice/index.tsx:244`、`error-boundary/components/BombWidget.tsx:36,59`、`ResetRecoveryDemo.tsx:33` → 删除即可

## 13. 排版/文案

- `...` → `…`:`Loading.tsx:12`、`shopping-cart/SearchBar.tsx:47`
- placeholder 结尾缺 `…`:`hooks/actions/ActionStateForm.tsx:70`、`use-effect/index.tsx:231`、`use-imperative-handle/index.tsx:92`、`use-reducer/index.tsx:258`、`use-ref/index.tsx:111`、`bookkeeping/AddRecordForm.tsx`
- email 输入缺 `autocomplete="email"`/`spellCheck={false}`:`hooks/actions/components/FormActionBasic.tsx:61,117`
- 硬编码金额格式:`performance/react-compiler/components/MemoNoiseDemo.tsx:68`、`shopping-cart/ProductList.tsx:27` → `Intl.NumberFormat`
- `components/CodeBlock.tsx:34` — `<code>` 加 `translate="no"`

## 14. 其他

- `apps/shopping-cart/ProductList.tsx:29` — "Remove" 是**死按钮**(无 onClick)+ 英文混入中文 UI
- `div onClick` 无键盘支持:`basics/event/components/BubblingDemo.tsx:50`、`SpecialCasesDemo.tsx:88`、`architecture/events/PathDemo.tsx:33-48`(均为冒泡演示本体,建议补 `tabIndex`/`onKeyDown` 或注释豁免)
- `hooks/use-reducer/index.tsx:154` — `<button role="checkbox">`,语义优先:用 `<input type="checkbox">`(轻微)

---

# 第四部分:✓ 做得好的(合规样本)

- `index.css` 有 `color-scheme: dark`;共享 `Input.tsx` 的 `outline-none` 配了正规 `focus-visible:ring` 替换
- `check/CheckList.tsx`/`CheckAnswer.tsx`:焦点环、`scroll-mt` 锚点、tabular-nums、text-pretty、touch-manipulation、reduced-motion 全齐
- `Home`/`NotFound`/`HeaderActions`/`TopicPage` 干净;错误文案含下一步指引
- `error-boundary` 的 `role="alert"`、`rsc/boundary` 的 `aria-pressed` 用法正确;`toLocaleString` 系列用法合规

---

# 第五部分:建议修复顺序

1. **全局一招鲜**:`index.css` 加 `@media (prefers-reduced-motion: reduce)` 全局兜底 + 给 antd `Input`/`Switch`/`Segmented` 封装一层默认带 `aria-label` 的包装组件 —— 两刀砍掉约一半发现
2. 修高优先级 1-6(可访问名称 / aria-live / 死按钮 / 删除确认)
3. 批量替换 `transition-all`、补 tabular-nums 和 hover/focus 态
