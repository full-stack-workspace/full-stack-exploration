## Problem

根 AGENTS.md《Code Commenting Standards》要求每个新文件以结构化 JSDoc 文件头块开头。全包 259 个源文件中 253 个合规，以下 6 个完全缺失（bookkeeping 4 个疑为同批提交遗漏；`src/index.tsx` 作为应用入口连一行注释都没有）：

- `packages/react-playground/src/index.tsx`
- `packages/react-playground/src/topics/apps/bookkeeping/SummaryCards.tsx`
- `packages/react-playground/src/topics/apps/bookkeeping/RecordTable.tsx`
- `packages/react-playground/src/topics/apps/bookkeeping/AddRecordForm.tsx`
- `packages/react-playground/src/topics/apps/bookkeeping/types.ts`
- `packages/react-playground/src/topics/apps/todo/types.ts`

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M10

## Scope

- 按同目录 `src/topics/apps/todo/index.tsx:1-14` 的既有格式为上述 6 个文件补齐文件头块（含模块说明、功能特点、`@module` 标注）；两个 types.ts 可写简版

## Acceptance Criteria

- [ ] 6 个文件均以规范的 JSDoc 文件头块开头，格式与包内既有文件一致
- [ ] 无代码行为变更（纯注释），`pnpm -C packages/react-playground build` 通过
