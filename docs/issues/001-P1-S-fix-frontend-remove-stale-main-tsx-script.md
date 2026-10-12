## Problem

`packages/react-playground/index.html:53` 残留一个手写 `<script type="module" src="/src/main.tsx">`，但包内入口实为 `src/index.tsx`（不存在 main.tsx，Vite 脚手架改名遗留）。Rsbuild 不处理该标签，而是另注入自己编译的入口——已核实 `dist/index.html` 中该标签原样保留。生产环境每次页面加载都会对 `/src/main.tsx` 发一次 404 模块请求并报 console 错误，100% 触发，影响所有访问者（功能不破，但产生无效请求与噪音）。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` M1
> [Assumption] 优先级 P1（100% 触发的线上噪音）与复杂度 S 为拆解默认值，可调整。

## Scope

- 修改 `packages/react-playground/index.html`，删除第 53 行的 stale script 标签
- 验证 Rsbuild 注入的真实入口不受影响

## Acceptance Criteria

- [ ] `index.html` 中不再存在指向 `/src/main.tsx` 的 script 标签
- [ ] `pnpm -C packages/react-playground build` 成功
- [ ] 构建产物 `dist/index.html` 中无 `/src/main.tsx` 引用
- [ ] 本地预览构建产物，浏览器 Network 面板无 404 请求、Console 无模块加载错误
