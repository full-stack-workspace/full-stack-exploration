/**
 * ============================================================================
 * CheckList — 理解检验页的目录和问答
 * ============================================================================
 *
 * 目录按组排成可扫的列表。题卡先给读法和要点,展开默认收着。
 * 滚到题目区后,顶上留一条当前组,方便回到目录。
 *
 * @module components/check/CheckList
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../TopicPage';
import { AnswerBeat, CheckAnswer } from './CheckAnswer';
import { followAnchor } from './followAnchor';
import { LEVEL } from './level';
import type { NumberedGroup } from './types';

interface CheckListProps {
    title: string;
    description: string;
    intro: string;
    groups: readonly NumberedGroup[];
    nav?: ReactNode;
    closingTitle: string;
    closingNote: string;
    closing: ReactNode;
}

const linkClass =
    'rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

function scrollParent(node: HTMLElement | null): HTMLElement | null {
    let current = node?.parentElement ?? null;
    while (current) {
        const overflow = getComputedStyle(current).overflowY;
        if (overflow === 'auto' || overflow === 'scroll') {return current;}
        current = current.parentElement;
    }
    return null;
}

export const CheckList = ({
    title,
    description,
    intro,
    groups,
    nav,
    closingTitle,
    closingNote,
    closing,
}: CheckListProps) => {
    const total = groups.reduce((sum, group) => sum + group.questions.length, 0);
    const [currentId, setCurrentId] = useState(groups[0]?.id ?? '');
    const current = groups.find((group) => group.id === currentId) ?? groups[0];

    useEffect(() => {
        const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (!id) {return;}
        const node = document.getElementById(id);
        if (!node) {return;}
        node.scrollIntoView({ block: 'start' });
    }, [groups]);

    useEffect(() => {
        const first = document.getElementById(groups[0]?.id ?? '');
        const root = scrollParent(first);
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
                if (visible) {setCurrentId(visible.target.id);}
            },
            { root, rootMargin: '-56px 0px -65% 0px', threshold: 0 },
        );
        for (const group of groups) {
            const node = document.getElementById(group.id);
            if (node) {observer.observe(node);}
        }
        return () => observer.disconnect();
    }, [groups]);

    return (
        <TopicPage title={title} description={description}>
            {nav}
            <TopicSection
                title="怎么用这一页"
                note="要点直接可见,用来自答。展开默认收着。对不上再打开,然后回到对应专题核对。"
            >
                <p className="text-sm leading-relaxed text-gray-700 dark:text-slate-300">
                    这 {total} 题用来检验前面专题是否掌握,不是另起一套知识。{intro}
                </p>
            </TopicSection>
            <div id="check-toc" className="scroll-mt-4">
                <h2 className="px-1 text-pretty text-base font-semibold text-gray-800 dark:text-slate-100">目录</h2>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        {groups.map((group) => {
                            const starred = group.questions.filter((question) => question.difficulty).length;
                            return (
                                <section
                                    key={group.id}
                                    className="rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900"
                                    aria-labelledby={`${group.id}-toc`}
                                >
                                    <div className="flex items-baseline justify-between gap-3">
                                        <a
                                            id={`${group.id}-toc`}
                                            href={`#${group.id}`}
                                            onClick={followAnchor}
                                            className={`${linkClass} text-sm font-semibold text-gray-800 hover:text-primary-700 dark:text-slate-100 dark:hover:text-primary-200`}
                                        >
                                            {group.title}
                                        </a>
                                        <span className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-slate-400">
                                            {group.questions.length} 题
                                            {starred > 0 ? ` · ${starred} 道标了难度` : ''}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
                                        {group.blurb}
                                    </p>
                                    <ol className="mt-2">
                                        {group.questions.map((question) => (
                                            <li key={question.id}>
                                                <a
                                                    href={`#${question.id}`}
                                                    onClick={followAnchor}
                                                    className={`${linkClass} flex items-baseline gap-2 rounded-md px-1 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800`}
                                                >
                                                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-gray-500 dark:text-slate-400">
                                                        {question.number}
                                                    </span>
                                                    <span className="min-w-0 flex-1 text-sm text-gray-800 dark:text-slate-100">
                                                        {question.toc}
                                                    </span>
                                                    {question.difficulty ? (
                                                        <span
                                                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${LEVEL[question.difficulty].className}`}
                                                        >
                                                            {LEVEL[question.difficulty].label}
                                                        </span>
                                                    ) : null}
                                                </a>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            );
                        })}
                </div>
            </div>

            <div className="sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50/95 px-3 py-2 text-xs backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                <a
                    href="#check-toc"
                    onClick={followAnchor}
                    className={`${linkClass} font-medium text-primary-700 dark:text-primary-200`}
                >
                    回目录
                </a>
                <span className="min-w-0 truncate text-gray-700 dark:text-slate-200">
                    {current ? (
                        <>
                            <span className="text-gray-500 dark:text-slate-400">当前</span>
                            <span className="ml-2 font-medium">{current.title}</span>
                            <span className="ml-2 tabular-nums text-gray-500 dark:text-slate-400">
                                {current.questions[0]?.number}–{current.questions[current.questions.length - 1]?.number}
                            </span>
                        </>
                    ) : null}
                </span>
            </div>

            {groups.map((group) => {
                const first = group.questions[0]?.number;
                const last = group.questions[group.questions.length - 1]?.number;
                return (
                    <div key={group.id} id={group.id} className="scroll-mt-14 space-y-4">
                        <div className="flex items-end justify-between gap-3 px-1">
                            <div className="min-w-0">
                                <h2 className="text-pretty text-base font-semibold text-gray-800 dark:text-slate-100">
                                    {group.title}
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
                                    {group.blurb}
                                </p>
                            </div>
                            <p className="shrink-0 text-xs tabular-nums text-gray-500 dark:text-slate-400">
                                {first}–{last}
                            </p>
                        </div>
                        {group.questions.map((question) => (
                            <section
                                key={question.id}
                                id={question.id}
                                className="scroll-mt-14 rounded-card border border-gray-100 bg-white p-4 shadow-card sm:p-6 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <h3 className="text-pretty text-base font-semibold text-gray-800 dark:text-slate-100">
                                    {question.number}. {question.title}
                                </h3>
                                <div className="mt-3">
                                    <CheckAnswer
                                        points={question.points}
                                        related={question.related}
                                        difficulty={question.difficulty}
                                        focus={question.focus}
                                        approach={question.note}
                                    >
                                        {question.body.map((paragraph, index) => (
                                            <AnswerBeat key={`${question.id}-${index}`} index={index + 1}>
                                                {paragraph}
                                            </AnswerBeat>
                                        ))}
                                    </CheckAnswer>
                                </div>
                            </section>
                        ))}
                    </div>
                );
            })}

            <TopicSection title={closingTitle} note={closingNote}>
                {closing}
            </TopicSection>
        </TopicPage>
    );
};
