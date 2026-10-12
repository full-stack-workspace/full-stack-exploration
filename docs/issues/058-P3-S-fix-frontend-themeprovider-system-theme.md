## Problem

用户未做显式选择时，初始主题取 `prefers-color-scheme`，但之后没有 `matchMedia(...).addEventListener("change", ...)` 订阅——页面打开期间切换系统深浅色不会跟随。文件注释解释了「首次挂载不落盘」的取舍，但「跟随系统」只停留在加载那一刻。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L5

## Scope

- 修改 `packages/next-playground/components/ThemeProvider.tsx:69-79`

## Acceptance Criteria

- [ ] localStorage 无显式 `theme` 时订阅 matchMedia change 事件并同步主题，effect cleanup 退订
- [ ] 用户显式选择过主题后，系统切换不再覆盖其选择
- [ ] 手动验证：打开页面后切换系统深浅色，页面主题跟随；显式选择后不再跟随
