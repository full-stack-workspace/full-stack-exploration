# [P2][S][refactor][frontend] Replace transition-all with explicit props

## Problem

13 处 `transition-all` 是明确的反模式:任何属性变化都触发动画,容易产生意外的布局动画(如宽度、padding 变化被动画化),也让浏览器做多余的插值计算。应显式列出需要过渡的属性。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 7 类。

## Scope

- `components/BackToTop.tsx:66` → `transition-[opacity,transform,box-shadow]`
- `components/TopicCard.tsx:34` → `transition-[transform,box-shadow,border-color]`
- `apps/todo/TodoItem.tsx`(6 处)、`TodoComposer.tsx:44,50,67`、`TodoFilterBar.tsx:72`、`todo/index.tsx:257` → 按实际过渡属性改为 `transition-colors` / `transition-shadow` 等

## Acceptance Criteria

- [ ] `grep -rn "transition-all" src/` 在 react-playground 中无结果
- [ ] 各处原有 hover/显隐动画视觉效果不变
- [ ] `pnpm -C packages/react-playground type-check` 通过
