/**
 * ============================================================================
 * TopicPage / TopicSection — 专题页统一布局
 * ============================================================================
 *
 * 所有专题演示页共用的页面骨架:页头(标题+描述) + 若干示例分区。
 * 专题作者只需关注演示内容本身,页面结构、间距、标题层级由此组件统一。
 *
 * 功能特点:
 * - TopicPage:渲染专题页头与整体容器
 * - TopicSection:渲染单个示例分区(小标题 + 说明 + 内容卡片)
 *
 * @module components/TopicPage
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

interface TopicPageProps {
    /** 专题标题 */
    title: string;
    /** 一句话描述,显示在标题下方 */
    description: string;
    children: ReactNode;
}

/**
 * @example
 * <TopicPage title="useState" description="函数组件的状态声明">
 *   <TopicSection title="基础用法" note="setState 支持函数式更新">
 *     <CounterDemo />
 *   </TopicSection>
 * </TopicPage>
 */
export const TopicPage = memo(({ title, description, children }: TopicPageProps) => {
    return (
        <div className="max-w-7xl mx-auto">
            {/* 页头:品牌色竖条 + 标题 + 描述 */}
            <header className="mb-8 border-l-4 border-primary-500 pl-4">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </header>
            <div className="space-y-6">{children}</div>
        </div>
    );
});

TopicPage.displayName = 'TopicPage';

interface TopicSectionProps {
    /** 分区小标题 */
    title: string;
    /** 可选的分区说明(讲解要点) */
    note?: string;
    children: ReactNode;
}

export const TopicSection = memo(({ title, note, children }: TopicSectionProps) => {
    return (
        <section className="rounded-card border border-gray-100 bg-white p-6 shadow-card">
            <h2 className="text-base font-semibold text-gray-700">{title}</h2>
            {note && <p className="mt-1 text-xs leading-relaxed text-gray-400">{note}</p>}
            <div className="mt-4">{children}</div>
        </section>
    );
});

TopicSection.displayName = 'TopicSection';
