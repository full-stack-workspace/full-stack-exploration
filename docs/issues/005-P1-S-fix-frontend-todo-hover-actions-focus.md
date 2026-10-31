# [P1][S][fix][frontend] Reveal hover-only todo actions on keyboard focus

## Problem

Todo 列表项的编辑/删除按钮(`apps/todo/TodoItem.tsx:125,143`)默认 `opacity-0`,只在 `group-hover` 时显现。键盘用户 Tab 到这些按钮时,焦点落在完全透明的控件上——焦点"消失"了,既看不到焦点在哪,也不知道按下了什么。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 5 类。

## Scope

- `apps/todo/TodoItem.tsx:125,143` — 为两个按钮补 `group-focus-within:opacity-100 focus-visible:opacity-100`(或等价方案),确保键盘聚焦时按钮可见

## Acceptance Criteria

- [ ] Tab 键进入 Todo 项的编辑/删除按钮时按钮立即可见
- [ ] 鼠标 hover 显现行为不变
- [ ] 焦点环清晰可见(配合 #008 的 focus-visible 修复)
