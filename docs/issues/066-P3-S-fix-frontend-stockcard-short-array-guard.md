## Problem

`StockCard` 走势线的 `span = max - min || 1` 防了「全部同值」，但 `points.length === 1` 时 `i / (points.length - 1)` 除以 0 → x 为 NaN；空数组时 `Math.min(...[])` 为 Infinity。当前 mock payload 恒为 10 个点不触发，但作为「工具调用渲染产物」组件，真实场景 payload 来自模型，长度不可控。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L13

## Scope

- 修改 `packages/next-playground/topics/ai-native/generative-ui/components/StockCard.tsx:17-28`

## Acceptance Criteria

- [ ] 函数入口加 `if (points.length < 2) { return ""; }`（或等效守卫），svg 无有效 points 时不渲染 polyline
- [ ] 传入空数组/单点数组时不产生 NaN/Infinity 坐标
- [ ] 正常 10 点走势线渲染无回归
