## Problem

`sdk-chat` 是全站唯一接受 POST body 的 Route Handler，也是唯一对外部输入完全不做防护的端点：`await req.json()` 无 try/catch，畸形 JSON body 由框架兜底成 500（返回 HTML 错误页而非结构化 JSON）；`messages` 直接断言为 `UIMessage[]` 未做形状校验，`convertToModelMessages` 收到畸形消息同样抛错。本站 forms 专题专门教 zod 校验，此处作为「可上线的聊天端点」教学样板与站内教学主张不一致。因是 mock model、无副作用，定 Medium。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-131034.md` M2

## Scope

- 修改 `packages/next-playground/app/api/ai/sdk-chat/route.ts:98`（另见 :118-123）

## Acceptance Criteria

- [ ] `req.json()` 包 try/catch，非 JSON body 返回 `NextResponse.json({ error }, { status: 400 })`
- [ ] `messages` 用 zod（已是项目依赖）schema 校验或 `Array.isArray` 守卫，校验失败返回 400；`convertToModelMessages` 抛错返回 422
- [ ] 畸形 body / 非数组 messages / 畸形消息三种请求分别返回结构化 4xx JSON，不再出现 500 HTML 错误页
- [ ] 正常聊天请求行为不回归
