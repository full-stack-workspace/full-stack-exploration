## Problem

`data/blog.ts` 文件头自己声明「jsonplaceholder 是全站唯一的构建期外部依赖」。现有 try/catch 只兜住「出错」，兜不住「永不返回」——源站挂起（不响应也不断连）时，`next build`、ISR 再生与 `/api/blog` 请求都会挂到 undici 默认 300s headersTimeout 才落入兜底，本地种子 fallback 机制迟迟不触发。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` M3
> [Assumption] 优先级 P1（可阻塞构建/ISR 300s）为拆解默认值，可调整。

## Scope

- 修改 `packages/next-playground/data/blog.ts:77`（超时值提取为具名常量）

## Acceptance Criteria

- [ ] fetch 加 `signal: AbortSignal.timeout(10_000)`（或提取的常量值）
- [ ] 模拟源站挂起（如指向不可达地址）时，10s 内落入既有 catch → 本地种子 fallback，构建不阻塞
- [ ] 正常网络下页面与 `/api/blog` 行为不回归
