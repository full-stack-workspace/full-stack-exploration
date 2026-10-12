## Problem

商品项的 `<button className="...bg-red-500...">Remove</button>` 无 onClick、无 disabled、无说明，是死按钮。购物车专题页面文案是「搜索过滤与状态派生」，这个按钮像遗漏的功能而非演示；英文「Remove」也与全站中文文案不一致。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L16

## Scope

- 修改 `packages/react-playground/src/topics/apps/shopping-cart/ProductList.tsx:29`

## Acceptance Criteria

- [ ] 删除该按钮，或改为 disabled 并注明「演示布局占位」
- [ ] 商品项布局无其他回归
