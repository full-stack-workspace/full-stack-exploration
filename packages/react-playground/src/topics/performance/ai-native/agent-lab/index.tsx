/**
 * ============================================================================
 * AI-Native · Agent 工具链演练(/performance/ai-native-agent)
 * ============================================================================
 *
 * Agent 不是更长的聊天。关键路径多了检索、工具、规划;成本在取消和重试上放大。
 * 本页把串行瀑布、并行、取消计费、快但错对照放到同一任务上。
 *
 * @module topics/performance/ai-native/agent-lab
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { AgentPipeline } from './components/AgentPipeline';
import { QualityTradeoff } from './components/QualityTradeoff';

const AgentLab = memo(() => {
    return (
        <TopicPage
            title="AI-Native · Agent 工具链演练"
            description="TTFT 只证明模型开口了。Agent 的北极星仍是 TTFUI,瓶颈经常在工具瀑布和取消是否真停"
        >
            <SeriesNav current="ai-native-agent" />

            <TopicSection
                title="1. Agent 的耗时链比聊天长一截"
                note="讲解要点:规划 token、RAG、多个 function call、再生成。任何一环串行,TTFUI 就被加总。壳子 INP 再绿也救不了这条链。"
            >
                <Diagram caption="同一问句,两条实现">
                    {`发送
  → 思考 token          TTFT(开口)
  → RAG 检索
  → 库存 / 权限 / 下单工具   ← 串行则相加,并行则取 max
  → 第一条有用建议       TTFUI ★
  → 完整回答             E2E

取消:UI 停了但工具请求还在跑
  = 浪费 token + 可能写到一半的副作用`}
                </Diagram>
            </TopicSection>

            <TopicSection
                title="2. 动手:同一任务,串行 vs 并行 vs 取消"
                note="玩法:先串行跑完,看 TTFT 和 TTFUI 差多少。打开并行再跑。任务中途取消,并把取消延迟拉大,看已烧掉的 token。"
            >
                <AgentPipeline />
            </TopicSection>

            <TopicSection
                title="3. 快但错会把「变快」变成两次更慢"
                note="讲解要点:幻觉库存、编造引用、工具失败却继续写,都会逼用户重来。验收必须同时看任务成功率和 token/任务。"
            >
                <Stack>
                    <QualityTradeoff />
                    <P>
                        流式页练的是上屏节奏;本页练的是工具布局与计费。生产结构(SSE → Runtime Store →
                        取消投影)在 Agent 对话运行时。
                    </P>
                    <AmberTopics
                        items={[
                            {
                                to: '/performance/ai-native-lab',
                                label: '流式体验演练',
                                why: '开场白、批处理、TPOT 抖动;还没到工具这一层',
                            },
                            {
                                to: '/performance/ai-native-guide',
                                label: '指标金字塔',
                                why: '成本层与质量层必须和 TTFUI 同一块看板',
                            },
                            {
                                to: '/agent/agent-chat',
                                label: 'Agent 对话运行时',
                                why: '事件投影与暂停取消的生产形状,不在本页重做 Store',
                            },
                            {
                                to: '/performance/implement-lab',
                                label: '实现六规则',
                                why: '请求去重、取消、容量上限;工具调用同样适用',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

AgentLab.displayName = 'AgentLab';

export default AgentLab;
