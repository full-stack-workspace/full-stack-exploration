# [P2][M][fix][frontend] Strengthen focus-visible states on interactives

## Problem

多处可交互元素键盘焦点不可见或对比不足:有的 `outline-none` 后只靠 1px 边框颜色变化(远低于焦点可见性要求),有的完全没有焦点样式。键盘用户无法定位当前焦点。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 8 类。

## Scope

- 弱焦点(`outline-none` + 仅边框变色)→ 补 `focus-visible:ring-2`:
  - `hooks/actions/components/ActionStateForm.tsx:72`
  - `hooks/actions/components/FormActionBasic.tsx:68,123`
  - `hooks/actions/components/FormStatusDemo.tsx:99`
- 无焦点样式 → 补 `focus-visible:ring-2` 或等价:
  - `performance/components/AmberTopics.tsx:25`(Link 卡片)
  - `performance/components/SeriesNav.tsx:40`
  - `apps/todo/TodoFilterBar.tsx:67-80`
  - `apps/todo/index.tsx:237-264`(页脚文字按钮)
  - `architecture/constraints/YieldCompare.tsx:22,29`
- `App.tsx:163` — skip link 由 `:focus` 改为 `:focus-visible` 方案(如 `focus:not-sr-only` → `focus-visible:not-sr-only` 或保持 focus 但在注释说明豁免理由)

## Acceptance Criteria

- [ ] 清单中每个元素 Tab 聚焦时有清晰可见的焦点环(对比度明显区别于非焦点态)
- [ ] 鼠标点击时不出现焦点环(仅 focus-visible)
- [ ] skip link 键盘聚焦时正常显现
- [ ] `pnpm -C packages/react-playground type-check` 通过
