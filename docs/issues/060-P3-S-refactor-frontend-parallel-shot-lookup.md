## Problem

`generateStaticParams`（SHOTS.map）与「await params → getShot → notFound」逻辑在两份薄壳中逐行重复，连文件头 cacheComponents 备注注释都相同。仅 2 处未达 3 次重复阈值，但这是「同一条 URL 的两种形态」（完整页 + 拦截模态），漂移风险真实存在（如改其一的 notFound 行为）。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L7

## Scope

- `packages/next-playground/app/router/parallel/shot/[id]/page.tsx:21-41`
- `packages/next-playground/app/router/parallel/@modal/(.)shot/[id]/page.tsx:16-30`

## Acceptance Criteria

- [ ] 在 `topics/router/parallel/` 下抽 `getShotParams()` + `resolveShotOrNotFound(id)` 共享函数，两份薄壳各调一行；或在 intercepted 页文件头补「与 shot/[id]/page.tsx 的查表逻辑保持同步」注释
- [ ] 完整页与拦截模态两种访问形态行为无回归（`pnpm -C packages/next-playground build` 通过，generateStaticParams 产物一致）
