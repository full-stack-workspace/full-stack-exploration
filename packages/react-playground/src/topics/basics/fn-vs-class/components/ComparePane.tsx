/**
 * ============================================================================
 * ComparePane — 类组件 / 函数组件双栏对照壳
 * ============================================================================
 *
 * 演练页把同一行为拆成两栏。中间层不认识 count / room,只负责排版。
 *
 * @module topics/basics/fn-vs-class/components/ComparePane
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

interface ComparePaneProps {
    classTitle: string;
    fnTitle: string;
    classSlot: ReactNode;
    fnSlot: ReactNode;
}

export const ComparePane = memo(({ classTitle, fnTitle, classSlot, fnSlot }: ComparePaneProps) => {
    return (
        <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-card border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                    {classTitle}
                </p>
                {classSlot}
            </div>
            <div className="rounded-card border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                    {fnTitle}
                </p>
                {fnSlot}
            </div>
        </div>
    );
});

ComparePane.displayName = 'ComparePane';
