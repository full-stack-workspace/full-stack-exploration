## Problem

`appendLog` 在事件到达时读 `requestedKeywordRef.current`，但该 ref 在新一次 `run` 时已被覆盖。快速输入时，旧请求的 `stale`/`cancel` 事件会被记上新关键字，日志面板里「废弃」条目的关键字与真实请求不符。纯展示层不准确，不影响 state 正确性。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L11

## Scope

- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/composition/useUserSearch.ts:78`（必要时配合 `lib/useRequest.ts` 的事件类型，让关键字随请求绑定回传）

## Acceptance Criteria

- [ ] 关键字随请求绑定（如 `UseRequestEvent` 增加 params 回传），而非读取共享 ref
- [ ] 快速连续输入时，日志面板 stale/cancel 条目显示发起该请求时的真实关键字
- [ ] `pnpm -C packages/react-playground test:run` 通过
