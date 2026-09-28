/**
 * ============================================================================
 * TopicPage / TopicSection — 专题页统一布局
 * ============================================================================
 *
 * 所有专题演示页共用的页面骨架:页头(标题+描述) + 若干示例分区。
 * 专题作者只需关注演示内容本身,页面结构、间距、标题层级由此组件统一。
 *
 * 两个组件均为纯 Server Component(无 "use client"),
 * 专题页默认在服务端渲染,交互demo自行用 Client Component 下沉。
 *
 * @module components/topic/TopicPage
 */

import type { ReactNode } from "react";

interface TopicPageProps {
    /** 专题标题(与注册表 title 一致) */
    title: string;
    /** 一句话描述,显示在标题下方(与注册表 description 一致) */
    description: string;
    children: ReactNode;
}

/**
 * @example
 * <TopicPage title="ISR 与静态再生" description="...">
 *   <TopicSection title="ISR 对照" note="revalidate=60 的后台重建">
 *     <IsrDemo />
 *   </TopicSection>
 * </TopicPage>
 */
export function TopicPage({ title, description, children }: TopicPageProps) {
    return (
        <div className="mx-auto w-full max-w-6xl">
            {/* 页头:品牌色竖条 + 标题 + 描述 */}
            <header className="mb-8 border-l-4 border-primary-500 pl-4">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {description}
                </p>
            </header>
            <div className="space-y-6">{children}</div>
        </div>
    );
}

interface TopicSectionProps {
    /** 分区小标题 */
    title: string;
    /** 可选的分区说明(讲解要点) */
    note?: string;
    children: ReactNode;
}

export function TopicSection({ title, note, children }: TopicSectionProps) {
    return (
        <section className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800/60 dark:bg-neutral-900">
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                {title}
            </h2>
            {note && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                    {note}
                </p>
            )}
            <div className="mt-4">{children}</div>
        </section>
    );
}
