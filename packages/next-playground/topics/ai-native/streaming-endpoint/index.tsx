/**
 * ============================================================================
 * AI 流式响应 — AI-Native 专题
 * ============================================================================
 *
 * 从原 /ai-models 页迁移:以 AI 模型列表为场景,用 async generator
 * 模拟分段输出,配合 Suspense 骨架感受「边生成边渲染」的体验基线。
 *
 * 注意:当前版本在客户端模拟流式(streamModels generator);
 * 真实的 ReadableStream/SSE 流式端点将在后续阶段重写本页。
 *
 * @module topics/ai-native/streaming-endpoint
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { AIModelsContent } from "./components/AIModelsContent";

export default function StreamingEndpointTopic() {
    return (
        <TopicPage
            title="AI 流式响应"
            description="以 AI 模型列表为场景模拟流式加载:Suspense 骨架 + async generator 分段输出,感受「边生成边渲染」的体验基线"
        >
            <TopicSection
                title="流式加载演练(客户端模拟)"
                note="列表与详情分段到达;真实流式端点(ReadableStream/SSE)在后续阶段替换本模拟"
            >
                <AIModelsContent />
            </TopicSection>

            <TopicSection
                title="为什么 AI 场景必须流式"
                note="决策要点,而非 API 背诵"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>LLM 完整响应以十秒计,非流式等于白屏等待;TTFT(首 token 时间)才是用户感知的「快」</li>
                    <li>Streaming SSR 与 RSC 载荷天然适配分段渲染——这是 Next.js 做 AI 应用的结构性优势</li>
                    <li>但「快但错不如慢但对」:流式只解决体验指标,正确性指标见 react-playground 的 AI-Native 专题</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
