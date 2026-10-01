/**
 * ============================================================================
 * AI SDK 聊天端点 — POST /api/ai/sdk-chat
 * ============================================================================
 *
 * 与 app/api/ai/stream(手写 SSE)同一场景的 SDK 版对照实现:
 * Vercel AI SDK 的 streamText + UI Message Stream 协议返回流式回答。
 * 帧格式、半帧拼接、取消传播、错误帧都由 SDK 封装,route 只描述「要什么」。
 *
 * 功能特点：
 * - 无 API key 可运行:model 用 ai/test 的 MockLanguageModelV3 +
 *   simulateReadableStream,把一段预置中文回答按 token 节奏流出
 * - 生产替换:把 mockModel 换成真实 provider model(如
 *   @ai-sdk/openai 的 openai("gpt-5")),其余代码一行不动
 * - 客户端 abort(fetch 断开)由 SDK 传播进模型的 abortSignal,
 *   mock 流随之停推 —— 等价于手写版 ReadableStream 的 cancel 回调
 *
 * @module api/ai/sdk-chat/route
 */

import {
    convertToModelMessages,
    createUIMessageStreamResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
} from "ai";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";

// Route Handler 默认每请求执行;cacheComponents 下不再有
// route segment config,SSE 长连接天然不可能被预渲染

/** 模拟 LLM 输出的预置中文回答(与手写版同主题,便于读者对照) */
const ANSWER =
    "这一行回答来自 AI SDK 的 streamText,而不是手写的 ReadableStream。" +
    "对比 /api/ai/stream:那边要自己 enqueue 每一帧 SSE 文本、自己处理取消;" +
    "这边只描述「用什么模型、给什么消息」,帧格式(text-start / text-delta / finish)、" +
    "错误帧与取消传播都由 SDK 的 UI Message Stream 协议封装好。" +
    "生产环境里把 mock model 换成真实 provider model,这份 route 就是可上线的聊天端点。";

/** 切成 1-3 字片段,模拟真实模型逐 token 到达的节奏 */
const TOKENS = ANSWER.match(/.{1,3}/g) ?? [];

/** 同一轮回答的 text-start / text-delta / text-end 共用一个块 id */
const TEXT_ID = "text-1";

/** 上报给 UI 协议的假用量,让 finish 帧形状与真实 provider 一致 */
const USAGE = {
    inputTokens: { total: 24, noCache: 24, cacheRead: undefined, cacheWrite: undefined },
    outputTokens: { total: TOKENS.length, text: TOKENS.length, reasoning: undefined },
};

/**
 * 教学用 mock 模型:doStream 返回一条 simulateReadableStream,
 * 按「stream-start → text-start → 逐 token text-delta → text-end → finish」
 * 的 LanguageModelV3 协议流出。
 *
 * 生产替换点:换成 `openai("gpt-5")` 等真实 provider model 即可,
 * streamText / useChat / 协议层全部不变。
 */
const mockModel = new MockLanguageModelV3({
    provider: "mock",
    modelId: "mock-chat",
    doStream: async () => ({
        stream: simulateReadableStream({
            // 首帧延迟模拟 TTFT,帧间隔模拟推理节奏
            initialDelayInMs: 300,
            chunkDelayInMs: 50,
            chunks: [
                { type: "stream-start" as const, warnings: [] },
                { type: "text-start" as const, id: TEXT_ID },
                ...TOKENS.map((delta) => ({
                    type: "text-delta" as const,
                    id: TEXT_ID,
                    delta,
                })),
                { type: "text-end" as const, id: TEXT_ID },
                {
                    type: "finish" as const,
                    finishReason: { unified: "stop" as const, raw: undefined },
                    usage: USAGE,
                },
            ],
        }),
    }),
});

/**
 * POST /api/ai/sdk-chat
 *
 * 请求体由 useChat 的 DefaultChatTransport 发出:{ messages: UIMessage[] }。
 * 响应是 UI Message Stream(text/event-stream,帧为 JSON 编码的 UIMessageChunk)。
 *
 * @param req - 请求对象;body 里的消息历史经 convertToModelMessages 转成模型消息
 * @returns UI Message Stream 响应,供 useChat 消费
 */
export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: mockModel,
        messages: await convertToModelMessages(messages),
    });

    // 模型流(TextStreamPart)→ UI 消息流(UIMessageChunk)→ SSE Response;
    // 等价于手写版的 ReadableStream + 逐帧 enqueue,但协议由 SDK 维护
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
    });
}
