/**
 * ============================================================================
 * AmberTopics — 性能专题跳转到仓库已有页
 * ============================================================================
 *
 * 与组件通信 RelatedTopics 同形,hover 用 amber,避免跨分类改配色。
 *
 * @module topics/performance/components/AmberTopics
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

export interface AmberTopic {
    to: string;
    label: string;
    why: string;
}

export const AmberTopics = memo(({ items }: { items: AmberTopic[] }) => {
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <li key={item.to}>
                    <Link
                        to={item.to}
                        aria-label={item.label}
                        className="block rounded-card border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-amber-200 hover:bg-amber-50/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-amber-800"
                    >
                        <p className="text-sm font-medium text-primary-600">{item.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            {item.why}
                        </p>
                    </Link>
                </li>
            ))}
        </ul>
    );
});

AmberTopics.displayName = 'AmberTopics';
