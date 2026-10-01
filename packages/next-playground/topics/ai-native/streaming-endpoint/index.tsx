/**
 * ============================================================================
 * AI 流式响应 — AI-Native 专题
 * ============================================================================
 *
 * 真实 SSE 端点(app/api/ai/stream)+ 前端 getReader() 逐 token 渲染。
 * 观测 TTFT(首 token 时间)与总耗时,演示取消即省计费。
 *
 * 说明:原「客户端模拟版」(旧 ai-models 迁移来的 AIModelsContent 及
 * Suspense 骨架演练组件)已删除 —— 客户端 async generator 模拟与
 * 「真实流式端点」主题格格不入,且其 Suspense 粒度知识点由
 * /rendering/streaming 专题覆盖,不再保留对照。
 *
 * @module topics/ai-native/streaming-endpoint
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { StreamPlayground } from "./components/StreamPlayground";

export default function StreamingEndpointTopic() {
    return (
        <TopicPage
            path="/ai-native/streaming-endpoint"
            title="AI 流式响应"
            description="真实 SSE 流式端点:Route Handler 用 ReadableStream 逐 token 推送,前端 getReader() 边收边渲染;TTFT 才是用户感知的「快」,取消即省计费"
            references={[
                { label: "Vercel AI SDK:useChat(Chatbot 指南)", href: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot" },
                { label: "Next.js 文档:Route Handler(file conventions/route)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/route" },
            ]}
        >
            <TopicSection
                title="真实 SSE 流式演练(可运行)"
                note="GET /api/ai/stream 返回 text/event-stream;前端 fetch + getReader() 逐 chunk 解码渲染,不再是客户端模拟"
            >
                <StreamPlayground />
            </TopicSection>

            <TopicSection
                title="为什么 AI 场景必须流式"
                note="决策要点,而非 API 背诵"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>buffer 完再返回 = 白屏十秒级</strong>:LLM 完整响应以十秒计,
                        等全部生成完再一次返回,用户面对的是长时间白屏;
                        流式把等待切碎,TTFT(首 token 时间)才是用户感知的「快」
                    </li>
                    <li>
                        <strong>SSE 与普通 JSON 的分工</strong>:一次性、结构化的请求-响应(表单、列表、工具决策)
                        用普通 JSON;持续生长、需要边到边渲染的产出(回答、步骤事件)用 SSE。
                        判断依据是「数据是否随时间持续产生」,不是「是不是 AI」
                    </li>
                    <li>
                        <strong>SSE 与 fetch+ReadableStream 自定义协议的取舍</strong>:SSE 自带
                        EventSource(自动重连、事件类型),但只支持 GET、只能推文本事件;
                        本页的 fetch + getReader() 自定义协议更灵活(可 POST、任意二进制、自定义帧格式),
                        代价是半帧拼接、重连、错误恢复都要自己处理 —— 帧边界是协议层的责任,不是 fetch 的
                    </li>
                    <li>
                        <strong>取消 = 省钱</strong>:客户端 AbortController 断开后,
                        服务端 ReadableStream 的 cancel 回调触发 —— 真实场景必须同步停掉上游 LLM 调用,
                        每一个不再被阅读的 token 都是真金白银的推理成本
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="生产里不手写这个:Vercel AI SDK"
                note="手写版的价值是理解协议(帧边界、取消、背压);生产里用 SDK 拿到重试、协议演进与多 provider 适配"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`// Route Handler 侧(示意,ai@7;可运行版见 /ai-native/ai-sdk 专题):
import {
    convertToModelMessages,
    createUIMessageStreamResponse,
    streamText,
    toUIMessageStream,
    type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();
    const result = streamText({
        model: openai("gpt-5"),
        messages: await convertToModelMessages(messages),
    });
    // 帧格式、半帧拼接、取消传播、错误帧都由 SDK 的
    // UI Message Stream 协议封装好
    return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
    });
    // 需要自定义事件时用 createUIMessageStream(见 Agent 长任务页专题)
}

// Client 侧(示意):useChat 接管传输与消息状态机,
// 替代本页 StreamPlayground 里的手写 getReader() 解码;
// 输入框是受控本地状态(@ai-sdk/react@4 起不再内置 input/handleSubmit)
const transport = new DefaultChatTransport({ api: "/api/chat" });
const { messages, sendMessage, status, stop } = useChat({ transport });`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    手写仍合理的场景:教学(像本页这样把协议摊开看)、协议定制(要发的帧不是
                    AI SDK 的消息模型)、零依赖场景(不想为一个端点引入 SDK)。
                    其余情况,手写一套流式协议等于自己承担了它的全部边角案例。
                    本站已安装 ai@7 + @ai-sdk/react@4,上面对应的真实可运行实现见
                    <Link href="/ai-native/ai-sdk" className="mx-1 text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">手写 SSE vs Vercel AI SDK</Link>
                    专题(MockLanguageModelV3 + simulateReadableStream,无 API key 可跑)。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别用流式"
                note="流式也有成本:连接常驻、断线重连、部分产出的兜底处理"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>产出本身很快的场景</strong>:整体响应在几百毫秒内完成的接口,
                        流式只增加复杂度,普通 JSON 一次返回更简单可靠
                    </li>
                    <li>
                        <strong>需要完整校验才能展示的场景</strong>:JSON Schema 严格校验、
                        必须整体签名/对账的数据,边收边渲染会把「半个错误结果」先亮给用户
                    </li>
                    <li>
                        <strong>SEO 内容</strong>:爬虫等不到流结束;被索引的正文仍应走
                        服务端渲染(见渲染策略专题的 Streaming SSR)
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
