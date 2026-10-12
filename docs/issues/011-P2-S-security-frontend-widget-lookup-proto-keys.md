## Problem

jsx-render 专题把「注册表 + 未知类型兜底」作为生产范式讲授，前提是「配置来自服务端任意字符串」。但 `WIDGETS` 是普通对象字面量，当 `config.type` 为 `'__proto__'`/`'constructor'` 等原型键时，查表返回 truthy 的 `Object.prototype` 而非 undefined，绕过 `UnknownWidget` 兜底后以非组件值渲染直接 crash。当前配置是文件内静态 mock 实际不可达，但作为教学范式，这个洞恰落在它宣称要防的场景上。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L1

## Scope

- 修改 `packages/react-playground/src/topics/basics/jsx-render/components/ConfigDrivenDemo.tsx:145`

## Acceptance Criteria

- [ ] 查表前用 `Object.hasOwn(WIDGETS, config.type)` 判定（或改用 `new Map` 作注册表），原型键返回兜底 `UnknownWidget`
- [ ] 传入 `type: '__proto__'` / `'constructor'` 的配置时渲染 UnknownWidget 而非 crash
- [ ] 正常类型配置渲染无回归
