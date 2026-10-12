## Problem

`'@typescript-eslint/no-var-requires'` 在 typescript-eslint v8 已废弃并重命名为 `no-require-imports`，未来升级 v9/v10 时会直接报「规则不存在」。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L21

## Scope

- 修改 `packages/react-playground/eslint.config.js:60`

## Acceptance Criteria

- [ ] 规则改为 `'@typescript-eslint/no-require-imports': 'error'`
- [ ] `pnpm -C packages/react-playground exec eslint src` 无规则不存在的报错，检查结果与改动前一致
