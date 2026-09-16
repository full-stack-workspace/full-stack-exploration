/**
 * ============================================================================
 * Diagram.tsx — 结构示意图展示块
 * ============================================================================
 *
 * 梳理页专用的 ASCII 示意图容器:浅色底 + 等宽字体,
 * 用于渲染数据流 / 时序交错等纯文本结构图。
 *
 * @module components/Diagram
 */

import { memo } from 'react';

interface DiagramProps {
    /** 示意图说明文字 */
    caption?: string;
    /** ASCII 示意图文本(保留原始对齐) */
    children: string;
}

/**
 * @example
 * <Diagram caption="数据流">{`A → B`}</Diagram>
 */
export const Diagram = memo(({ caption, children }: DiagramProps) => {
    return (
        <figure className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/50">
            {caption && (
                <figcaption className="border-b border-gray-100 px-3 py-1.5 text-[11px] text-gray-400 dark:border-slate-800 dark:text-slate-500">
                    {caption}
                </figcaption>
            )}
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-gray-600 dark:text-slate-300">
                {children}
            </pre>
        </figure>
    );
});

Diagram.displayName = 'Diagram';
