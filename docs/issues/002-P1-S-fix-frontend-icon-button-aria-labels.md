# [P1][S][fix][frontend] Add aria-label to icon-only buttons

## Problem

3 处图标按钮(-/+、删除)没有任何文本内容,屏幕阅读器只能读出"按钮",用户无法知道点下去会发生什么。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 2 类。

## Scope

- `basics/jsx-render/components/ConditionalDemo.tsx:73,79` — -/+ 按钮加 `aria-label="减少数量"` / `"增加数量"`
- `hooks/custom-hooks/playground/components/PreviousDemo.tsx:36,37` — 加 `aria-label="减 1"` / `"加 1"`
- `apps/bookkeeping/RecordTable.tsx:81` — 删除按钮加 `aria-label="删除记录"`

## Acceptance Criteria

- [ ] 三个文件中所有图标按钮均有描述性 aria-label
- [ ] VoiceOver 朗读为具体动作而非"按钮"
- [ ] `pnpm -C packages/react-playground type-check` 通过
