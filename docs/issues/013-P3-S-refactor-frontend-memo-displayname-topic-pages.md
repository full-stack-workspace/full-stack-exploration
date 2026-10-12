## Problem

AGENTS.md 约定组件用「`memo` + `displayName`」模式，internals 十页全部遵守，但 9 个专题页顶层组件是裸函数（`use-memo/index.tsx` 还用了 `React.FC`）。顶层页面组件 memo 无实际收益，纯一致性问题——但约定存在的意义就是统一，读者对照源码会看到两套风格。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L5

## Scope

为以下文件的顶层页面组件统一 `memo` + `displayName`（纯机械改动，9 个文件）：

- `packages/react-playground/src/topics/basics/fragment/index.tsx:33`
- `packages/react-playground/src/topics/hooks/use-state/index.tsx:254`
- `packages/react-playground/src/topics/hooks/use-reducer/index.tsx:441`
- `packages/react-playground/src/topics/hooks/use-effect/index.tsx:106`
- `packages/react-playground/src/topics/hooks/use-callback/index.tsx:268`
- `packages/react-playground/src/topics/hooks/use-ref/index.tsx:281`
- `packages/react-playground/src/topics/hooks/use-imperative-handle/index.tsx:290`
- `packages/react-playground/src/topics/hooks/use-layout-effect/index.tsx:179`
- `packages/react-playground/src/topics/hooks/use-memo/index.tsx:287`（`React.FC` → `memo`）

## Acceptance Criteria

- [ ] 9 个文件顶层组件均为 `memo(...) + displayName` 写法，无 `React.FC` 残留
- [ ] [Assumption] 若维护者认为「页面顶层组件不 memo」应是正式约定，可改为在包 README 注明并关闭本 issue
- [ ] `pnpm -C packages/react-playground build` 与 `test:run` 通过
