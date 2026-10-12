## Problem

`run()` 内 `await sleep(...)` 后直接 `setElapsed/setRunning`，组件卸载后回调仍会执行（React 18+ 不告警，仅泄漏一次定时器回调）。demo 影响极小，但治理专题自己在考「effect 未清理」这条反例。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L19

## Scope

- 修改 `packages/react-playground/src/topics/performance/governance/implement/components/WaterfallDemo.tsx:24-51`

## Acceptance Criteria

- [ ] 加 mounted ref 守卫（或卸载时忽略后续 setState）
- [ ] 瀑布对比演示功能无回归
