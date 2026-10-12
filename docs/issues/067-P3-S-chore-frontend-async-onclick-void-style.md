## Problem

`AgentPlayground` 与 `GenUiPlayground` 的 onClick 都写 `onClick={() => void start()}`，但 `StreamPlayground` 与 `RawStreamViewer` 直接 `onClick={start}` / `onClick={capture}`。功能等价（内部有 try/catch），但包内风格不统一，且未显式标记的 Promise 返回易被 no-misused-promises 类 lint 规则误伤。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L14

## Scope

- `packages/next-playground/topics/ai-native/streaming-endpoint/components/StreamPlayground.tsx:139`
- `packages/next-playground/topics/ai-native/ai-sdk/components/RawStreamViewer.tsx:82`

## Acceptance Criteria

- [ ] 两处统一为 `onClick={() => void start()}` 风格
- [ ] 演示交互无回归，`pnpm -C packages/next-playground lint` 通过
