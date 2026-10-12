## Problem

vitest ^2.1.8，上游已发布 vitest 3（2025-01）与 4（2025-10），落后 2 个大版本。仅用于注册表契约测试（纯 node 环境），影响面小。**需人工确认**是否与 workspace 内 react-playground 的 vitest 2 对齐是刻意为之（react-playground 的依赖升级已在 issue #24 跟踪）。其余依赖全部与时俱进（Next 16.2 / React 19.2 / Tailwind 4 / zod 4；`ai@7.0.122` 与 `@ai-sdk/react@4.0.125` 经实测为精确配套）。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L16

## Scope

- `packages/next-playground/package.json:31`（vitest 及可能的 `@vitest/*` 配套）

## Acceptance Criteria

- [ ] 与 react-playground 的升级决策保持一致（对齐版本或记录刻意停留的原因）
- [ ] 升级后 `pnpm -C packages/next-playground test` 注册表契约测试 117/117 通过
- [ ] 若决定停留 v2，在 package.json 或包 README 记录原因并关闭本 issue

## Dependencies / Risks

- 与 issue #24（react-playground 依赖升级）决策联动，建议同一 PR 或同期处理
