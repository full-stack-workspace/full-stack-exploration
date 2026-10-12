## Problem

`AgentPlayground` 的 `catch` 分支里非 abort 错误只 `setPhase("idle")`，没有 error state、没有错误提示；`consume()` 内 `JSON.parse(data)`（:103）遇到畸形帧抛错也落进这里被吞。同分区其余三个 playground（StreamPlayground:124、GenUiPlayground:84-94、RawStreamViewer:68-71）都有 error 状态展示，唯独这个没有，行为不一致。作为教学站，「请求失败长什么样」恰恰是学员会观察的点。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` M4

## Scope

- 修改 `packages/next-playground/topics/ai-native/agent-page/components/AgentPlayground.tsx:132-139`（及 :103 的 JSON.parse）

## Acceptance Criteria

- [ ] 增加 `error` state，非 abort 的 catch 分支 `setError(err instanceof Error ? err.message : String(err))` 并在 UI 渲染错误提示（样式与 StreamPlayground 对齐）
- [ ] `consume()` 里的 `JSON.parse` 单独 try/catch，坏帧跳过不中断整个流
- [ ] 模拟服务端 500 / 畸形帧时界面显示错误信息而非静默回到 idle
- [ ] 正常流式与 abort 路径行为不回归
