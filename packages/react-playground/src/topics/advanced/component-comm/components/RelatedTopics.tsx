/**
 * ============================================================================
 * RelatedTopics.tsx — 跳转到本仓库已有专题
 * ============================================================================
 *
 * 组件通信会用到 Context / reducer / ref / 外部 Store 等已讲过的机制,
 * 本专题不重复展开,用卡片链过去。
 *
 * @module topics/advanced/component-comm/components/RelatedTopics
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

export interface RelatedTopic {
    to: string;
    label: string;
    why: string;
}

interface RelatedTopicsProps {
    items: RelatedTopic[];
}

export const RelatedTopics = memo(({ items }: RelatedTopicsProps) => {
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <li key={item.to}>
                    <Link
                        to={item.to}
                        aria-label={item.label}
                        className="block rounded-card border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-sky-200 hover:bg-sky-50/60 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-sky-800"
                    >
                        <p className="text-sm font-medium text-primary-600">{item.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">{item.why}</p>
                    </Link>
                </li>
            ))}
        </ul>
    );
});

RelatedTopics.displayName = 'RelatedTopics';
