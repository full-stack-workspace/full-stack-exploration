## Problem

无保护分支的 effect 无 cleanup，关键词变化/卸载时旧 promise 仍会 `setRawResponse`。文件头与行内注释明确「刻意不加任何竞态保护」属教学故意，但教学点是乱序覆盖，「卸载后仍 setState」不在教学意图内。已有 `.catch(() => {})` 兜 abort 报错，无崩溃风险。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L14

## Scope

- 修改 `packages/react-playground/src/topics/performance/transition-deferred/components/StaleSearchDemo.tsx:51-61`

## Acceptance Criteria

- [ ] 加 `let alive = true; ... return () => { alive = false; }` 守卫，卸载后不再 setState
- [ ] 无保护分支的乱序覆盖演示行为保持不变
