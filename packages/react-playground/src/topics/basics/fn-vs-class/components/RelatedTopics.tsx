/**
 * ============================================================================
 * RelatedTopics.tsx — 跳转到本仓库已有专题
 * ============================================================================
 *
 * 函数组件对照会用到 state / effect / ref / 自定义 Hook / 错误边界,
 * 本专题不重复展开机制,用卡片链过去。
 *
 * @module topics/basics/fn-vs-class/components/RelatedTopics
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
                        className="block rounded-card border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
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
