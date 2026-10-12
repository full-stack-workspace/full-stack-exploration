## Problem

`StreamRig` 与 `AgentPipeline` 两个流式演练组件用 `useRef<number[]>` 收集 setTimeout id 并提供 `clearTimers()`，但只在 `start()`/`stop()` 时调用，没有 `useEffect(() => () => clearTimers(), [])` 卸载清理。流式播放中途用户切走路由，残留定时器会继续对已卸载组件 setState（React 18+ 不告警但属泄漏）。同站 `agent-chat/index.tsx:54-57` 已有标准卸载 cancel，这两处是不一致遗漏；治理专题自己的题库也在考「effect 未清理定时器」这条反例。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M3

## Scope

- 修改 `packages/react-playground/src/topics/performance/ai-native/lab/components/StreamRig.tsx`（约 47 行起）
- 修改 `packages/react-playground/src/topics/performance/ai-native/agent-lab/components/AgentPipeline.tsx`（约 59 行起）

## Acceptance Criteria

- [ ] 两个组件均添加卸载 effect：置 `cancelledRef.current = true`（或等效守卫）并调用 `clearTimers()`
- [ ] 流式播放中途切换路由后，等待超过最长定时器延迟，Console 无任何 setState/报错输出
- [ ] 手动验证开始/停止/重开功能不回归
