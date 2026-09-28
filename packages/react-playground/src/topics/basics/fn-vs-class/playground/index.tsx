/**
 * ============================================================================
 * 函数组件与类组件 · 对照演练(/topics/basics/fn-vs-class-playground)
 * ============================================================================
 *
 * 三组同一操作、两种模型:延时读数、换用户草稿、换房间订阅。
 * 机制细节链到 Hooks / 列表 / 错误边界专题。
 *
 * @module topics/basics/fn-vs-class/playground
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { NavBanner } from '../components/NavBanner';
import { RelatedTopics } from '../components/RelatedTopics';
import { DerivedStateDemo } from './components/DerivedStateDemo';
import { EffectVsLifecycleDemo } from './components/EffectVsLifecycleDemo';
import { SnapshotThisDemo } from './components/SnapshotThisDemo';

const FnVsClassPlayground = memo(() => {
    return (
        <TopicPage
            title="函数组件与类组件 · 对照演练"
            description="先点同一组按钮,再看左右栏读到的值为什么不同 —— 那就是新旧心智模型的差别"
        >
            <NavBanner current="playground" />

            <TopicSection
                title="1. 延时读数:盒子 vs 快照"
                note="玩法:两边都先点「稍后读」,再连点 +1,等读数出来。class 跟住最新 count;函数停在按下「稍后读」那一拍。若业务要「总是最新」,函数里显式用 ref 或函数式更新,不要假装有一个 this。"
            >
                <div className="space-y-4">
                    <SnapshotThisDemo />
                    <CodeBlock
                        title="读的不是同一种东西"
                        code={`setTimeout(() => this.setState({ later: this.state.count }), 800); // 盒子
setTimeout(() => setLater(count), 800);                          // 快照`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="2. 换用户:抄进 state 就会卡住"
                note="玩法:在 class 输入框改几个字,再点「换成下一位用户」。左边仍是你刚改的字,因为没有 gDSFP。右边带 key={user.id},换人等于新草稿。能从 props 算出来的显示值,根本不该进 state。"
            >
                <div className="space-y-4">
                    <DerivedStateDemo />
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/basics/list-key',
                                label: '列表与 key',
                                why: 'key 变了是另一个实例,这是重置内部 state 的正路,不是 gDSFP',
                            },
                        ]}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="3. 换房间:三件套 vs 一个 effect"
                note="玩法:在「大厅 / 工单」之间切换,看日志。正确时一定是先退订旧房间再订阅新房间。class 把对比写在 didUpdate;漏写那一段,生产里会订着上一个房间。函数把成对逻辑放在同一个 effect。"
            >
                <div className="space-y-4">
                    <EffectVsLifecycleDemo />
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/use-effect',
                                label: 'useEffect',
                                why: 'cleanup 永远先于同一次的新 setup;对应 willUnmount + didUpdate 退订',
                            },
                            {
                                to: '/topics/advanced/error-boundary',
                                label: 'Error Boundary',
                                why: '渲染期 catch 仍只能 class;叶子继续用函数组件',
                            },
                            {
                                to: '/topics/basics/fn-vs-class-practice',
                                label: '看板实战',
                                why: '下一页把时钟、可取消请求、过滤派生拆进 Hook,对照 class 实例字段',
                            },
                        ]}
                    />
                </div>
            </TopicSection>
        </TopicPage>
    );
});

FnVsClassPlayground.displayName = 'FnVsClassPlayground';

export default FnVsClassPlayground;
