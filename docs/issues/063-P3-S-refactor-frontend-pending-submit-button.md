## Problem

「`useFormStatus` 读父表单 pending → disabled + 文案切换」的小组件在四个文件里各写一遍（CookieControls 里还有两份），结构完全一致，仅样式与文案不同，超过「同模式 3 次」的重复阈值。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L10
> [Assumption] 报告注明「属可选优化，不提取也不算缺陷」；提取时注意保留各专题的教学可读性。

## Scope

- `packages/next-playground/topics/data/dynamic-apis/components/CookieControls.tsx:19,32`
- `packages/next-playground/topics/data/revalidation/components/InvalidateButtons.tsx:30`
- `packages/next-playground/topics/data/forms/components/CreatePostForm.tsx:36`
- `packages/next-playground/topics/data/forms/components/NaiveForm.tsx:23`

## Acceptance Criteria

- [ ] 提取 `<PendingSubmitButton label pendingLabel className>` 共享组件（`components/` 或就近共享），5 处引用切换
- [ ] 各表单提交 pending 态表现（disabled + 文案切换）无回归
