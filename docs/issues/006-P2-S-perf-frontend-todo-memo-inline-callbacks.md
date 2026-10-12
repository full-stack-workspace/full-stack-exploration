## Problem

todo 应用的 `TodoItemComponent` 专门用 `React.memo` 包裹，但父组件传入 `onToggle={() => toggleTodo(todo.id)}` 等四个内联箭头函数——每次渲染都是新引用，浅比较永远失败，memo 完全失效。与本包 react-compiler 专题「写错的 memo」演示是同款反模式，但此处无教学标注。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M6

## Scope

- 修改 `packages/react-playground/src/topics/apps/todo/index.tsx:219-228`
- 必要时配合调整 `packages/react-playground/src/topics/apps/todo/TodoItem.tsx` 的 props 签名（回调改为接收 `id` 参数的稳定函数）

## Acceptance Criteria

- [ ] 父组件不再向 TodoItemComponent 传内联箭头函数；回调引用在渲染间保持稳定
- [ ] 用 React DevTools Profiler 验证：切换单个 todo 时其他 TodoItem 不重渲染
- [ ] todo 的增删改切换功能无回归
