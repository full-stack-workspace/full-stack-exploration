## Problem

防闪烁内联脚本（index.html）与 `readStoredTheme()`（ThemeProvider）各自解析 `'react-playground:theme:v1'` 并校验合法性——SPA 防闪烁属常见必要重复，但 key 字面量在两处硬编码、无互相引用的注释，改 key 或改合法值集合时容易只改一边。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L23

## Scope

- 修改 `packages/react-playground/index.html:40`
- 修改 `packages/react-playground/src/context/ThemeProvider.tsx:22,36-47`

## Acceptance Criteria

- [ ] 两处各加一行互相指向的注释（或将校验规则 `light|dark` 抽成注释中明确的契约）
- [ ] 主题切换与防闪烁行为无回归
