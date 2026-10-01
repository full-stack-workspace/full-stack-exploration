/**
 * ============================================================================
 * 手写 SSE vs Vercel AI SDK — AI-Native 专题
 * ============================================================================
 *
 * 前面三个专题(流式端点 / Generative UI / Agent 长任务)都是手写 SSE:
 * 摊开协议看清每一帧。本页把同一个聊天场景用 Vercel AI SDK 再做一遍,
 * 回答「SDK 到底省掉了什么、又多给了什么、什么时候仍该手写」。
 *
 * 活演示无 API key 可运行:后端 app/api/ai/sdk-chat 用 ai/test 的
 * MockLanguageModelV3 + simulateReadableStream 造一段逐 token 的假回答,
 * 前端 useChat(@ai-sdk/react)消费,协议、取消、状态机都是真的。
 *
 * @module topics/ai-native/ai-sdk
 */

import Link from "next/link";
import { Suspense } from "react";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { RawStreamViewer } from "./components/RawStreamViewer";
import { SdkChatPlayground } from "./components/SdkChatPlayground";

/** 手写版端点(app/api/ai/stream/route.ts)的关键路径,约 20 行 */
const HANDWRITTEN_ROUTE = `// 手写版:app/api/ai/stream/route.ts(节选关键路径,约 20 行)
export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            for (const token of TOKENS) {
                if (cancelled || req.signal.aborted) { break; }   // 取消检查 ×2
                await sleep(nextDelay());
                if (cancelled || req.signal.aborted) { break; }
                controller.enqueue(                                  // 自己拼帧
                    encoder.encode(\`data: \${JSON.stringify({ token })}\\n\\n\`),
                );
            }
            controller.enqueue(encoder.encode("data: [DONE]\\n\\n")); // 终止哨兵
            controller.close();
        },
        cancel() { cancelled = true; },                              // 取消回调
    });

    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream; charset=utf-8",
                   "Cache-Control": "no-cache, no-transform",
                   "X-Accel-Buffering": "no" },                       // 防代理缓冲
    });
}`;

/** SDK 版端点(app/api/ai/sdk-chat/route.ts)的全部核心逻辑 */
const SDK_ROUTE = `// SDK 版:app/api/ai/sdk-chat/route.ts(核心就这几行)
export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const result = streamText({
        model: mockModel,  // 生产换成 openai("gpt-5"),其余不动
        messages: await convertToModelMessages(messages),
    });
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
    });
}
// 帧格式、取消传播、防缓冲响应头、错误帧 —— 全部由 SDK 维护`;

const TOOL_RENDERING_SNIPPET = `// Generative UI 的 SDK 版:消息 parts 里带类型化的工具调用,
// 前端按 tool 名映射组件 —— 契约与本站手写版相同,协议由 SDK 维护
import { tool, type InferUITools } from "ai";

const tools = {
    getWeather: tool({
        inputSchema: z.object({ city: z.string() }),
        execute: async ({ city }) => fetchWeather(city),
    }),
};
type MyTools = InferUITools<typeof tools>;

// Client:useChat<UIMessage<unknown, never, MyTools>> 之后
// message.parts 里出现 type === "tool-getWeather" 的部分,
// 按 input/output 状态渲染 <WeatherCard /> —— 等价于手写专题
// 里的 ToolRenderer 映射表,但类型安全且随流逐步到达`;

const DATA_PARTS_SNIPPET = `// Agent 时间线的 SDK 版:步骤事件用 createUIMessageStream 的
// transient data part 下发 —— 推到前端、不进消息历史,
// 正是手写专题里「步骤时间线」事件的官方载体
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

return createUIMessageStreamResponse({
    stream: createUIMessageStream({
        execute: async ({ writer }) => {
            writer.write({ type: "data-step", data: { step: "retrieve", status: "running" } });
            // … 跑工具、写 text-delta,最后 writer.write({ type: "finish" })
        },
    }),
});
// Client:useChat 的 onData 回调逐条收到 data-step,渲染时间线`;

