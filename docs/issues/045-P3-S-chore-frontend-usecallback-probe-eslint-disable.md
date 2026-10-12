## Problem

EffectDepsProbe 的 `handler` 函数体刻意留空（用 deps 编码订阅语义的教学设计），eslint 判定依赖 `[keyword, tickToken]` 多余而告警。同文件 157、231 行已有定向 eslint-disable，此处漏了。当前 `eslint src` 共 4 条 warning，此为其中之一。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L27

## Scope

- 修改 `packages/react-playground/src/topics/hooks/use-callback/index.tsx:221`

## Acceptance Criteria

- [ ] 补 `// eslint-disable-next-line react-hooks/exhaustive-deps -- 探针故意:只比较函数身份`
- [ ] 该处 warning 消除，探针演示行为不变
