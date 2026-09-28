/**
 * ============================================================================
 * 性能治理 · 排查演练(/performance/diagnose-lab)
 * ============================================================================
 *
 * 遇到慢,先改写成:在什么设备和数据规模下,执行什么操作,
 * 从哪个时刻到哪个时刻,耗时超过了什么目标。然后只修改有证据的瓶颈。
 *
 * @module topics/performance/governance/diagnose
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { ShipRecord } from './components/ShipRecord';
import { SymptomPath } from './components/SymptomPath';

const DiagnoseLab = memo(() => {
    return (
        <TopicPage
            title="性能治理 · 排查演练"
            description="沿着耗时链定位。改善响应和加快查询是两件事,汇报时不要互相冒充"
        >
            <SeriesNav current="diagnose-lab" />

            <TopicSection
                title="1. 先写成一条可复现的问题"
                note="讲解要点:没有设备、规模、操作、时间窗口和目标,就无法验收。上线还要留下六行记录。"
            >
                <Stack>
                    <Diagram caption="一次优化的六行档案">
                        {`场景:用户在什么条件下执行什么操作
目标:需要改善的体验与验收指标
证据:时间或资源主要消耗在哪里
改动:为什么这项措施能作用于瓶颈
结果:优化前后数据,以及新增代价
守护:上线监控、性能预算和回归检查`}
                    </Diagram>
                    <P>
                        比较时保持构建方式、设备、网络和数据规模一致。重要场景重复测量,避免把单次波动当收益。
                        正确性(缓存失效、快速切换、竞态、失败)和代价(内存、服务端、维护)必须一起过。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 动手:选一个用户现象,走出证据链"
                note="玩法:切换首屏慢 / 输入卡 / 结果晚到 / 滚动掉帧 / 越用越卡 / 乱渲染 / AI 觉得慢。看假设模板如何防止报错指标。"
            >
                <SymptomPath />
            </TopicSection>

            <TopicSection
                title="3. 上线前写下六行档案"
                note="讲解要点:没有前后数据和守护手段,优化只存在于本地。样例可改,但六行都不能空着上线。"
            >
                <ShipRecord />
            </TopicSection>

            <TopicSection title="4. 工具落点" note="实验室管预算,现场管分布,Profiler 管更新来源。">
                <AmberTopics
                    items={[
                        {
                            to: '/performance/metrics-lab',
                            label: '指标实验室',
                            why: '先确认这条路径该验收哪个数字',
                        },
                        {
                            to: '/performance/transition-deferred',
                            label: 'transition × deferred 演练',
                            why: '输入卡这条路径的对照实验和帧条图',
                        },
                        {
                            to: '/performance/ai-native-agent',
                            label: 'Agent 工具链',
                            why: 'AI 觉得慢时区分开口快、工具瀑布、取消仍计费',
                        },
                    ]}
                />
            </TopicSection>
        </TopicPage>
    );
});

DiagnoseLab.displayName = 'DiagnoseLab';

export default DiagnoseLab;
