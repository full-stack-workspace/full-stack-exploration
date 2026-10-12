## Problem

AfterDemo 客户端写死「等 400ms 再读」，其正确性依赖 `app/api/after-demo/route.ts` 里写死的「延迟 300ms 落账」；任何一侧改数值，演示的「+1 已落账」断言会静默失效（不报错，只是观察不到）。两端分属 client/server 无法共享模块，两个魔法数字无任何交叉引用。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L9

## Scope

- `packages/next-playground/topics/data/dynamic-apis/components/AfterDemo.tsx:54-55`
- `packages/next-playground/app/api/after-demo/route.ts`（300ms 处）

## Acceptance Criteria

- [ ] route.ts 的 300ms 注释里反向标注「客户端 AfterDemo.tsx 依赖此值」（或反向）；或客户端改为有上限的轮询读数，消除时序假设
- [ ] after() 演示的「+1 已落账」可观察行为不回归
