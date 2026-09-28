/**
 * ============================================================================
 * 性能治理 · 架构关键路径(/performance/architecture-guide)
 * ============================================================================
 *
 * 架构评审三问:慢区域是否阻塞快区域、首屏是否承担不必要客户端工作、
 * 缓存未命中时是否仍可接受。SSG/SSR/CSR/Streaming 是落实方式不是目标。
 *
 * @module topics/performance/governance/architecture
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { RegionBoard } from './components/RegionBoard';

const ArchitectureGuide = memo(() => {
    return (
        <TopicPage
            title="性能治理 · 架构关键路径"
            description="每个路由或区域都要回答:何时生成、在哪里运行、可以缓存多久、哪些代码和数据会到达浏览器"
        >
            <SeriesNav current="architecture-guide" />

            <TopicSection
                title="1. 架构产出是区域表,不是框架口号"
                note="讲解要点:公共少变的内容预生成;请求时才知道的个性化独立等待;真正需要浏览器能力的才进客户端;非关键慢区域流式;屏外功能延迟。"
            >
                <Stack>
                    <Diagram caption="同一路由内部也可以组合策略">
                        {`搜索框 + 商品主体   → 请求时优先,尽快进 HTML(LCP)
个性化推荐         → 独立 Suspense,不准挡住主体
编辑器 / 图表      → 客户端边界紧贴交互,延迟加载
屏外评论           → lazy,用户接近再拉

评审三问:
1. 慢区域是否阻塞了快区域?
2. 首屏是否承担了不必要的客户端工作?(hydration 成本)
3. 缓存未命中 / 后端变慢时,页面是否仍可接受?`}
                    </Diagram>
                    <P>
                        Server / Client 组件控制执行边界;Streaming 控制交付顺序;缓存边界控制复用。
                        它们分别回答上面三问,而不是互相替代。CSR 壳 + 重 hydration 仍然可能 INP 很差。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 动手:给商品页分区,看谁挡住谁"
                note="玩法:改每个区域的生成策略,再打开两个开关。推荐挡住主体、编辑器进首屏,是最常见的架构事故。"
            >
                <RegionBoard />
            </TopicSection>

            <TopicSection
                title="3. AI-Native 同样先画区域表"
                note="讲解要点:壳、思考反馈、工具、正文是四块关键路径。把 RAG 和商品主体绑在一次 SSR 里,等于用推荐挡住 LCP 的 Agent 版。"
            >
                <Stack>
                    <Diagram caption="对话页也可以分区">
                        {`输入框 / 停止 / 历史   → 立刻可操作(INP 预算,不算思考)
思考指示               → 发送后立刻有,禁止等第一个工具
RAG / 工具面板         → 独立区域,能并行就并行,取消打到请求
流式正文               → 逐 token 上屏;引用和推荐追问可后做

评审仍是那三问:
慢的工具链有没有挡住输入和停止?
首屏是否 hydrate 了整个 Markdown 高亮器?
模型或工具变慢时,壳子是否仍可取消、仍可输入?`}
                    </Diagram>
                    <P>
                        传统页的 Suspense 边界对应 Agent 的工具边界。Streaming HTML
                        解决壳;Streaming token 解决正文。两者都需要「谁可以慢」写在架构里。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 和实现、调度怎么接"
                note="架构把「可以慢」的区域拆开之后,实现阶段才谈请求并行、Transition、虚拟列表。边界没拆开,后面全是补丁。"
            >
                <AmberTopics
                    items={[
                        {
                            to: '/performance/implement-lab',
                            label: '实现六规则',
                            why: '数据所有权、请求上限、紧急更新、规模、资源、记忆化',
                        },
                        {
                            to: '/performance/suspense-ui',
                            label: 'Suspense 骨架演练',
                            why: '边界跟随用户能独立理解的区域;太大整块等,太碎会闪',
                        },
                        {
                            to: '/performance/ai-native-agent',
                            label: 'Agent 工具链',
                            why: '把区域表里的 RAG / 工具串行变成可测的墙钟',
                        },
                    ]}
                />
            </TopicSection>
        </TopicPage>
    );
});

ArchitectureGuide.displayName = 'ArchitectureGuide';

export default ArchitectureGuide;
