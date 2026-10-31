# [P1][M][fix][frontend] Add accessible names to unlabeled form controls

## Problem

全站约 30 处表单控件(antd `Input` / `Switch` / `Segmented` / `Slider` / `Form.Item`)只有 placeholder 或旁边的视觉文本,没有 `aria-label` 或关联的 `<label>`。屏幕阅读器用户无法得知这些控件的用途;placeholder 在输入后消失,不能替代 label。这是审查中发现量最大的一类问题。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 1 类。

## Scope

为以下控件补上可访问名称(`aria-label` 或 `<label htmlFor>`):

- `apps/bookkeeping/AddRecordForm.tsx:69` — 5 个 Form.Item 加 `label`
- `performance/transition-deferred/InputLagDemo.tsx:97,104,119`、`StaleSearchDemo.tsx:81,90`、`TabSwitchDemo.tsx:82,93`
- `performance/suspense-ui/BoundaryGranularityDemo.tsx:62`、`NoFallbackFlashDemo.tsx:64,75`
- `performance/react-compiler/components/MemoNoiseDemo.tsx:128`
- `basics/list-key/components/ResetStateDemo.tsx:56,62`(email 输入同时补 `type="email"` + `autocomplete="email"`)、`DynamicKeyDemo.tsx:41`、`IdentityExperiment.tsx:53`、`basics/jsx-render/components/ListRenderDemo.tsx:50`、`basics/event/components/PoolingHistoryDemo.tsx:65`、`SpecialCasesDemo.tsx:75`
- `hooks/custom-hooks/composition/index.tsx:139,148`、`playground/components/DebouncedDemo.tsx:33`、`LocalStorageDemo.tsx:25`、`RequestDemo.tsx:34`、`ToggleDemo.tsx:23`、`hooks/use-effect/index.tsx:247`
- `apps/shopping-cart/SearchBar.tsx:45`、`apps/todo/TodoComposer.tsx:38`、`apps/todo/TodoItem.tsx:97`
- `advanced/view-transition-activity/components/LabPanel.tsx:90`

## Approach

优先考虑在 `components/Input.tsx` 或新增包装层为 antd 控件提供统一的 `aria-label` 透传约定,避免每个演示各写一遍;每个控件逐个补齐亦可接受。

## Acceptance Criteria

- [ ] 上述清单中每个控件均有可访问名称(aria-label 或关联 label),无遗漏
- [ ] 用 VoiceOver(或 Accessibility Inspector)逐个验证控件朗读出用途
- [ ] `pnpm -C packages/react-playground type-check` 通过
- [ ] ResetStateDemo 的邮箱输入带 `type="email"` 和 `autocomplete="email"`
