# [P3][S][fix][frontend] Fix dead Remove button and click-only divs

## Problem

三个杂项违规:购物车有一个没有任何功能的"Remove"死按钮(且英文文案混入中文 UI);三处事件冒泡演示用 `div onClick` 无键盘支持;一处用 `<button role="checkbox">` 替代原生 checkbox。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 14 类。

## Scope

- `apps/shopping-cart/ProductList.tsx:29` — Remove 按钮:接上删除逻辑或移除该按钮;补 `hover:` 态;文案改中文"移除"
- `div onClick` 键盘可达性(冒泡演示本体,二选一):
  - `basics/event/components/BubblingDemo.tsx:50`、`SpecialCasesDemo.tsx:88`、`architecture/events/PathDemo.tsx:33-48`
  - 方案 A:补 `role="button"` `tabIndex={0}` + `onKeyDown`(Enter/Space 触发)
  - 方案 B:代码内注释说明"演示事件冒泡,刻意使用裸 div"并配静态说明文字
- `hooks/use-reducer/index.tsx:154` — `<button role="checkbox">` 改为原生 `<input type="checkbox">`(现有 role/aria 正确,属语义优先建议)

## Acceptance Criteria

- [ ] Remove 按钮可实际删除购物车条目(或按钮被移除),文案为中文
- [ ] 冒泡演示区域键盘用户可触发(方案 A),或有明确的豁免注释(方案 B)
- [ ] use-reducer 待办的勾选控件为原生 checkbox
- [ ] `pnpm -C packages/react-playground type-check` 通过
