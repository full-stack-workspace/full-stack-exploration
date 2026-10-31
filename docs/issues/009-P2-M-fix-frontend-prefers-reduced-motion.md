# [P2][M][fix][frontend] Honor prefers-reduced-motion in animations

## Problem

`src/index.css` 没有全局 `prefers-reduced-motion` 兜底,`animate-pulse` 骨架屏和自定义 keyframes 动画对开启了减弱动效的用户(前庭敏感)照常播放。两处自定义 keyframes 需要显式 gate。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 9 类。

## Scope

- `src/index.css` — 加全局兜底:`@media (prefers-reduced-motion: reduce)` 下禁用/降级动画(可参考 Tailwind 官方的 reduce 覆写)
- `animate-pulse` → `motion-safe:animate-pulse`:
  - `advanced/relay/components/UserDirectory.tsx:26`
  - `advanced/relay/components/UserLookupDemo.tsx:143-144`
  - `basics/jsx-render/components/AsyncStatusDemo.tsx:39`
  - `agent/agent-chat/components/PartRenderer.tsx:24`
- 自定义 keyframes 包 `@media (prefers-reduced-motion: no-preference)`:
  - `advanced/view-transition-activity/components/ManualTransitionDemo.tsx:41-47`
  - `advanced/view-transition-activity/components/TransitionTypePlayground.tsx:60-69`

## Acceptance Criteria

- [ ] 系统开启"减弱动态效果"后,上述动画全部静止(骨架屏显示静态占位,keyframes 不播放)
- [ ] 未开启时动画行为不变
- [ ] `grep -rn "animate-pulse" src/` 结果均为 `motion-safe:` 前缀
