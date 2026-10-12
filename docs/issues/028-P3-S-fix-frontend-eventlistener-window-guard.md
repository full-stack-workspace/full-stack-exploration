## Problem

`useState(() => ({ width: window.innerWidth, ... }))` 在渲染期触碰浏览器 API 且无 `typeof window` 守卫。本包是纯 CSR 所以不会炸，但 custom-hooks/guide 的坑清单第 ⑤ 条正把「渲染期读 window」列为 ✗ 错误写法，正确示范要求「懒初始化守卫」——demo 与教材口径不一致，读者容易照抄。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L10

## Scope

- 修改 `packages/react-playground/src/topics/hooks/custom-hooks/playground/components/EventListenerDemo.tsx:19`

## Acceptance Criteria

- [ ] 加 `typeof window === 'undefined'` 守卫，或在 demo 注释里说明「纯 CSR 场景省略守卫」
- [ ] demo 与 guide 坑清单第 ⑤ 条的口径一致
- [ ] 窗口尺寸监听功能无回归
