/**
 * ============================================================================
 * 性能治理 · AI-Native 指标金字塔(/performance/ai-native-guide)
 * ============================================================================
 *
 * Core Web Vitals 衡量页面;AI-Native 用户衡量思考与生成。
 * 快但错不如慢但对。成本指标必须进性能看板。
 *
 * @module topics/performance/ai-native/guide
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';

const LAYERS = [
    {
        title: '业务与质量',
        ask: '值不值 · 对不对',
        items: 'TTFUI、任务成功率、采纳率、幻觉率、回退率、重新生成率',
    },
    {
        title: '性能体验',
        ask: '快不快',
        items: 'TTFT、FTRT、TPOT、TPS、流式抖动、感知延迟、取消响应',
    },
    {
        title: '实时多模态',
        ask: '对话感够不够(按需)',
        items: 'ASR RTF、VAD、打断延迟、TTS 首包、帧处理延迟',
    },
    {
        title: '资源与成本',
        ask: '贵不贵 · 撑不撑住',
        items: 'Token/任务、缓存命中、模型路由、上下文占用、端侧电量',
    },
    {
        title: 'Web 基线',
        ask: '壳子达标了吗',
        items: 'LCP、INP、CLS、TTFB、FCP —— 必要不充分',
    },
];

const AiNativeGuide = memo(() => {
    return (
        <TopicPage
            title="AI-Native · 指标金字塔"
            description="指标都绿了用户仍觉得慢,因为没衡量思考。北极星是 TTFUI:第一个真正有用的信息何时出现"
        >
            <SeriesNav current="ai-native-guide" />

            <TopicSection
                title="1. 范式变了:持续流 + 长期会话 + 不确定输出"
                note="讲解要点:传统模型是一次性渲染完成 + 离散交互。AI-Native 是流式输出、工具调用、会话累积。INP 好不等于答案来得快,更不等于答案可用。"
            >
                <Stack>
                    <div className="space-y-2">
                        {LAYERS.map((layer, index) => (
                            <article
                                key={layer.title}
                                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                            >
                                <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                                    {index + 1}. {layer.title}
                                    <span className="ml-2 text-xs font-normal text-gray-400">
                                        {layer.ask}
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                                    {layer.items}
                                </p>
                            </article>
                        ))}
                    </div>
                    <P>
                        质量门槛必须进看板:任务成功率与采纳率。金标准是「快但错不如慢但对」——
                        一次答对的 800ms,好过三次重来的 100ms。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 把 TTFT、FTRT、TTFUI 拆开"
                note="讲解要点:TTFT 是网络到达;FTRT 隔着解析和渲染;TTFUI 还要质量层裁决「有用」。开场白会骗过 TTFT。"
            >
                <Diagram caption="发送之后发生的事">
                    {`用户点击发送
  TTFB   网关/网络首字节
  TTFT   第 1 个 token 到达浏览器     「AI 开始响应了」
  FTRT   第 1 个 token 画到屏幕       「看见了」
  TPOT   相邻 token 间隔              「像说话还是像 PPT」
  TTFUI  第一个真正有用的信息         ★ 北极星
  E2E    完整回答结束

Agent 额外: RAG 检索、工具串行、多步规划
取消: UI 停了但请求还在跑 = 浪费 token + 费用`}
                </Diagram>
            </TopicSection>

            <TopicSection
                title="3. 策略随关键路径分配,而不是「把模型换成更快的」"
                note="讲解要点:和传统架构表同一套思想。思考反馈要立刻有;开场白话术可以砍;工具调用能并行就不要串成瀑布;流式上屏不要攒一大批再 render。"
            >
                <Stack>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                        <li>紧急:发送反馈、停止按钮、打断。失败时也要在 INP 预算内给出态。</li>
                        <li>可后做:完整 Markdown 高亮、引用展开、推荐追问。</li>
                        <li>Stale UI:上一条回答可留着,但必须标明属于哪次提问;金额/权限类输出不能展示过期工具结果。</li>
                        <li>规模:会话 transcript、KV cache、日志都要有保留窗口,否则「越聊越卡」。</li>
                        <li>质量门槛:任务成功率与采纳率进看板。快但错会把 TTFUI 变成负资产。</li>
                    </ul>
                    <AmberTopics
                        items={[
                            {
                                to: '/performance/ai-native-lab',
                                label: '流式体验演练',
                                why: '拖 TTFT/TPOT/开场白/批处理,看 TTFUI 与卡顿如何分家',
                            },
                            {
                                to: '/performance/ai-native-agent',
                                label: 'Agent 工具链',
                                why: 'RAG 与工具串行才是很多 Agent「觉得慢」的原因',
                            },
                            {
                                to: '/agent/agent-chat',
                                label: 'Agent 对话运行时',
                                why: 'SSE → Runtime Store → UI;取消与事件投影的生产结构',
                            },
                            {
                                to: '/performance/governance-guide',
                                label: '原则与约定',
                                why: 'AI 对话同样先写约定表,只是首次可用变成「第一个有用信息」',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

AiNativeGuide.displayName = 'AiNativeGuide';

export default AiNativeGuide;
