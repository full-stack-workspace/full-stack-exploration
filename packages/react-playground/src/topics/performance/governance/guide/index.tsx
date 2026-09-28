/**
 * ============================================================================
 * 性能治理 · 原则与约定(/performance/governance-guide)
 * ============================================================================
 *
 * 性能优化不是从 memo 开始。本页给出三目标、五原则、阶段地图,
 * 以及一张可改的「性能约定表」——后面的指标、架构、实现、排查都从这里派生。
 *
 * @module topics/performance/governance/guide
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { FlowList, type FlowStep } from '../../../../components/FlowList';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { PactCard } from '../components/PactCard';

const STAGE_STEPS: FlowStep[] = [
    {
        title: '需求:先写性能约定',
        hint: '主要任务、首次可用、紧急 vs 可后做、新鲜度、目标设备与数据规模',
        tone: 'state',
    },
    {
        title: '架构:围绕关键路径分配工作',
        hint: '每个区域何时生成、在哪执行、缓存多久、哪些代码会到浏览器',
        tone: 'render',
    },
    {
        title: '实现:六条默认规则',
        hint: '所有权、请求边界、紧急/非紧急、规模上限、资源优先级、记忆化最后',
        tone: 'commit',
    },
    {
        title: '排查:沿耗时链取证',
        hint: '把「慢」写成可复现描述,只改有证据的瓶颈',
        tone: 'layout',
    },
    {
        title: '上线:收益证据 + 防回归',
        hint: '前后对比、机制成立、正确性、代价、线上有效、预算守护',
        tone: 'effect',
    },
];

const GovernanceGuide = memo(() => {
    return (
        <TopicPage
            title="性能治理 · 原则与约定"
            description="先定义「快」的业务含义,再选指标和手段。诊断贯穿全程;架构决定成本上限,当前瓶颈决定先改哪里"
        >
            <SeriesNav current="governance-guide" />

            <TopicSection
                title="1. 不要从 memo 开始"
                note="讲解要点:useMemo / useCallback / React.memo 是确认热点之后的局部手段。先消除不必要工作,再优化必要工作。"
            >
                <Stack>
                    <P>
                        一张首屏大图、一次串行瀑布、一份广播到整页的状态,往往比少几次 render
                        更值钱。优化没有固定的层级顺序:架构决定成本上限,实际瓶颈决定当前先改哪里。
                    </P>
                    <Diagram caption="贯穿全程的不是技巧清单,是度量">
                        {`度量 → 诊断瓶颈 → 实施优化 → 再度量
        ↑                              │
        └──────── 预算 / RUM 防回归 ───┘

先问:哪些用户,在什么操作上觉得慢?
再问:这是加载慢、交互慢,还是业务结果迟迟不到?`}
                    </Diagram>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 三个目标:尽早可用 · 及时响应 · 成本可控"
                note="讲解要点:性能要同时约束这三件事。只盯 Lighthouse 分数,会漏掉「骨架一直转」和「用半小时后越来越卡」。"
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        {
                            title: '尽早可用',
                            fail: '展示了骨架,但主要内容一直没有出现',
                            meaning: '用户尽早看到并使用完成任务必需的内容',
                        },
                        {
                            title: '及时响应',
                            fail: '输入一个字符,整个页面停顿',
                            meaning: '输入、点击、滚动不被非必要工作阻塞',
                        },
                        {
                            title: '成本可控',
                            fail: '刚打开很快,用半小时后越来越卡',
                            meaning: '数据、DOM、计算、缓存和后台任务有边界',
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                {item.meaning}
                            </p>
                            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                                典型失败: {item.fail}
                            </p>
                        </article>
                    ))}
                </div>
            </TopicSection>

            <TopicSection
                title="3. 五条原则(贯穿后面所有专题)"
                note="讲解要点:这五条比任何 API 都先到。实现页把它们落成六条默认开发规则。"
            >
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>先消除不必要的工作,再优化必要工作的执行。重复请求、重复状态、无用渲染优先删。</li>
                    <li>关键路径只承载当前任务必需的工作。次要区域、屏外资源和后台计算不应拖住主要内容。</li>
                    <li>更新的影响范围应与业务变化的范围匹配。一个输入框变化,不应让整个工作台重算。</li>
                    <li>规模必须有边界。请求并发、列表长度、缓存容量、更新频率都要封顶。</li>
                    <li>优化以用户收益验收。render 次数减少只是解释收益的证据,不是验收本身。</li>
                </ol>
            </TopicSection>

            <TopicSection
                title="4. 阶段地图:约定写在实现之前"
                note="讲解要点:团队在设计时有约定,开发时有默认规则,排查时有路径,上线时有证据。每个优化 API 都要说清使用条件,以及为什么现在不用。"
            >
                <Stack>
                    <FlowList steps={STAGE_STEPS} />
                    <P>
                        诊断与度量贯穿全程,不是最后一章的「其他」。实验室数据(Lighthouse)管可复现预算;
                        现场数据(RUM,P75)管真实用户。AI-Native 还要另加「思考与生成」指标,见指标金字塔专题。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="5. 动手:先写一张性能约定"
                note="玩法:切换「商品搜索 / AI 对话 / 语音 Agent」,改任意约定项,看验收口径怎么变。实现前没有这张表,后面的架构表和指标都在空转。"
            >
                <PactCard />
            </TopicSection>

            <TopicSection
                title="6. 本分类怎么读"
                note="治理系列走完「为什么」和「何时」;AI-Native 补「思考的速度」;渲染调度是实现阶段里交互优先的一块,已经有对照演练。"
            >
                <AmberTopics
                    items={[
                        {
                            to: '/performance/metrics-lab',
                            label: '指标实验室',
                            why: 'LCP/INP/CLS 是北极星;业务完成时间另算;AI-Native 用 TTFUI 而不是页面绿了就算完',
                        },
                        {
                            to: '/performance/architecture-guide',
                            label: '架构关键路径',
                            why: '每个区域何时生成、会不会互相阻塞、缓存未命中是否仍可接受',
                        },
                        {
                            to: '/performance/implement-lab',
                            label: '实现六规则',
                            why: '所有权、请求、调度、规模、资源、记忆化 — 默认开发规则的对照',
                        },
                        {
                            to: '/performance/diagnose-lab',
                            label: '排查演练',
                            why: '把「慢」改写成可复现问题,按现象选证据链,只改有假设的瓶颈',
                        },
                        {
                            to: '/performance/ai-native-guide',
                            label: 'AI-Native 指标金字塔',
                            why: 'Core Web Vitals 是入场券;用户关心的是思考与生成,快但错不如慢但对',
                        },
                        {
                            to: '/performance/ai-native-agent',
                            label: 'Agent 工具链',
                            why: '检索和工具串行才是很多 Agent 觉得慢的原因;取消必须停计费',
                        },
                        {
                            to: '/performance/render-scheduling-guide',
                            label: '渲染调度深入梳理',
                            why: '实现阶段里「紧急 vs 非紧急」的 React 并发模型,已有帧条图演练',
                        },
                    ]}
                />
            </TopicSection>
        </TopicPage>
    );
});

GovernanceGuide.displayName = 'GovernanceGuide';

export default GovernanceGuide;
