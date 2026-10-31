# [P2][M][fix][frontend] Add hover states to plain links and buttons

## Problem

`architecture/` 分类十个页面的正文 Link 和两处练习页按钮没有任何 hover 反馈,用户无法感知元素可点,交互状态对比不符合规范。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 11 类。

## Scope

- `architecture/` 正文 Link 补 `hover:` 颜色/下划线变化:
  - `map/index.tsx:43,47,51,55`、`fiber/index.tsx:31,96,101`、`events/index.tsx:50`、`double-buffer/index.tsx:52`、`render/index.tsx:93`、`runtime-map/index.tsx:149`、`scheduler/index.tsx:79`、`ssr/index.tsx:111`、`work-unit/index.tsx:68,72`、`constraints/index.tsx:54`
- 按钮 hover 态:
  - `basics/fn-vs-class/practice/WatchClass.tsx:103`、`WatchFn.tsx:44`(加 `hover:border-*`/`hover:bg-*`)
  - `architecture/constraints/YieldCompare.tsx:22,29`(`hover:text-fuchsia-700`,配合 #008 的焦点修复)

## Approach

正文 Link 样式集中在各页面重复书写,可考虑抽一个共享的 prose-link className(`components/Prose.tsx` 已有类似职责),一次定义全站复用。

## Acceptance Criteria

- [ ] 清单中每个链接/按钮 hover 时有可见的视觉变化(颜色/下划线/背景)
- [ ] hover 态对比度强于静止态
- [ ] `pnpm -C packages/react-playground type-check` 通过
