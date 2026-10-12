## Problem

两个 rendering 专题各自定义了逐行相同的 `const sleep = (ms) => new Promise(...)`（含同款注释「人为延迟 helper」）。仅 2 处、体量极小，属可接受的 co-locate 风格，但与包内「共享逻辑进 lib/」的习惯略有张力。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L8
> [Assumption] 报告结论为「可不处理」，本 issue 作为顺手项；若第三个专题再需要时优先级自动升高。

## Scope

- `packages/next-playground/topics/rendering/ppr/index.tsx:28-29`
- `packages/next-playground/topics/rendering/streaming/index.tsx:27-28`

## Acceptance Criteria

- [ ] sleep 提取到 `lib/` 或 `topics/rendering/` 共享模块，两处 import；或决定保留 co-locate 并关闭本 issue
- [ ] 两个专题的流式演示行为无回归
