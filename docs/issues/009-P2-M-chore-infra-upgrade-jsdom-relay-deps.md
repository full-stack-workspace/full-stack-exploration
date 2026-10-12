## Problem

`packages/react-playground/package.json` 中多项依赖主版本落后 2+ 个大版本（截至 2026-10）：`jsdom` ^25→30（落后 5 个）；`react-relay`/`relay-runtime`/`relay-compiler`/`babel-plugin-relay` ^19→21；`typescript` ^5.9→7.0。`vitest` 系与 `vite` 的固定是 vitest.config.ts 注释声明的有意决策，不在本 issue 范围。另外 `@types/react-relay` ^18 与 `react-relay` ^19 错位、`@types/relay-runtime` ^20 反超 `relay-runtime` ^19，类型与运行时不同代。长期落后会累积升级成本与安全风险。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M9
> [Assumption] 优先级 P2、范围限定 jsdom + Relay 系 + @types 对齐为拆解默认值；TS7（原生重写）升级建议单独评估。

## Scope

- 升级 `jsdom` 至当前主版本，跑通 vitest 测试套件
- 升级 `react-relay` / `relay-runtime` / `relay-compiler` / `babel-plugin-relay` 至同一新主版本，并对齐 `@types/react-relay`、`@types/relay-runtime` 到同代
- 重新生成 Relay 产物：`pnpm -C packages/react-playground relay`
- 全量验证：`pnpm -C packages/react-playground build` 与 `test:run`

## Acceptance Criteria

- [ ] `package.json` 中 jsdom 与 Relay 四件套升级到目标主版本，@types 包与运行时同代
- [ ] `pnpm -C packages/react-playground relay` 重新生成的 `__generated__/` 无异常 diff（仅版本性变更）
- [ ] `pnpm -C packages/react-playground build`、`test:run`、根 `pnpm type-check` 全部通过
- [ ] dev 服务器启动后 Relay 演示页（/advanced/relay）功能正常

## Dependencies / Risks

- Relay 大版本升级可能有 compiler 配置变更，需查阅对应 release notes；失败时回滚 `package.json` 与 lockfile
- 不升级 vite/vitest（有意固定）；TS7 升级另行评估

## Out of Scope

- typescript 7.0 升级
- eslint 9→10、tailwindcss 3→4（AGENTS.md 声明有意停留 v3）、react-router-dom 6→7、@rsbuild/core 1→2（各落后 1 个大版本）
