## Problem

站点已更名「Next 权衡录 / Next Tradeoffs」（commit 9918a01），但 6 处文件头/段落注释仍写旧品牌名「Signal Lab」（「Signal Lab 首页两段」「Signal Lab 视觉系统」「站点识别色 (Signal Lab)」等）。纯注释漂移，不影响运行，但新人会误以为存在第三个品牌。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L3

## Scope

- `packages/next-playground/app/page.tsx:6`
- `packages/next-playground/components/ui/Panel.tsx:3`
- `packages/next-playground/app/globals.css:3,84,241,441`

## Acceptance Criteria

- [ ] 6 处注释替换为当前品牌名或中性描述（如「站点视觉系统」）
- [ ] 全包 grep `Signal Lab` 无残留（git 历史除外）
- [ ] 无行为变更
