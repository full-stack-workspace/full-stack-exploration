## Problem

`GenUiPlayground` 的消息 id 用 `Date.now()`（user 消息）与 `Date.now() + 1`（assistant 消息）生成，靠服务端 300ms+ 延迟天然错开才没撞上；作为教学代码，这个 id 生成模式容易被读者照抄到无延迟场景。（事件回调里调 `Date.now()` 不违反 cacheComponents 渲染期约束，仅模式不佳。）

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L12

## Scope

- 修改 `packages/next-playground/topics/ai-native/generative-ui/components/GenUiPlayground.tsx:71,83,91`

## Acceptance Criteria

- [ ] 消息 id 改用模块级自增计数器或 `crypto.randomUUID()`
- [ ] 连续快速发送多条消息时列表 key 无重复（React 无 key 警告）
- [ ] generative-ui 演示流程无回归
