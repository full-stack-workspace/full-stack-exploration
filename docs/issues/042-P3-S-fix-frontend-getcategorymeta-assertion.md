## Problem

`CATEGORIES.find((c) => c.key === key)!` 非空断言依赖 CategoryKey 联合类型与 CATEGORIES 永远同步；有 topics.test.ts 契约测试兜底，运行时炸的概率低，但 find 返回 undefined 时会把 crash 推迟到调用点，且 eslint 对此 warn。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L24

## Scope

- 修改 `packages/react-playground/src/config/topics.tsx:232`

## Acceptance Criteria

- [ ] 不再使用非空断言：miss 时抛带 key 名的 Error，或改用 `Record<CategoryKey, CategoryMeta>` 代替数组 + find
- [ ] `topics.test.ts` 契约测试通过
- [ ] 该处 eslint warn 消除
