## Problem

`RelatedTopics` 组件在两个专题目录各有一份逐行相同的拷贝（仅 hover 配色 token 不同：sky vs indigo），且 `advanced/rsc/guide` 跨分类 import `basics/fn-vs-class` 目录下的那一份——已是「事实上的共享组件」却散在三个专题目录里，配色差异本应做成入参。后续改样式需同步多处，易漂移。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M7

## Scope

- 新增 `packages/react-playground/src/components/RelatedTopics.tsx`（加可选 `tone` prop 承载配色差异，参照 `TopicNav` 的共享组件模式）
- 删除 `src/topics/advanced/component-comm/components/RelatedTopics.tsx` 与 `src/topics/basics/fn-vs-class/components/RelatedTopics.tsx`
- 切换 3 处引用：component-comm 专题、fn-vs-class 专题、`src/topics/advanced/rsc/guide/index.tsx:23`

## Acceptance Criteria

- [ ] 全仓只剩一份 RelatedTopics 实现，位于 `src/components/`
- [ ] `grep -r "RelatedTopics" packages/react-playground/src/topics` 仅剩对共享组件的 import
- [ ] 三处页面的相关专题 chips 渲染与 hover 配色（sky/indigo）与改动前一致
- [ ] `pnpm -C packages/react-playground test:run` 通过
