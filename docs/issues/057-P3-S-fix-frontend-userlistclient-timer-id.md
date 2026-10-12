## Problem

`UserListClient` 两处小问题：① `setTimeout(() => setIsAdding(false), 500)` 没有保存 timer id，组件在 500ms 窗口内卸载时会对已卸载组件 setState（React 19 不警告但属未清理定时器模式；且「添加」是同步操作，500ms 防抖本身可省）。② `Date.now()` 同时用作新用户 id、email 与头像 seed，理论同毫秒撞 key（有 `isAdding` 守卫几乎不可达）。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L4

## Scope

- 修改 `packages/next-playground/components/UserListClient.tsx:74-89`

## Acceptance Criteria

- [ ] 直接同步 `setIsAdding(false)`，或 timer 存 ref 并在卸载 cleanup 中 `clearTimeout`
- [ ] 新用户 id 改用 `crypto.randomUUID()`（email/avatar seed 同步改）
- [ ] 添加成员交互无回归
