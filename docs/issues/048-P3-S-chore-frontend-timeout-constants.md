## Problem

少量超时毫秒数硬编码在业务代码里：`relay/Environment.ts:91` 的 mock 延迟 300ms、`apps/todo/index.tsx:88` 的 3000ms 确认超时（有 clearTimeout 清理）。对照正面例子：`FrameMeter.tsx` 已把 16.7/50 提为具名常量。属观察项，非阻塞。（fn-vs-class/event 专题的 500/800/3000ms 为教学对照演示，不在本 issue 范围。）

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L30
> [Assumption] 报告定级为观察项，本 issue 作为 backlog 跟踪；如认为不值得改可直接关闭。

## Scope

- `packages/react-playground/src/relay/Environment.ts:91`
- `packages/react-playground/src/topics/apps/todo/index.tsx:88`

## Acceptance Criteria

- [ ] 两处超时值提取为具名常量（本文件顶部或 constants 文件）
- [ ] 行为无回归，`pnpm -C packages/react-playground build` 通过
