/**
 * ============================================================================
 * RelatedTopics.tsx — 跳转到本仓库已有专题的卡片列表(共享组件)
 * ============================================================================
 *
 * 各专题页末尾「相关专题」卡片的统一实现(原为 component-comm / fn-vs-class
 * 两份逐行拷贝 + performance 的 AmberTopics 第三份变体,现收敛为一处)。
 * 配色差异通过 tone 表达:sky(组件通信)/ indigo(fn-vs-class、RSC)/ amber(性能分类)。
 *
 * @module components/RelatedTopics
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

export interface RelatedTopic {
    to: string;
    label: string;
    why: string;
}

/** hover 配色档位:与各专题页头的系列色对齐 */
export type RelatedTopicsTone = 'sky' | 'indigo' | 'amber';

const TONE_CLASS: Record<RelatedTopicsTone, string> = {
    sky: 'hover:border-sky-200 hover:bg-sky-50/60 dark:hover:border-sky-800',
    indigo: 'hover:border-indigo-200 hover:bg-indigo-50/60 dark:hover:border-indigo-800',
    amber: 'hover:border-amber-200 hover:bg-amber-50/70 dark:hover:border-amber-800',
};

interface RelatedTopicsProps {
    items: RelatedTopic[];
    /** hover 配色,默认 sky */
    tone?: RelatedTopicsTone;
}

/**
 * @example
 * <RelatedTopics tone="indigo" items={[{ to: '/hooks', label: 'Hooks', why: '...' }]} />
 */
export const RelatedTopics = memo(({ items, tone = 'sky' }: RelatedTopicsProps) => {
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
                <li key={item.to}>
                    <Link
                        to={item.to}
                        aria-label={item.label}
                        className={`block rounded-card border border-gray-100 bg-gray-50 p-3 transition-colors dark:border-slate-800 dark:bg-slate-950 ${TONE_CLASS[tone]}`}
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
