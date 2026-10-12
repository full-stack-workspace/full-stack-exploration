## Problem

`LiveHeaders` 的 useEffect HEAD 请求未绑定 AbortController，组件在请求返回前卸载时仍可能 `setSnapshot`/`setFailed`（React 18+ 不警告但属陈旧更新）。本站 AI 演练组件均用了 abortRef/AbortController 模式，此处可对齐。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L15

## Scope

- 修改 `packages/next-playground/topics/security/headers/LiveHeaders.tsx:34-44`

## Acceptance Criteria

- [ ] effect 内 `const ac = new AbortController()`，fetch 传 `signal: ac.signal`，cleanup `ac.abort()`，catch 忽略 AbortError
- [ ] 挂载后迅速卸载（切路由）无陈旧 setState
- [ ] 安全头实时读取功能无回归
