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

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { GenUiPlayground } from "./components/GenUiPlayground";

export default function GenerativeUiTopic() {
    return (
        <TopicPage
            title="Generative UI"
            description="模型输出结构化工具调用,UI 层做组件映射:天气卡片、股价走势图、待办清单直接渲染成真实 React 组件,与文本气泡混排在同一条消息流"
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
