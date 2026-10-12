## Problem

`shouldFail` 是模块级可变变量，composition 页和 playground 的 RequestDemo 各自用 `useToggle(false)` 维护开关 UI。在 A 页打开失败注入后切到 B 页，B 页 Switch 显示「关」但请求实际全部失败——UI 与真实状态跨页漂移。guide 已声明模块级开关是「刻意简化」，但漂移本身不在教学意图内。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L7

## Scope

- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/composition/mockUserApi.ts:50`
- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/playground/components/RequestDemo.tsx:34`
- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/composition/index.tsx:151`

## Acceptance Criteria

- [ ] 失败开关收敛为一个共享状态源（如 `useSyncExternalStore` 包模块变量，正好回扣 agent 专题模式）；或在两页注明开关全局生效
- [ ] 任一页切换开关后，另一页 Switch 显示与实际请求行为一致
