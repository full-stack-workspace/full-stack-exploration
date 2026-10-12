## Problem

`assertCheck` 顶部 `import { expect } from 'vitest'`，是纯测试辅助，目前仅被 4 个 `topics/*/check/bank.test.ts` 引用，不会进生产 bundle（无运行时风险）。但它位于 `src/components/` 下，模糊了生产/测试边界，且会被 v8 覆盖率统计计入分母（vitest.config.ts 的 coverage exclude 只排了 `src/test/` 和 `*.test.*`）。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L20

## Scope

- 将 `packages/react-playground/src/components/check/assertCheck.ts` 挪到 `src/test/` 下
- 同步更新 4 个引用方（`topics/*/check/bank.test.ts`）的 import 路径

## Acceptance Criteria

- [ ] `src/components/` 下无 import vitest 的文件
- [ ] 4 个 bank.test.ts 从新位置正常引用 assertCheck
- [ ] `pnpm -C packages/react-playground test:run`（含覆盖率模式）通过，assertCheck 不再计入覆盖率分母
