## Problem

「可取消请求」范式代码中，两处 `.catch` 只对 AbortError 静默返回，其余错误在 promise 链尾 `throw error` 无人再接，会触发 unhandled rejection。站内 mock `fetchQuote` 只在 abort 时 reject 实际不触发，但这是教学范式代码，读者照抄接真实接口就会把网络错误变成未捕获拒绝。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L3

## Scope

- 修改 `packages/react-playground/src/topics/basics/fn-vs-class/practice/WatchClass.tsx:71-76`
- 修改 `packages/react-playground/src/topics/basics/fn-vs-class/practice/hooks.ts:54-59`

## Acceptance Criteria

- [ ] `useQuote` 侧把非 AbortError 错误写入 `status: 'error'` 状态（或等效错误通道）
- [ ] class 对照侧至少 `console.error` 吞掉并留注释说明「错误通道从略」
- [ ] 模拟非 AbortError 失败时控制台无 unhandled rejection 警告
