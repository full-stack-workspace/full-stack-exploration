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
 * - TopicSection:渲染单个示例分区(小标题 + 结构化讲解要点 + 内容卡片)
 *
 * @module components/TopicPage
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { parseSectionNote } from './section-note';
import type { NotePoint } from './section-note';

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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{title}</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{description}</p>
            </header>
            <div className="space-y-6">{children}</div>
        </div>
    );
});

TopicPage.displayName = 'TopicPage';

interface TopicSectionProps {
    /** 分区小标题 */
    title: string;
    /** 可选的分区说明(讲解要点)。原文可以是一整段,渲染时按标签、句子和破折号拆开 */
    note?: string;
    children: ReactNode;
}

export const TopicSection = memo(({ title, note, children }: TopicSectionProps) => {
    return (
        <section className="rounded-card border border-gray-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-gray-700 dark:text-slate-200">{title}</h2>
            {note ? <SectionNote note={note} /> : null}
            <div className="mt-4">{children}</div>
        </section>
    );
});

TopicSection.displayName = 'TopicSection';

/* =================================================================
 * 讲解要点 — 与理解检验的「要点」同一套强调色,但按原文结构展开
 * ================================================================ */

/**
 * 把 note 渲染成可扫读的强调块。
 * 多句编号、字母分项保留原序号,破折号后的展开另起一行。
 */
const SectionNote = ({ note }: { note: string }) => {
    const { label, points } = parseSectionNote(note);
    if (points.length === 0) {
        return null;
    }

    const listed = points.length > 1;

    return (
        <div
            role="note"
            className="mt-3 rounded-lg border border-primary-100 bg-primary-50/80 px-4 py-3 dark:border-primary-400/30 dark:bg-primary-700/15"
        >
            {label ? (
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-200">{label}</p>
            ) : null}
            {listed ? (
                <ul className={`space-y-2.5 ${label ? 'mt-2' : ''}`}>
                    {points.map((point, index) => (
                        <li key={`${point.marker ?? index}-${point.lead}`} className="flex gap-2.5">
                            <span className="w-4 shrink-0 text-sm font-semibold tabular-nums text-primary-700 dark:text-primary-200">
                                {point.marker ?? index + 1}
                            </span>
                            <PointBody point={point} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={label ? 'mt-1.5' : ''}>
                    <PointBody point={points[0]} />
                </div>
            )}
        </div>
    );
};

/** 主张用中等字重,破折号后的展开缩进,两者都保持正文对比度 */
const PointBody = ({ point }: { point: NotePoint }) => {
    return (
        <div className="min-w-0">
            <p className="text-sm font-medium leading-6 text-gray-900 dark:text-slate-100">
                <RichText text={point.lead} />
            </p>
            {point.details.map((detail) => (
                <p
                    key={detail}
                    className="mt-1 border-l-2 border-primary-300 pl-2.5 text-sm leading-6 text-gray-800 dark:border-primary-400/50 dark:text-slate-200"
                >
                    <RichText text={detail} />
                </p>
            ))}
        </div>
    );
};

/** 「」里的术语是作者点名的概念,单独加一层底色 */
const RichText = ({ text }: { text: string }) => {
    const parts = text.split(/(「[^」]*」)/);
    return parts.map((part, index) =>
        part.startsWith('「') ? (
            <mark
                key={`${part}-${index}`}
                className="rounded-sm bg-white/80 px-1 font-semibold text-primary-800 ring-1 ring-primary-200 dark:bg-slate-900/50 dark:text-primary-100 dark:ring-primary-400/40"
            >
                {part}
            </mark>
        ) : (
            <span key={`${part}-${index}`}>{part}</span>
        ),
    );
};
