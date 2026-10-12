## Problem

根 AGENTS.md 要求新文件使用带分隔线的结构化 JSDoc 文件头块（如 TopicCard/CheckList 的样式），但 8 个存量文件仍为简短的 `@file/@description` 旧式头，且 `Loading.tsx` 无 `@module` 标注。均为存量文件，不影响功能。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L25

## Scope

- `packages/react-playground/src/components/Loading.tsx:1`
- `packages/react-playground/src/monitor/AppErrorBoundary.tsx:1`
- `packages/react-playground/src/hooks/useLocalStorage.ts:1`
- `packages/react-playground/src/test/setupTests.ts:1`
- `packages/react-playground/src/test/utils.tsx:1`
- `packages/react-playground/src/vitest.d.ts:1`
- `packages/react-playground/src/config/topics.test.ts:1`
- `packages/react-playground/src/config/legacy-routes.test.ts:1`

## Acceptance Criteria

- [ ] 8 个文件头对齐为规范 JSDoc 块；或维护者确认 `@file` 简式头合规，在 AGENTS.md 写明两种都可接受
- [ ] 无行为变更，`pnpm -C packages/react-playground build` 通过
