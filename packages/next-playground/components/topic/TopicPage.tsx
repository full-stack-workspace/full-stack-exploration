/**
 * ============================================================================
 * TopicPage / TopicSection — 专题页统一布局
 * ============================================================================
 *
 * 所有专题演示页共用的页面骨架:面包屑 + 页头(标题+描述) + 若干示例分区
 * + 可选的「延伸阅读」页尾。
 * 专题作者只需关注演示内容本身,页面结构、间距、标题层级由此组件统一。
 * 外层 DirectionalTransition 让首页 ↔ 专题走方向滑动,不包 layout。
 *
 * 两个组件均为纯 Server Component(无 "use client"),
 * 专题页默认在服务端渲染,交互demo自行用 Client Component 下沉。
 *
 * @module components/topic/TopicPage
 */

import Link from "next/link";
import type { ReactNode } from "react";

import { Panel } from "@/components/ui/Panel";
import {
    getCategoryByPath,
    getCategoryFirstPath,
    getRelatedTopics,
    getTopicByPath,
} from "@/config/topics";

import { DirectionalTransition } from "./DirectionalTransition";

interface TopicPageProps {
    /** 专题注册路径(与注册表 path 一致,如 "/rendering/isr"),面包屑据此反查分类 */
    path: string;
    /** 专题标题(与注册表 title 一致) */
    title: string;
    /** 一句话描述,显示在标题下方(与注册表 description 一致) */
    description: string;
    /** 可选的页尾「延伸阅读」外链列表 */
    references?: Array<{ label: string; href: string }>;
    children: ReactNode;
}

/**
 * @example
 * <TopicPage path="/rendering/isr" title="ISR 与静态再生" description="...">
 *   <TopicSection title="ISR 对照" note="revalidate=60 的后台重建">
 *     <IsrDemo />
 *   </TopicSection>
 * </TopicPage>
 */
export function TopicPage({ path, title, description, references, children }: TopicPageProps) {
    // 面包屑由注册表反查,保证分类名/跳转目标与导航同源;未注册路径不渲染面包屑
    const category = getCategoryByPath(path);
    const topic = getTopicByPath(path);
    // 页尾「相关专题」互链:注册表 related 字段驱动,无 related 时不渲染
    const related = getRelatedTopics(path);

    return (
        <DirectionalTransition>
            <div className="mx-auto w-full max-w-6xl">
                {category && topic && (
                    <nav
                        aria-label="面包屑"
                        className="mb-6 font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500"
                    >
                        <Link
                            href={getCategoryFirstPath(category.key)}
                            className="transition-colors hover:text-ink dark:hover:text-neutral-200"
                        >
                            {category.title}
                        </Link>
                        <span aria-hidden="true" className="mx-2">/</span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                            {topic.title}
                        </span>
                    </nav>
                )}
                <header className="mb-10 max-w-3xl">
                    <div className="h-1 w-10 rounded-full bg-signal" />
                    <h1 className="mt-5 font-display text-[1.85rem] leading-tight font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                        {title}
                    </h1>
                    <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {description}
                    </p>
                </header>
                <div className="space-y-5">{children}</div>
                {related.length > 0 && (
                    <nav
                        aria-label="相关专题"
                        className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-mist pt-5 dark:border-neutral-800"
                    >
                        <span className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                            相关专题
                        </span>
                        {related.map((rel) => (
                            <Link
                                key={rel.path}
                                href={rel.path}
                                className="rounded-full border border-mist px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-signal-500 hover:text-signal-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-signal-400"
                            >
                                {rel.title}
                            </Link>
                        ))}
                    </nav>
                )}
                {references && references.length > 0 && (
                    <footer className="mt-10 border-t border-mist pt-5 dark:border-neutral-800">
                        <h2 className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                            延伸阅读
                        </h2>
                        <ul className="mt-3 space-y-1.5">
                            {references.map((ref) => (
                                <li key={ref.href}>
                                    <a
                                        href={ref.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-signal-600 underline decoration-signal-500/40 underline-offset-4 transition-colors hover:decoration-signal-500 dark:text-signal-400"
                                    >
                                        {ref.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </footer>
                )}
            </div>
        </DirectionalTransition>
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
        <Panel className="p-6">
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                {title}
            </h2>
            {note && (
                <p className="mt-1 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                    {note}
                </p>
            )}
            <div className="mt-4">{children}</div>
        </Panel>
    );
}
