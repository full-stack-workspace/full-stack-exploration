## Problem

4 处演示日志列表使用 `key={`${line}-${index}`}`，key 混入数组 index。日志行纯文本无内部状态、列表只追加，不会出实际 bug；但同站点 basics/list-key 专题正在教「不要用 index 作 key」，读者对照源码时会看到相反示范。TimingDemo/PathDemo 用模块级自增 id 做 key 是正确做法，正好说明可以统一。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L8

## Scope

- 修改 `packages/react-playground/src/topics/hooks/use-effect/index.tsx:91`
- 修改 `packages/react-playground/src/topics/hooks/use-callback/index.tsx:252`
- 修改 `packages/react-playground/src/topics/hooks/use-ref/index.tsx:230`
- 修改 `packages/react-playground/src/topics/hooks/use-layout-effect/index.tsx:81`

## Acceptance Criteria

- [ ] 4 处日志列表 key 改为序号 ref 等稳定 id（或加注释说明「行无状态、仅追加，index key 在此安全」）
- [ ] 演示日志功能无回归
