## Problem

8 个文件超过或接近 500 行阈值，均为注册表/题库/长文梳理页——内容是数据与文案而非纠缠逻辑，学习演示站性质下可接受，属观察项。报告建议暂不处理，但若继续增长应拆分，先立低档 issue 备查。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L18
> [Assumption] 报告建议「暂不处理」，本 issue 作为 backlog 跟踪项；是否立即拆分由维护者决定。

## Scope

涉及文件（行数）：

- `packages/react-playground/src/config/topics.tsx`（687，注册表）
- `packages/react-playground/src/topics/performance/check/bank.ts`（673，题库）
- `packages/react-playground/src/topics/advanced/check/bank.ts`（633，题库）
- `packages/react-playground/src/topics/advanced/rsc/guide/index.tsx`（623，长文）
- `packages/react-playground/src/topics/agent/sync-store-guide/index.tsx`（584，13 个 TopicSection 内联）
- `packages/react-playground/src/topics/hooks/use-reducer/index.tsx`（545，混放 6 个演示组件 + 页面壳）
- `packages/react-playground/src/topics/hooks/check/rest.ts`（543，题库）
- `packages/react-playground/src/topics/basics/check/bank.ts`（513，题库）

## Acceptance Criteria

- [ ] 优先拆 `use-reducer/index.tsx`：演示组件拆到 `components/` 子目录（参照 actions/ 专题结构）
- [ ] 题库 bank.ts 若拆分：按分组每组一个文件再聚合导出
- [ ] 拆分后 `pnpm -C packages/react-playground build`、`test:run`、注册表契约测试全部通过
- [ ] 若决定不拆，在文件头注释说明「内容型长文件，暂不拆分」并关闭本 issue
