## Problem

两处客户端 fetch 演示的 onClick 异步处理器都没有 `catch`：`AfterDemo.readCount` 完全没有 try；`AfterDemo.triggerPost` 与 `ApiPlayground.call` 是 try/finally 无 catch。`/api/after-demo`、`/api/basic` 不可达时会触发 unhandled rejection，按钮恢复可点（finally）但界面无任何失败提示。同专题的 `SwrPlayground` 有完整 error 分支，形成对照；`LiveHeaders.tsx:43` 的 `.catch(() => setFailed(true))` 是现成范式。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` M5

## Scope

- 修改 `packages/next-playground/topics/data/dynamic-apis/components/AfterDemo.tsx:37-66`
- 修改 `packages/next-playground/topics/data/route-handlers/components/ApiPlayground.tsx:39-56`

## Acceptance Criteria

- [ ] 两处演示的异步处理器都有 catch 分支设置失败状态（错误文案或 failed 标志），并顺手检查 `res.ok`
- [ ] 停掉 dev server 或拦截请求模拟失败时：界面显示失败提示，控制台无 unhandled rejection
- [ ] 成功路径行为不回归