export default function AiSdkTopic() {
    return (
        <TopicPage
            path="/ai-native/ai-sdk"
            title="手写 SSE vs Vercel AI SDK"
            description="同一个聊天场景做两遍:手写 ReadableStream + getReader() 对照 streamText + useChat;SDK 收编了分帧、取消与协议演进,还带来多 provider、tool calling 与 data parts"
            references={[
                { label: "Vercel AI SDK:Chatbot(useChat 指南)", href: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot" },
                { label: "Vercel AI SDK:streamText(Generating Text)", href: "https://ai-sdk.dev/docs/ai-sdk-core/generating-text" },
                { label: "Vercel AI SDK:UI Message Stream 协议", href: "https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol" },
            ]}
        >
            <TopicSection
                title="活演示:useChat + streamText(可运行)"
                note="POST /api/ai/sdk-chat;后端是 MockLanguageModelV3 + simulateReadableStream,无 API key;生产把 mock model 换成 provider model 即可"
            >
                {/* useChat 在渲染期生成聊天 id(Math.random),cacheComponents 下
                    客户端随机源必须待在 Suspense 边界内,否则预渲染报错 */}
                <Suspense>
                    <SdkChatPlayground />
                </Suspense>
            </TopicSection>

            <TopicSection
                title="同一场景,两遍代码"
                note="行数本身就是论点:手写版要自己管帧格式、取消与防缓冲头;SDK 版只描述「用什么模型、给什么消息」"
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <p className="mb-2 font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                            手写版 · 关键路径约 20 行
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{HANDWRITTEN_ROUTE}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-2 font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                            SDK 版 · 核心 5 行
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{SDK_ROUTE}
                        </pre>
                    </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    客户端同样如此:手写版的 fetch + getReader() + 半帧 buffer + AbortController
                    (见<Link href="/ai-native/streaming-endpoint" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">流式端点专题</Link>的
                    StreamPlayground),在 SDK 版里收敛成 useChat 一个 Hook ——
                    消息历史、status 状态机、stop() 取消全部内置。
                </p>
            </TopicSection>

            <TopicSection
                title="协议对照:SDK 的帧长什么样"
                note="SDK 不是魔法,它替你维护的是一条有据可查的协议:UI Message Stream(text/event-stream,帧为 JSON 编码的 UIMessageChunk)"
            >
                <RawStreamViewer />
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>帧是类型化的 JSON,不是自定义文本</strong>:text-start / text-delta /
                        text-end / finish / error 各有固定 shape,响应头带
                        {" `x-vercel-ai-ui-message-stream: v1` "}声明协议版本 ——
                        手写版的{" `data: {\"token\":\"...\"}` "}契约只有你自己认识
                    </li>
                    <li>
                        <strong>协议演进由 SDK 兜底</strong>:data stream 协议从 v1 文本流到
                        UI Message Stream 几经升级,跟着 SDK 升版本即可;手写协议的演进成本全在自己
                    </li>
                    <li>
                        <strong>取消与错误是一等公民</strong>:客户端 stop() 沿协议传播到模型的
                        abortSignal;模型报错被封装成 error 帧进 useChat 的 error 状态,
                        手写版这两件事都要自己设计
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="SDK 还多给了什么"
                note="省掉的是管道工,多给的是生态位"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>多 provider 互换</strong>:model 参数是个接口,OpenAI / Anthropic /
                        Google / 自建网关可以一行换掉;手写 SSE 时每家 provider 的流格式都要自己适配
                    </li>
                    <li>
                        <strong>tool calling 的完整回路</strong>:工具定义(zod schema)→ 模型调用 →
                        执行 → 结果回灌 → 继续生成,streamText 的 stopWhen / prepareStep 管多步循环;
                        前端 parts 里直接拿到类型化的 tool-* 部分
                    </li>
                    <li>
                        <strong>data parts:消息之外的带外数据</strong>:transient data part 推到前端但不进
                        消息历史,正是步骤时间线、来源引用这类「过程数据」的官方载体
                    </li>
                    <li>
                        <strong>消息状态机与续传</strong>:useChat 内置 messages 合并、regenerate、
                        resumeStream(断线重连续传),这些手写时是另一个量级的工程量
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="另外两个手写专题的 SDK 原语"
                note="不做活演示,指明对应的官方原语即可 —— 模式相同,协议由 SDK 接管"
            >
                <div className="space-y-4">
                    <div>
                        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Generative UI → tool rendering
                            <Link
                                href="/ai-native/generative-ui"
                                className="ml-2 text-xs font-normal text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400"
                            >
                                对照手写专题
                            </Link>
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TOOL_RENDERING_SNIPPET}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Agent 时间线 → transient data parts
                            <Link
                                href="/ai-native/agent-page"
                                className="ml-2 text-xs font-normal text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400"
                            >
                                对照手写专题
                            </Link>
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{DATA_PARTS_SNIPPET}
                        </pre>
                    </div>
                </div>
            </TopicSection>

            <TopicSection
                title="什么时候仍手写"
                note="手写与 SDK 不是新旧替代,是不同取舍 —— 三个手写专题就是「摊开看协议」的价值本身"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>教学</strong>:像本站前三个专题(<Link href="/ai-native/streaming-endpoint" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">流式端点</Link>、
                        <Link href="/ai-native/generative-ui" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Generative UI</Link>、
                        <Link href="/ai-native/agent-page" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Agent 长任务</Link>)
                        那样把帧边界、半帧拼接、取消摊开 —— 理解了协议,才用得动 SDK 的 escape hatch
                    </li>
                    <li>
                        <strong>协议定制</strong>:要发的帧不匹配 AI SDK 的消息模型(比如二进制增量、
                        领域专有事件总线),硬套 SDK 协议比手写更拧巴
                    </li>
                    <li>
                        <strong>零依赖场景</strong>:边缘函数包体受限、或只是给内部工具加一个小端点,
                        为一个流式接口引入整个 SDK 不划算
                    </li>
                    <li>
                        <strong>反过来,默认用 SDK</strong>:只要场景落在「LLM 聊天 / 工具调用 / 步骤事件」
                        这个主流区间,手写协议等于自己承担它的全部边角案例与后续演进
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
