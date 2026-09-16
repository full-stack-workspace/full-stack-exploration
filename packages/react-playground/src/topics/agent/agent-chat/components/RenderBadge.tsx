/**
 * ============================================================================
 * RenderBadge.tsx — 渲染次数计数角标
 * ============================================================================
 *
 * 渲染可视化工具:宿主组件每次 render 调用 useRenderCount 自增计数,
 * 由 RenderBadge 以小角标形式展示。流式输出期间可直观看到:
 * 只有订阅了变化切片的组件计数增长,其余组件纹丝不动 ——
 * 实证「结构共享 + Selector 精准订阅」的效果。
 *
 * @module topics/agent/agent-chat/components/RenderBadge
 */

import { memo, useRef } from 'react';

/**
 * 统计宿主组件的渲染次数(含 StrictMode 下的开发环境双渲染,
 * 相对对比不受影响)。
 *
 * @returns 当前已渲染次数
 */
export const useRenderCount = (): number => {
    const countRef = useRef(0);
    countRef.current += 1;
    return countRef.current;
};

interface RenderBadgeProps {
    /** 组件名,hover 时提示 */
    label: string;
    /** 渲染次数,由宿主通过 useRenderCount 提供 */
    count: number;
}

/**
 * @example
 * const renders = useRenderCount();
 * return <RenderBadge label="MessageBubble" count={renders} />;
 */
export const RenderBadge = memo(({ label, count }: RenderBadgeProps) => {
    return (
        <span
            title={`${label} 已渲染 ${count} 次`}
            className="inline-flex shrink-0 items-center rounded-full bg-rose-50 px-1.5 py-0.5 font-mono text-[10px] leading-none text-rose-500 dark:bg-rose-950 dark:text-rose-300"
        >
            ×{count}
        </span>
    );
});

RenderBadge.displayName = 'RenderBadge';
