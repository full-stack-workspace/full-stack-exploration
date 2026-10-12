## Problem

`isStatusFilter` 本是类型守卫，但先用它判一次、再 `params.get('status') as StatusFilter` 强转一次——守卫收窄的类型被断言丢弃，且同一参数调了两次 `get`。同分区 `UrlStateDemo.tsx:29-30` 是正确写法（先存 `raw` 再收窄），两处风格不一致。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L2

## Scope

- 修改 `packages/react-playground/src/topics/advanced/component-comm/practice/index.tsx:152`

## Acceptance Criteria

- [ ] 改为 `const raw = params.get('status'); const status = isStatusFilter(raw) ? raw : 'all';`
- [ ] 不再出现 `as StatusFilter` 断言与重复 `params.get('status')`
- [ ] URL 参数同步行为无回归
