/**
 * ============================================================================
 * 性能治理 · 指标实验室(/performance/metrics-lab)
 * ============================================================================
 *
 * 先选场景,再决定北极星。Core Web Vitals 衡量页面;
 * AI-Native 用户衡量思考。业务完成时间必须单独列。
 *
 * @module topics/performance/governance/metrics-lab
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { CausalChain } from './components/CausalChain';
import { SceneMetrics } from './components/SceneMetrics';

const MetricsLab = memo(() => {
    return (
        <TopicPage
            title="性能治理 · 指标实验室"
            description="减少工作量、缩短关键路径、改善响应,是不同目标。先选场景,再决定哪几个数字能验收「快」"
        >
            <SeriesNav current="metrics-lab" />

            <TopicSection
                title="1. 三类「快」不要混成一个分数"
                note="讲解要点:加载(何时看到主要内容)、交互(输入点击何时有反馈)、业务完成(筛选/生成/上传何时真正完成)。Lighthouse 一次跑完不能代替约定表。"
            >
                <Stack>
                    <CausalChain />
                    <P>
                        实验室数据适合 CI 预算;现场 RUM 看 P75/P95。比较时固定构建设备网络和数据规模,
                        并区分冷缓存与热缓存。DOMContentLoaded / Load 是技术生命周期,不等于用户已经能办事。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 动手:换场景,北极星会换人"
                note="玩法:在商品搜索 / AI 对话 / 语音 Agent 之间切换。同一行指标的角色会从北极星变成基线或「此刻不看」。"
            >
                <SceneMetrics />
            </TopicSection>

            <TopicSection
                title="3. AI-Native 补一层:页面绿了,思考仍可能很慢"
                note="讲解要点:TTFT 像「AI 开始响了」,FTRT 才是上屏,TTFUI 才是有用。开场白 token 会让 TTFT 很好看、TTFUI 仍然差。"
            >
                <Stack>
                    <Diagram caption="一次发送的时间轴(详见 AI-Native 专题)">
                        {`点击发送
  ├─ TTFB     网关首字节(壳子)
  ├─ TTFT     第 1 个 token 到达
  ├─ FTRT     第 1 个 token 上屏  ← 解析/Markdown/列表可能再吃 200ms+
  ├─ TTFUI    第一个真正有用的信息  ★
  └─ E2E      完整回答结束

中间 TPOT 决定像说话还是像翻 PPT;抖动次数 = Stream Jank`}
                    </Diagram>
                    <AmberTopics
                        items={[
                            {
                                to: '/performance/ai-native-guide',
                                label: 'AI-Native 指标金字塔',
                                why: '业务与质量、流式体验、多模态、成本、Web 基线五层怎么叠',
                            },
                            {
                                to: '/performance/ai-native-lab',
                                label: '流式体验演练',
                                why: '拖 TTFT/TPOT/开场白,看 TTFUI 和卡顿次数怎么分家',
                            },
                            {
                                to: '/performance/architecture-guide',
                                label: '架构关键路径',
                                why: '指标选定之后,用区域表决定谁可以慢、谁不准挡路',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

MetricsLab.displayName = 'MetricsLab';

export default MetricsLab;
