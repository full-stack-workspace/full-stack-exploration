## Problem

`performance/components/Prose.tsx` 的头注释写明「避免每个 guide 复制一份 P / Stack」，治理系列 5 页都复用它；但 `render-scheduling-guide`（同在 performance 下）和 `sync-store-guide` 仍各自内联定义了完全相同的 P/Stack 组件。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L17

## Scope

- 修改 `packages/react-playground/src/topics/performance/render-scheduling-guide/index.tsx:26-33`（直接 import `../components/Prose`）
- 修改 `packages/react-playground/src/topics/agent/sync-store-guide/index.tsx:36-43`（跨分类，可上提共享或保留本地定义并注释说明）

## Acceptance Criteria

- [ ] P/Stack 定义不再跨文件重复（至少 render-scheduling-guide 复用 Prose）
- [ ] 两个梳理页的排版渲染无回归
