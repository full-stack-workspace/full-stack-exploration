## Problem

同一个 15 行的 `ProbeCard`（含 Props 接口）在 4 个 hooks 专题文件中逐字复制；「memo/未 memo 成对的渲染计数子组件」（`MemoThemeChip/PlainThemeChip` vs `MemoPingChild/PlainPingChild`）也是同模式第 2 份。已达重复阈值，且这些文件都有公共组件目录可放。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M8

## Scope

- 提取 `ProbeCard` 到 `packages/react-playground/src/components/`（或 hooks 分类共享文件），修改 4 处引用：
  - `src/topics/hooks/use-memo/index.tsx:35`
  - `src/topics/hooks/use-callback/index.tsx:48`
  - `src/topics/hooks/use-ref/index.tsx:31`
  - `src/topics/hooks/use-imperative-handle/index.tsx:45`
- 计数 chip 抽象为参数化 label 的 `<RenderCountChip label>`（可选，若收益不大可留注释说明）

## Acceptance Criteria

- [ ] ProbeCard 全仓仅一份实现，4 处专题页改为 import
- [ ] 4 个专题页的探针卡片渲染与交互无回归
- [ ] [Assumption] 渲染计数 chip 是否一并抽象由实现者按收益决定，不作为 Done 的硬性条件
