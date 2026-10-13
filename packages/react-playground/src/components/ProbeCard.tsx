/**
 * ============================================================================
 * ProbeCard.tsx — 探针卡片(共享组件)
 * ============================================================================
 *
 * hooks 专题各页演示用的小卡片容器(标题 + 内容区),
 * 原为 use-memo / use-callback / use-ref / use-imperative-handle
 * 四份逐字拷贝,现收敛为一处。
 *
 * @module components/ProbeCard
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

interface ProbeCardProps {
    title: string;
    children: ReactNode;
}

/**
 * @example
 * <ProbeCard title="memo + 稳定对象"><MemoChip /></ProbeCard>
 */
export const ProbeCard = memo(({ title, children }: ProbeCardProps) => {
    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium text-gray-700 dark:text-slate-200">{title}</p>
            <div className="mt-2">{children}</div>
        </div>
    );
});

ProbeCard.displayName = 'ProbeCard';
