## Problem

为 vitest 断言接口补类型时用了 `any`（@typescript-eslint/no-explicit-any 警告）。类型声明文件内影响面小；全包生产代码 `any` 为 0 处，仅测试基建残留。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L28

## Scope

- 修改 `packages/react-playground/src/vitest.d.ts:10-11`

## Acceptance Criteria

- [ ] `any` 替换为 `unknown` 或具体 matcher 泛型
- [ ] `pnpm -C packages/react-playground test:run` 通过，相关 eslint warn 消除
