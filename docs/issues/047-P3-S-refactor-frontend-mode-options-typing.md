## Problem

两处把 readonly `MODE_OPTIONS` 经 `as unknown as` 双重断言强转为 antd Select 的 options 类型（antd 6 泛型推断不穿透 readonly 数组的常见绕过）。给常量加显式元素类型标注即可消掉。（list-key/KeyRulesDemo 的一处双重断言是故意读 React 不传进 props 的 key 做教学演示，不在本 issue 范围。）

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L29

## Scope

- 修改 `packages/react-playground/src/topics/performance/react-compiler/components/MemoNoiseDemo.tsx:129`
- 修改 `packages/react-playground/src/topics/performance/transition-deferred/components/InputLagDemo.tsx:98`

## Acceptance Criteria

- [ ] 两处 `MODE_OPTIONS` 加显式元素类型标注（如 `{ label: string; value: MemoMode }[]`），不再使用 `as unknown as`
- [ ] antd Select 渲染与交互无回归
