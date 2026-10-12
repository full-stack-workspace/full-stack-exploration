## Problem

`components/UserCard.tsx:33` 使用原生 `<img>`，是 `pnpm lint` 的唯一 warning（`@next/next/no-img-element`）。但 `topics/engineering/asset-perf/index.tsx:11,101` 明确写明「本站的 `<img>` 用法是有意保留的反面教材（lint 可证）」——这条 warning 本身就是专题页引用的活证据。当前状态是「lint 输出永远黄一条」，长期会麻痹对新增 warning 的敏感度。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` L1

## Scope

- `packages/next-playground/components/UserCard.tsx:33`：加定向 `// eslint-disable-next-line @next/next/no-img-element -- 教学反面教材,见 /engineering/asset-perf`
- `packages/next-playground/topics/engineering/asset-perf/index.tsx`：同步更新专题页文案（目前依赖 warning 存在作为「lint 可证」，需改为「源码注释可证」）

## Acceptance Criteria

- [ ] 两处改动一起提交（注释与专题页文案保持一致）
- [ ] `pnpm -C packages/next-playground lint` 输出 0 errors / 0 warnings
- [ ] asset-perf 专题页对 `<img>` 反面教材的论述仍然成立（改引用源码注释而非 lint 输出）

## Out of Scope

- 不把 `<img>` 改为 next/image（教学故意保留）；`picsum.photos` 加 `remotePatterns` 白名单仅在未来真换 next/image 时才需要
