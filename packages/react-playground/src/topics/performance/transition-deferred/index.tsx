/**
 * ============================================================================
 * useTransition × useDeferredValue 演练页(/performance/transition-deferred)
 * ============================================================================
 *
 * 渲染竞态场景演练(一):输入阻塞、Tab 切换(三件套协作)、stale 结果。
 * 统一教学装置:对照开关(同步 vs 优化手段)+ FrameMeter 帧条图
 * + 慢渲染强度滑杆,让读者在自己机器上感受临界点。
 *
 * @module topics/performance/transition-deferred
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { SeriesNav } from '../components/SeriesNav';
import { InputLagDemo } from './components/InputLagDemo';
import { TabSwitchDemo } from './components/TabSwitchDemo';
import { StaleSearchDemo } from './components/StaleSearchDemo';

const TransitionDeferredTopic = memo(() => {
    return (
        <TopicPage
            title="useTransition × useDeferredValue"
            description="把昂贵渲染标为非紧急:输入即时、旧 UI 保持、stale 反馈 —— 对照开关 + 帧条图感受差异"
        >
            <SeriesNav current="transition-deferred" />

            <TopicSection
                title="场景一:输入阻塞(deferred / transition 二件套)"
                note="同一语义两种写法:deferred 让值滞后(StaleBadge 反馈),transition 把更新标为非紧急(isPending 降透明度);与防抖的本质区别 —— 不延迟工作,只调度优先级"
            >
                <InputLagDemo />
            </TopicSection>

            <TopicSection
                title="场景二:Tab 切换(React.lazy + Suspense + startTransition 三件套)"
                note="协作样本:transition 管更新时机(点击后当前 Tab 保持可交互),Suspense 管资源等待(首次进入重型 Tab 出骨架),chunk 缓存后 transition 只负责调度"
            >
                <TabSwitchDemo />
            </TopicSection>

            <TopicSection
                title="场景三:stale 结果(deferred + 请求竞态处理)"
                note="渲染竞态(展示层滞后)与请求竞态(数据层乱序)是两层问题:deferred 管前者,序号 + AbortController 管后者(复用 custom-hooks 专题的 useRequest)"
            >
                <StaleSearchDemo />
            </TopicSection>
        </TopicPage>
    );
});

TransitionDeferredTopic.displayName = 'TransitionDeferredTopic';

export default TransitionDeferredTopic;
