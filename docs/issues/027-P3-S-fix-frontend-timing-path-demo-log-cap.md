## Problem

`let entryId = 0` 是模块级可变计数器（HMR 后不复位、多实例共享——当前各只有一处使用，无实际危害）；且 `setLog((prev) => [...prev, entry])` 无上限，而站内同类日志面板都有 `.slice(-8)` / `.slice(0, 6)` 截断。用户连点几十次会让 DOM 无限增长。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L9

## Scope

- 修改 `packages/react-playground/src/topics/internals/commit/TimingDemo.tsx:21`
- 修改 `packages/react-playground/src/topics/internals/events/PathDemo.tsx:20`

## Acceptance Criteria

- [ ] 两个 Demo 的日志追加带 `.slice(-20)` 之类截断，与其他探针对齐
- [ ] 连续触发 30+ 次后日志 DOM 节点数有上限
- [ ] 计数器改为 ref 或保留模块级并加注释说明
