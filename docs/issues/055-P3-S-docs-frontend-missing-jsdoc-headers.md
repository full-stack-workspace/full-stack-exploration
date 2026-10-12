## Problem

根 AGENTS.md 要求每个文件以结构化 JSDoc 文件头块开头。同包 `components/ArticleCard.tsx`、`data/blog.ts` 均有完整文件头，但 `components/UserCard.tsx`、`data/user.ts`、`postcss.config.mjs` 三个文件直接从 import 开始；`data/user.ts:118` 的导出函数 `getUserById` 也无 JSDoc。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L2

## Scope

- `packages/next-playground/components/UserCard.tsx:1`
- `packages/next-playground/data/user.ts:1`（文件头）与 `:118`（`getUserById` 加 `@returns User | undefined`）
- `packages/next-playground/postcss.config.mjs:1`

## Acceptance Criteria

- [ ] 3 个文件补齐与 `data/blog.ts` 同风格的文件头块，`getUserById` 有 JSDoc
- [ ] 无行为变更，`pnpm -C packages/next-playground build` 通过
