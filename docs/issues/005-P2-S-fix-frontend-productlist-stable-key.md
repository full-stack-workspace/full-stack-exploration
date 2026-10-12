## Problem

shopping-cart 应用的 `ProductList` 用数组 index 作 React key，但商品数据自带稳定 `id` 字段（'001'~'012'），且列表随搜索条件动态过滤——过滤后顺序/成员变化时 index key 会导致错误的组件复用。当前条目无内部状态暂不表现 bug，但该页定位是「贴近真实业务的完整功能演练」，与同站 basics/list-key 专题教授的「不要用 index 作 key」直接矛盾，无教学标注，判定为真实缺陷。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M5

## Scope

- 修改 `packages/react-playground/src/topics/apps/shopping-cart/ProductList.tsx:58-59`

## Acceptance Criteria

- [ ] 列表渲染改为 `key={product.id}`
- [ ] 搜索过滤交互下商品列表渲染无异常
- [ ] 同文件 `:29` 的死按钮（Remove，无 onClick）不在本 issue 处理——见健康报告 L16，如需一并处理请在评论中说明 [Assumption]
