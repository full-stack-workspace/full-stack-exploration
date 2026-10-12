## Problem

依赖探针 UI 选项叫「每次渲染」，但实现是 `unrelatedToken = mode === 'every' ? unrelated : 0` 的固定长度依赖技巧；且 `DepsProbe` 本身是 memo 组件，页面顶部 keyword 输入引起的重渲染不会传导进来——该模式下 effect 实际只在 mode/count/unrelated 变化时重跑，并非字面「每次渲染」。注释说明了固定长度的动机，但教学标签与真实语义有偏差。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L12

## Scope

- 修改 `packages/react-playground/src/topics/hooks/use-effect/index.tsx:31-35`

## Acceptance Criteria

- [ ] 选项 label 改为「任一 props 变化」等准确措辞，或在 note 里说明依赖 memo 的前提
- [ ] 探针三种模式的行为演示无回归
