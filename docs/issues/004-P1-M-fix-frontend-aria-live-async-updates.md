# [P1][M][fix][frontend] Announce async updates with aria-live regions

## Problem

6 处异步内容更新(加载态、流式日志、请求结果)发生时屏幕阅读器完全静默,用户不知道页面变了:加载完成了吗?请求失败了吗?日志新增了什么?

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 4 类。

## Scope

- `components/Loading.tsx:10` — 容器加 `role="status"`(同时覆盖第 13 类的 `加载中...` → `加载中…`,如该 issue 未先做)
- `basics/jsx-render/components/AsyncStatusDemo.tsx:146` — 结果容器加 `aria-live="polite"`
- `performance/governance/implement/components/WaterfallDemo.tsx:67` — 请求日志 `<ul>` 加 `aria-live="polite"`
- `advanced/error-boundary/components/RethrowDemo.tsx:53` — 请求结果 Alert 区域加 `aria-live="polite"`
- `hooks/custom-hooks/composition/index.tsx:61` — 日志 `<ul>` 加 `aria-live="polite"`
- `agent/agent-chat/components/EventLogPanel.tsx:67` — 流式日志 `<ul>` 加 `aria-live="polite"`

## Acceptance Criteria

- [ ] 6 个位置更新内容时 VoiceOver 能自动播报新内容
- [ ] 播报不刷屏(流式日志场景验证连续追加时读屏体验可接受)
- [ ] `pnpm -C packages/react-playground type-check` 通过
