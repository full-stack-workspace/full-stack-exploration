/**
 * ============================================================================
 * Generative UI — AI-Native 专题
 * ============================================================================
 *
 * Agent 的「工具调用结果」不必渲染成文本:模型输出结构化工具调用
 * { tool, payload },UI 层按 tool 名映射成真实 React 组件
 * (天气卡片 / 股价走势图 / 待办清单),在同一条消息流里与文本气泡混排。
 *
 * 纯 mock,不接真实 LLM;「决定调用哪个工具」由 Route Handler 关键词路由模拟。
 *
 * @module topics/ai-native/generative-ui
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { GenUiPlayground } from "./components/GenUiPlayground";

export default function GenerativeUiTopic() {
    return (
        <TopicPage
            path="/ai-native/generative-ui"
            title="Generative UI"
            description="模型输出结构化工具调用,UI 层做组件映射:天气卡片、股价走势图、待办清单直接渲染成真实 React 组件,与文本气泡混排在同一条消息流"
            references={[
                { label: "Vercel AI SDK:Generative UI 指南", href: "https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces" },
                { label: "Vercel AI SDK:Tools and Tool Calling", href: "https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling" },
            ]}
        >
            <TopicSection
                title="工具调用渲染演练(可运行)"
                note="GET /api/ai/generative-ui 模拟模型的工具决策;同一条消息流里文本气泡与组件卡片混排"
            >
                <GenUiPlayground />
            </TopicSection>

            <TopicSection
                title="Generative UI 的关键"
                note="分工:模型负责「调哪个工具、参数是什么」,UI 层负责「渲染成什么」"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>模型输出结构化工具调用,不是排版指令</strong>:返回
                        {" `{ tool, payload }` "}契约,组件映射表(GenUiPlayground 里的 ToolRenderer)
                        把 tool 名翻译成真实组件 —— 渲染产物由前端工程师掌控,不依赖模型的排版能力
                    </li>
                    <li>
                        <strong>组件是「活的」</strong>:渲染成 React 组件意味着可以继续交互
                        (刷新行情、勾选待办、展开详情),而文本/图片快照是死的
                    </li>
                    <li>
                        <strong>与 react-playground 的 Agent 实战专题互补</strong>:
                        那边讲状态链路(SSE → Runtime Store → useSyncExternalStore),
                        这边讲渲染产物(工具调用 → 组件映射);两边拼起来才是完整的 Agent 前端
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="生产里不手写这个:AI SDK 的 Generative UI 原语"
                note="本页的「工具调用 → 组件映射」正是 AI SDK tool rendering 的官方模式(ai@7)"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`// 工具定义(示意,ai@7;可运行的协议对照见 /ai-native/ai-sdk 专题):
import { tool, type InferUITools } from "ai";

const tools = {
    getWeather: tool({
        inputSchema: z.object({ city: z.string() }),
        execute: async ({ city }) => fetchWeather(city),
    }),
};
type MyTools = InferUITools<typeof tools>;

// Client 侧(示意):useChat<UIMessage<unknown, never, MyTools>> 之后,
// message.parts 里出现 type === "tool-getWeather" 的类型化部分,
// 按其 state(input/output)映射 <WeatherCard /> 渲染 ——
// 等价于本页 ToolRenderer 那张手写映射表,但协议与类型由 SDK 维护,
// 且工具调用随流逐步到达`}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    手写仍合理的场景:教学(看清「契约 + 映射表」这一层没有任何魔法)、
                    组件渲染要接自研协议或现有数据通道、零依赖场景。
                    生产里用 SDK 可以少维护一套工具调用的流式协议与状态机;
                    对照本站的 SDK 落地版见
                    <Link href="/ai-native/ai-sdk" className="mx-1 text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">手写 SSE vs Vercel AI SDK</Link>
                    专题。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别用 Generative UI"
                note="组件映射表是要长期维护的:每加一个工具,就多一个组件 + 一份契约"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>结果天然是文本的场景</strong>:问答、总结、翻译、写作 —
                        硬把段落文字塞进卡片是过度设计,流式文本就是最优形态
                    </li>
                    <li>
                        <strong>长尾、低频的工具</strong>:组件映射表的维护成本随工具数线性增长;
                        偶尔用一次的工具,渲染成结构化文本/表格比写专用组件划算
                    </li>
                    <li>
                        <strong>payload 形状不稳定的探索期</strong>:工具契约还在频繁变动时,
                        先用通用 JSON 视图顶住,契约稳定后再投资专用组件
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
