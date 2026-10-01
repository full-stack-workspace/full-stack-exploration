/**
 * ============================================================================
 * AI 流式端点 — GET /api/ai/stream
 * ============================================================================
 *
 * 真实 SSE(Server-Sent Events)流式端点,替代旧的客户端 async generator 模拟。
 *
 * 功能特点：
 * - 用原生 ReadableStream 按 token 分段 enqueue,间隔 30-80ms
 * - Content-Type: text/event-stream,逐 chunk 刷出(不 buffer)
 * - 感知客户端 abort:cancel 回调 + req.signal 双保险,停止后续推送
 *
 * 生产对应：
 * - 真实场景下这里持有的是上游 LLM 的流式响应;
 *   客户端取消时必须同步 abort 上游调用 —— 不再生成的 token 就是省下的计费
 *
 * @module api/ai/stream/route
 */

import type { NextRequest } from "next/server";

// Route Handler 默认每请求执行;cacheComponents 下不再有
// route segment config,SSE 长连接天然不可能被预渲染

/** 模拟 LLM 输出的预置中文技术文案 */
const PASSAGE =
    "流式响应的价值不在于让总耗时变短,而在于把等待切碎:首 token 在几百毫秒内到达," +
    "用户立刻看到回答正在生长,后续内容以每秒几十个 token 的速度持续追加。" +
    "对 LLM 应用来说,TTFT(首 token 时间)取代 TTFB 成为体验的核心口径;" +
    "而取消按钮也不再只是 UX 礼貌 —— 客户端断开连接的那一刻,服务端应当同步停掉上游推理," +
    "因为每一个不再被阅读的 token 都是真金白银的计算成本。";

/**
 * 把文案切成 2-4 字的「token」片段。
 * 真实场景由上游 LLM 的 stream 事件驱动,这里用定长切片模拟逐 token 到达的节奏。
 */
const TOKENS = PASSAGE.match(/.{2,4}/g) ?? [];

/** token 推送间隔:30-80ms 随机,模拟真实推理的抖动 */
const nextDelay = () => 30 + Math.floor(Math.random() * 50);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /api/ai/stream
 *
 * @param req - 请求对象,用 req.signal 感知客户端断开
 * @returns text/event-stream 响应,事件格式 `data: {"token":"..."}`
 */
export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    // 客户端断开标志:cancel 回调与 req.signal 任一触发即停止
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            for (const token of TOKENS) {
                // 客户端已断开:真实场景此处应 abort 上游 LLM 调用(省计费)
                if (cancelled || req.signal.aborted) {break;}
                await sleep(nextDelay());
                if (cancelled || req.signal.aborted) {break;}
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ token })}\n\n`),
                );
            }
            if (!cancelled && !req.signal.aborted) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
            controller.close();
        },
        cancel() {
            // 浏览器 abort/断开会触发这里;标记后 start 循环在下一个 tick 退出
            cancelled = true;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            // 禁缓存 + 禁中间代理缓冲,保证逐 chunk 到达
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}
