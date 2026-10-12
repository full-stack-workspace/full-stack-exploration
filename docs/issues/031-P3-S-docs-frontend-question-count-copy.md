## Problem

internals 题库实测 67 题，页面 UI 用 `QUESTION_COUNT` 动态计算是准的，但文件头注释与文档中的「六十道」是静态文案，与实际不符且会随后续加题进一步漂移。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L13

## Scope

- 修改 `packages/react-playground/src/topics/internals/interview/index.tsx:6`
- 修改 `packages/react-playground/src/topics/internals/AGENTS.md:8`
- 修改 `packages/react-playground/src/topics/internals/runtime-map/index.tsx:171`

## Acceptance Criteria

- [ ] 三处静态文案不再含与实际题数不符的具体数字（改「六十余道」或删数字）
- [ ] 页面 UI 题数仍由 `QUESTION_COUNT` 动态生成
