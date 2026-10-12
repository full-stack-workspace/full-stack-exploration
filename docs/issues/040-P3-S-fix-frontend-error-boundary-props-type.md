## Problem

`React.PropsWithChildren<{}>` 中的 `{}` 是 typescript-eslint 不推荐写法（`{}` 实际表示「任何非 nullish 值」而非「空对象」）。类组件形式本身是 Error Boundary 的 React 硬性限制，不是问题。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L22

## Scope

- 修改 `packages/react-playground/src/monitor/AppErrorBoundary.tsx:22`

## Acceptance Criteria

- [ ] 改为 `React.PropsWithChildren` 或 `React.PropsWithChildren<Record<string, never>>`
- [ ] `pnpm -C packages/react-playground build` 与 `test:run` 通过
