## Problem

AsyncStatusDemo 卸载清理齐全，但 loading 期间再次点击「重新请求」时，`timerRef.current` 被直接覆盖，旧定时器无法被清理路径触达。当前两次定时器同延迟、按启动顺序 fire，最终状态恰好与点击顺序一致所以无可见 bug，但模式不完整。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L4

## Scope

- 修改 `packages/react-playground/src/topics/basics/jsx-render/components/AsyncStatusDemo.tsx:83-86`

## Acceptance Criteria

- [ ] `load()` 覆盖 `timerRef.current` 前先 `clearTimeout` 旧定时器（或用 generation/AbortController 作废旧请求）
- [ ] loading 中连续点击「重新请求」，只有最后一次请求的结果落库
