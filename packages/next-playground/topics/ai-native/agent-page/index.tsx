/**
 * ============================================================================
 * Agent 长任务页 — AI-Native 专题
 * ============================================================================
 *
 * 模拟多步 Agent 任务流:规划 → 检索(RAG)→ 工具调用(串行/并行对照)
 * → 校验(可跳过,演示「快但错」)→ 汇总。
 * Route Handler 用 SSE 推送步骤事件,前端渲染步骤时间线。
 *
 * UX 核心:过程可见(步骤时间线)+ 可取消(AbortController 省计费)。
 *
 * @module topics/ai-native/agent-page
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { AgentPlayground } from "./components/AgentPlayground";

export default function AgentPageTopic() {
    return (
        <TopicPage
            title="Agent 长任务页"
            description="多步 Agent 任务流的过程可视化:SSE 推送步骤事件,前端渲染 pending/running/done 时间线;串行 vs 并行墙钟对照,取消即省计费"
        >
            <TopicSection
                title="长任务演练(可运行)"
                note="GET /api/ai/agent 推送步骤事件流;切换「串行/并行」与「跳过校验」再跑一轮,对比墙钟"
            >
                <AgentPlayground />
            </TopicSection>

            <TopicSection
                title="Agent 页的 UX 核心"
                note="长任务体验的两个支柱:过程可见、可取消"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>过程可见</strong>:多步任务动辄几十秒,只转一个 loading 圈等于黑盒;
                        步骤时间线把「现在在干什么」摊开,等待从焦虑变成可读信息,
                        出错时也能定位到具体步骤
                    </li>
                    <li>
                        <strong>可取消</strong>:长任务 + 计费场景,取消按钮是成本控制不是 UX 礼貌;
                        客户端 AbortController 断开后,服务端要感知 cancel 并停掉后续步骤与上游调用
                    </li>
                    <li>
                        <strong>指标口径</strong>:TTFT(首 token)管「什么时候开始有动静」,
                        TTFUI(首个可用 UI)管「什么时候能读能点」,墙钟管「总共等了多久」;
                        这套口径的系统梳理见 react-playground 练习场(port 3002)
                        性能分类下的 AI-Native 专题,本页只落地「墙钟对照」这一项
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用步骤时间线"
                note="时间线是长任务的解药,也是短任务的噪音"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>单轮问答</strong>:一轮请求-响应没有「步骤」可言,
                        套时间线是硬造过程感 —— 用流式文本(见流式端点专题)即可
                    </li>
                    <li>
                        <strong>步骤粒度太细</strong>:内部重试、子调用全摊开会刷屏,
                        用户只关心「可解释的里程碑」;粒度以「失败时用户能理解卡在哪」为准
                    </li>
                    <li>
                        <strong>步骤不可预知的探索型任务</strong>:步骤数与顺序由模型现场决定时,
                        预置时间线对不上;改用「事件流日志」形态(追加式)而不是固定骨架
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
