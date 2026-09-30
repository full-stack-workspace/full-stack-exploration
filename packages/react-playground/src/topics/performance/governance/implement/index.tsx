/**
 * ============================================================================
 * 性能治理 · 实现六规则(/performance/implement-lab)
 * ============================================================================
 *
 * 把原则落成默认开发规则:所有权、请求、调度、规模、资源、记忆化最后。
 * 渲染调度细节链到已有三页,避免再讲一遍 Transition API。
 *
 * @module topics/performance/governance/implement
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { AmberTopics } from '../../components/AmberTopics';
import { P, Stack } from '../../components/Prose';
import { SeriesNav } from '../../components/SeriesNav';
import { OwnershipDemo } from './components/OwnershipDemo';
import { ScaleDemo } from './components/ScaleDemo';
import { WaterfallDemo } from './components/WaterfallDemo';

const ImplementLab = memo(() => {
    return (
        <TopicPage
            title="性能治理 · 实现六规则"
            description="默认开发规则,不是优化清单。确认热点之前不要先铺 memo"
        >
            <SeriesNav current="implement-lab" />

            <TopicSection
                title="规则 1. 每份状态都有所有权,更新尽量局部"
                note="玩法:对比「三份可写副本 + effect」和「单一所有权」。服务端列表、选中项、草稿、URL 筛选不要互相拷贝。"
            >
                <OwnershipDemo />
            </TopicSection>

            <TopicSection
                title="规则 2. 请求避免重复和无意义等待,数据量要有上限"
                note="玩法:模拟进入页面。瀑布来自子组件 mount 后才 fetch;并行也不等于无限打满服务端。"
            >
                <Stack>
                    <WaterfallDemo />
                    <P>
                        每类数据还要定义:缓存 Key(含账号/租户/筛选)、新鲜度、去重与取消、旧结果归属、分页与容量。
                        取消请求不等于撤销服务端写操作。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="规则 3. 交互反馈立即执行,昂贵派生按需要推迟"
                note="讲解要点:输入框立刻回显;列表/图表可以晚一拍。startTransition 不会把回调里的同步重计算自动搬到 Worker;useDeferredValue 也不是防抖。"
            >
                <Stack>
                    <CodeBlock
                        title="边界(不要记反)"
                        code={`setKeyword(value);                    // 紧急:受控输入
startTransition(() => setList(value)); // 非紧急:昂贵 UI 更新
// 回调立刻执行 —— 里面写 busyWork(500) 照样卡死
// 降请求频率用 debounce / 去重,不是 deferred`}
                    />
                    <AmberTopics
                        items={[
                            {
                                to: '/performance/transition-deferred',
                                label: 'transition × deferred 演练',
                                why: '输入阻塞、Tab 切换、stale 结果,对着帧条图看 INP',
                            },
                            {
                                to: '/performance/render-scheduling-guide',
                                label: '渲染调度深入梳理',
                                why: '紧急 vs 非紧急、三件套分工矩阵',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="规则 4. 限制单次工作量,也限制累计工作量"
                note="玩法:对比一次挂 400 条、窗口 12 条、分页 20 条。虚拟列表管 DOM;分页管传输;缓存淘汰管内存。"
            >
                <ScaleDemo />
            </TopicSection>

            <TopicSection
                title="规则 5–6. 资源按重要性加载;记忆化用于已识别热点"
                note="讲解要点:关键图 preload,屏外 lazy,并预留尺寸防 CLS。memo 要同时满足:真有成本、输入经常不变、比较开销小于收益。"
            >
                <Stack>
                    <P>
                        若卡顿来自数据规模、全局广播或 Effect 更新链,先处理这些来源。随后才用 Profiler
                        给剩余热点加 memo。过早记忆化增加比较与心智成本,还可能挡住 React Compiler 的自动推导。
                    </P>
                    <AmberTopics
                        items={[
                            {
                                to: '/hooks/use-memo',
                                label: 'useMemo 与 memo',
                                why: '浅比较配对才有收益,本规则最后才链到这里',
                            },
                            {
                                to: '/hooks/use-callback',
                                label: 'useCallback',
                                why: '稳定的是函数身份,要和 memo 子组件一起才值钱',
                            },
                            {
                                to: '/performance/ai-native-agent',
                                label: 'Agent 工具链',
                                why: '工具调用同样要去重、取消、设容量;取消≠撤销写操作',
                            },
                            {
                                to: '/performance/diagnose-lab',
                                label: '排查演练',
                                why: '先写假设再改。改完要能说明收益来自哪一段耗时链',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

ImplementLab.displayName = 'ImplementLab';

export default ImplementLab;
