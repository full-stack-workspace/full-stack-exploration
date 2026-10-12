## Problem

`useRequest.cancel()` 只做 `abortRef.current?.abort()`，不推进 `requestSeqRef`；`.then` 分支只检查 `requestId !== requestSeqRef.current`，不检查 `controller.signal.aborted`，与 `.catch` 分支（有 aborted 检查）不对称。若调用方的 asyncFn 不响应 AbortSignal（真实项目常见，如部分 SDK），取消后结果仍会被当作 success 写入 state 并触发 `onSuccess`。站内 mock 遵守 signal 所以不触发，但该 lib 定位是「可直接拷进项目使用」的生产级原子 Hook，缺陷会被使用者拷走。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M2
> [Assumption] 优先级 P1（公共 lib 的正确性缺陷）为拆解默认值，可调整。

## Scope

- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/lib/useRequest.ts`（约 136 行 `.then` 分支）
- 补充 `packages/react-playground/src/topics/hooks/custom-hooks/lib/useRequest.test.tsx` 契约用例

## Acceptance Criteria

- [ ] `.then` 分支在 stale 检查后增加 `controller.signal.aborted` 检查，命中时 emit `cancel` 事件并 return，不写入 data、不触发 `onSuccess`
- [ ] 新增契约测试：「cancel 后 asyncFn 仍正常 resolve → data 不更新、onSuccess 不调用」
- [ ] `pnpm -C packages/react-playground test:run` 全部通过
