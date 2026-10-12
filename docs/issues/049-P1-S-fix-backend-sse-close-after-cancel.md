## Problem

手写 SSE 的两个端点在客户端 abort 触发流的 `cancel()` 回调后，流状态已变为 closed，但 `start()` 的退出路径仍调用 `controller.close()`：agent 路由有 7 处 `{controller.close(); return;}`，stream 路由 69 行的收尾 `close()` 在 `!cancelled` 守卫之外。已用 Node 实测：`cancel()` 后 `close()`/`enqueue()` 均抛 `TypeError: Invalid state: Controller is already closed`。异常被 streams 机制吸收（不 crash 进程），但这是「教学取消正确姿势」的代码自身在取消路径上抛错，部分运行时/版本中会以 unhandled rejection 进日志。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` M1
> [Assumption] 优先级 P1（教学示范代码在取消路径抛错）为拆解默认值，可调整。

## Scope

- 修改 `packages/next-playground/app/api/ai/stream/route.ts:66-69`（`close()` 与 `[DONE]` 放入同一 `!cancelled` 守卫）
- 修改 `packages/next-playground/app/api/ai/agent/route.ts:74-106`（7 处 `controller.close()` 收敛为一个幂等的 `finish()` 帮助函数，内部用 `closed` 标志或 try/catch 防护）

## Acceptance Criteria

- [ ] 客户端中途 abort 后，服务端不再对已 closed 的 controller 调用 `close()`/`enqueue()`
- [ ] 复现路径实测：客户端连接后中断，服务端日志无 `TypeError: Invalid state` / unhandled rejection
- [ ] 正常完整流式输出（含 `[DONE]` 帧）行为不回归
