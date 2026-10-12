## Problem

security/headers 专题表格遍历单一数据源 `SECURITY_HEADERS`，但「防什么」列查的是手维护的 `HEADER_PURPOSES: Record<string, string>`；`lib/security-headers.ts` 增加新头而忘加说明时 `HEADER_PURPOSES[h.key]` 为 undefined，React 静默渲染空单元格——单一数据源的好处在这一列被绕过。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L11

## Scope

- 修改 `packages/next-playground/topics/security/headers/index.tsx:148`
- 可能配合 `packages/next-playground/lib/security-headers.ts`（purpose 并进 `SecurityHeader` 结构）

## Acceptance Criteria

- [ ] purpose 并进 `lib/security-headers.ts` 的 `SecurityHeader` 结构（配置与文案同源），或至少 `?? "(待补充说明)"` 兜底
- [ ] 模拟新增一个无 purpose 的头时，表格不渲染空单元格
- [ ] 现有头的表格展示无回归
