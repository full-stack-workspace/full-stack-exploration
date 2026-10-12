## Problem

测试使用 `screen.getByText('胖 Context(对照)').parentElement!` 定位元素，依赖 DOM 结构层级——组件换一层包裹即假阴性；`!` 非空断言也绕过了空值检查。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L6

## Scope

- 修改 `packages/react-playground/src/topics/advanced/context/index.test.tsx:74-75`

## Acceptance Criteria

- [ ] 改用 `closest('[class*=rounded-card]')` 或给对照面板加 `data-testid` 定位
- [ ] 不再使用 `parentElement!`
- [ ] `pnpm -C packages/react-playground test:run` 通过
