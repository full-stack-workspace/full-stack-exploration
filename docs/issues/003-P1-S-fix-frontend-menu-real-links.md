# [P1][S][fix][frontend] Render top-nav menu items as real links

## Problem

顶栏导航(`App.tsx:171,202,242`)用 antd `Menu` 的 `onClick` + `navigate()` 做跳转,不是真正的 `<a>` 链接。用户无法 Cmd/Ctrl+click 或中键在新标签页打开专题,右键菜单也没有"在新标签页打开",违背了 Web 导航的基本预期。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 3 类。

## Scope

- `App.tsx` — 将 Menu `items` 的 label 渲染为 react-router `<Link>`(或 `<a href>`),移除依赖 `onClick`+`navigate()` 的跳转逻辑;保留 Menu 的选中态逻辑

## Acceptance Criteria

- [ ] 顶栏每个导航项在 DOM 中是带 `href` 的 `<a>`
- [ ] Cmd+click / 中键点击能在新标签页打开对应路由
- [ ] 普通左键点击仍走 SPA 路由(无整页刷新)
- [ ] 当前路由的菜单高亮态保持正确
