/**
 * ============================================================================
 * CheckAnswer — 理解检验的要点、展开与回链
 * ============================================================================
 *
 * 要点默认露在外面,用来自答。因果按 1、2、3 写在收起的展开里。
 * 回到专题留在展开外面,卡住时可以不看答案直接回去核对。
 *
 * @module components/check/CheckAnswer
 */

import { Children, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { LEVEL } from './level';
import type { Difficulty, RelatedLink } from './types';

interface CheckAnswerProps {
    points: readonly string[];
    related?: readonly RelatedLink[];
    difficulty?: Difficulty;
    focus?: string;
    /** 题干下的读法,告诉读者先抓哪一句 */
    approach?: string;
    children: ReactNode;
}

export const CheckAnswer = ({ points, related, difficulty, focus, approach, children }: CheckAnswerProps) => {
    const beats = Children.count(children);
    return (
        <div className="space-y-4">
            {difficulty || focus ? (
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-gray-600 dark:text-slate-300">
                    {difficulty ? (
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${LEVEL[difficulty].className}`}>
                            {LEVEL[difficulty].label}
                        </span>
                    ) : null}
                    {focus ? <span>考察点:{focus}</span> : null}
                </p>
            ) : null}
            {approach ? (
                <p className="text-xs leading-relaxed text-gray-600 dark:text-slate-300">
                    <span className="mr-2 font-semibold text-primary-700 dark:text-primary-200">读法</span>
                    {approach}
                </p>
            ) : null}
            <div className="rounded-lg border border-primary-100 bg-primary-50/80 px-4 py-3 dark:border-primary-400/30 dark:bg-primary-700/15">
                <p className="text-xs font-semibold text-primary-700 dark:text-primary-200">要点</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-gray-900 dark:text-slate-100">
                    {points.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </div>
            <details className="group rounded-lg border border-gray-200 dark:border-slate-700">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 touch-manipulation hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 12 12"
                        className="h-3 w-3 shrink-0 transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
                    >
                        <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="group-open:hidden">展开解答</span>
                    <span className="hidden group-open:inline">收起解答</span>
                    <span className="ml-auto text-xs font-normal tabular-nums text-gray-500 group-open:hidden dark:text-slate-400">
                        {beats} 段
                    </span>
                </summary>
                <div className="divide-y divide-gray-100 border-t border-gray-100 px-4 text-sm leading-relaxed text-gray-700 dark:divide-slate-800 dark:border-slate-800 dark:text-slate-300">
                    {children}
                </div>
            </details>
            {related && related.length > 0 ? (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-100 pt-3 text-xs dark:border-slate-800">
                    <span className="font-medium text-gray-600 dark:text-slate-300">回到专题</span>
                    {related.map((link) => (
                        <Link
                            key={link.to + link.label}
                            to={link.to}
                            className="rounded-sm text-primary-700 underline decoration-primary-200 underline-offset-2 hover:decoration-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-200 dark:decoration-primary-700"
                        >
                            {link.label}
                        </Link>
                    ))}
                </p>
            ) : null}
        </div>
    );
};

/** 展开里的一段因果,左边用序号标出阅读顺序 */
export const AnswerBeat = ({ index, children }: { index: number; children: ReactNode }) => {
    return (
        <div className="flex gap-4 py-3">
            <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-primary-600 dark:text-primary-300">
                {index}
            </span>
            <p className="min-w-0 flex-1">{children}</p>
        </div>
    );
};
