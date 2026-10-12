## Problem

suspense-ui 专题的 `lab/resource.ts:26` 明确注释「wrapPromise 资源必须在事件处理器/effect 中创建，不能在渲染期创建」，但三个演示组件用 `useState(() => createResource())` 在 state initializer（渲染期）发起请求。StrictMode 下 initializer 双调用 → 每次挂载发两次请求（mock 无感，真实 API 即重复请求）。这是教学站自己演示的模式，与页面宣称的规则自相矛盾，读者会照抄。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M4

## Scope

- 修改 `packages/react-playground/src/topics/performance/suspense-ui/components/InitialSkeletonDemo.tsx:60`
- 修改 `packages/react-playground/src/topics/performance/suspense-ui/components/NoFallbackFlashDemo.tsx:45`
- 修改 `packages/react-playground/src/topics/performance/suspense-ui/components/BoundaryGranularityDemo.tsx:51`

## Approach

初始资源改为 `useState<SuspenseResource | null>(null)` + 挂载 effect 中创建（或模块外创建一次传入），并在页面注释说明初始加载为何这样做，与 `resource.ts` 的规则注释呼应。

## Acceptance Criteria

- [ ] 三个组件均不在渲染期（state initializer）调用 `createResource()`
- [ ] React StrictMode 下挂载时 mock 请求只发出一次（可在 mock 中加计数验证）
- [ ] 三个演示页的骨架/切换行为肉眼无回归
