/**
 * ============================================================================
 * Suspense 骨架与状态 UI 演练页(/performance/suspense-ui)
 * ============================================================================
 *
 * 渲染竞态场景演练(二):初始骨架(两类资源)、回退闪烁消除、
 * 边界粒度。统一叙事:Suspense 负责「资源未就绪时的声明式 UI」,
 * transition 负责「更新时机调度」—— 每个场景标注使用了哪几件套。
 *
 * @module topics/performance/suspense-ui
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { NavBanner } from '../transition-deferred/components/NavBanner';
import { InitialSkeletonDemo } from './components/InitialSkeletonDemo';
import { NoFallbackFlashDemo } from './components/NoFallbackFlashDemo';
import { BoundaryGranularityDemo } from './components/BoundaryGranularityDemo';

const SuspenseUiTopic = memo(() => {
    return (
        <TopicPage
            title="Suspense 骨架与状态 UI"
            description="初始骨架 vs 更新保持旧 UI:同一边界、两种时机,Suspense 与 transition 各管一段"
        >
            <NavBanner current="suspense-ui" />

            <TopicSection
                title="场景 0:初始加载的两种资源(Suspense 单件套)"
                note="chunk(React.lazy)与数据(wrapPromise)走同一 Suspense 协议;骨架形似最终布局,避免加载完成时的布局位移(场景 0 迁移自旧 Suspense 专题)"
            >
                <InitialSkeletonDemo />
            </TopicSection>

            <TopicSection
                title="场景 1:回退闪烁(Suspense + transition 二件套)"
                note="裸 Suspense 更新时内容瞬间消失;startTransition 包裹后保留旧内容 + 角落 isPending 指示,新数据就绪一次性切换 —— React 对 transition 中的挂起不展示 fallback"
            >
                <NoFallbackFlashDemo />
            </TopicSection>

            <TopicSection
                title="场景 2:边界粒度(Suspense + transition 二件套)"
                note="单一大边界互相拖累 vs 两个细边界各出各的骨架;边界按数据依赖与视觉区块划分,不是越细越好"
            >
                <BoundaryGranularityDemo />
            </TopicSection>
        </TopicPage>
    );
});

SuspenseUiTopic.displayName = 'SuspenseUiTopic';

export default SuspenseUiTopic;
