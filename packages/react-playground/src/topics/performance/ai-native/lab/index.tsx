/**
 * ============================================================================
 * AI-Native · 流式体验演练(/performance/ai-native-lab)
 * ============================================================================
 *
 * 同一条回答,TTFT 好看也可能 TTFUI 很差。把到达、上屏、有用、抖动、取消
 * 拆开测量,才不会把「壳子响应」汇报成「思考变快」。
 *
 * @module topics/performance/ai-native/lab
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { StreamRig } from './components/StreamRig';

const AiNativeLab = memo(() => {
    return (
        <TopicPage
            title="AI-Native · 流式体验演练"
            description="TTFT 决定「开始响了」,TPOT 决定「像不像在思考」,TTFUI 决定「有没有用」。三者必须分着看"
        >
            <SeriesNav current="ai-native-lab" />

            <TopicSection
                title="1. 动手:同一条流,拆出五类时间"
                note="玩法:点发送。再打开开场白、拉高批处理、制造中途卡顿、给停止按钮加取消延迟。看哪些数字动、哪些不动。"
            >
                <StreamRig />
            </TopicSection>

            <TopicSection
                title="2. 和 Agent 运行时、排查怎么接"
                note="讲解要点:本页用定时器模拟到达;生产里事件来自 SSE。取消必须打到真正的请求层,Store 投影不能在 UI 停了之后还追加 token。"
            >
                <Stack>
                    <P>
                        质量层不在这条时间轴上,但验收必须一起看:一次答对的 800ms,好过三次重来的 100ms。
                        成本层同样:为了省 token 截断上下文,TTFUI 可能突然崩掉。
                    </P>
                    <AmberTopics
                        items={[
                            {
                                to: '/performance/ai-native-guide',
                                label: '指标金字塔',
                                why: '五层指标以及「快但错不如慢但对」',
                            },
                            {
                                to: '/performance/ai-native-agent',
                                label: 'Agent 工具链',
                                why: '开口之后还有检索和工具;取消必须停计费',
                            },
                            {
                                to: '/performance/diagnose-lab',
                                label: '排查演练',
                                why: '选「AI 觉得慢」看假设模板:开场白 vs 网关 vs 工具瀑布',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

AiNativeLab.displayName = 'AiNativeLab';

export default AiNativeLab;
