## Problem

i18n 专题页声称 cacheComponents 下「params 的 await 必须包在 Suspense 里」，但同一代码库 `app/router/dynamic-routes/[id]/page.tsx:53`、`app/router/parallel/shot/[id]/page.tsx:36`、`app/router/parallel/@modal/(.)shot/[id]/page.tsx:25` 三处都在 Page 顶层裸 `await params`，无 Suspense，站点正常构建运行。Next 对 `params`/`searchParams` 的处理与 cookies()/headers() 不同——不要求 Suspense 边界。教学站里一条被自家代码反例推翻的「必须」会误导读者。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L6

## Scope

- 修改 `packages/next-playground/topics/router/i18n/index.tsx:125-127`

## Acceptance Criteria

- [ ] 文案改为「params 本身不要求 Suspense，本页包一层是为了演示『壳先吐、内容后补』的结构」（或说明包装是风格选择而非契约）
- [ ] 页面其余 cacheComponents 论述不受影响
