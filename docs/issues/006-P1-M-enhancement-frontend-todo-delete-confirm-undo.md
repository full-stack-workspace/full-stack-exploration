# [P1][M][enhancement][frontend] Add confirm or undo for todo deletion

## Problem

`apps/todo/TodoItem.tsx:142` 的单条删除点击即生效、不可恢复。误触(尤其触屏)直接丢数据。同一页面"全部清空"已有两步确认,单条删除反而更危险,体验不一致。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 6 类。

## Scope

- `apps/todo/TodoItem.tsx` — 单条删除增加保护:二选一
  - A. 与"全部清空"一致的两步确认(点一次变确认态,再点确认)
  - B. 删除后 toast 提供"撤销",5 秒内可恢复

## Acceptance Criteria

- [ ] 点击删除后任务不会立即消失(两步确认),或消失后 5 秒内可一键撤销
- [ ] 键盘用户同样可用(确认态/撤销按钮可聚焦、可触发)
- [ ] 与"全部清空"的交互模式在站内保持一致
