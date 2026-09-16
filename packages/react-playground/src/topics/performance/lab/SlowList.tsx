/**
 * ============================================================================
 * SlowList.tsx — 可控耗时的大列表(教学核心道具)
 * ============================================================================
 *
 * 渲染 itemCount 个条目,每个条目渲染前 busyWork(perItemCost),
 * 总渲染成本 ≈ itemCount × perItemCost 毫秒,可精确拖慢一次渲染。
 * 配合关键字过滤演示「输入 → 昂贵重渲染」的阻塞链路。
 *
 * @module topics/performance/lab/SlowList
 */

import { memo } from 'react';

import { busyWork } from './slow';

interface SlowListProps {
    /** 过滤关键字(简单 includes 匹配) */
    keyword?: string;
    /** 条目总数,默认 5000 */
    itemCount?: number;
    /** 每条目人为渲染耗时(毫秒);测试中传 0 */
    perItemCost?: number;
}

/** 单个条目:人为消耗 perItemCost 毫秒后渲染一行 */
const SlowItem = memo(({ index, cost }: { index: number; cost: number }) => {
    busyWork(cost);
    return (
        <li className="px-2 py-0.5 text-xs text-gray-600 dark:text-slate-400">
            条目 #{index + 1}
        </li>
    );
});

SlowItem.displayName = 'SlowItem';

/**
 * @example
 * <SlowList keyword={deferredKeyword} itemCount={5000} perItemCost={0.5} />
 */
export const SlowList = memo(({ keyword = '', itemCount = 5000, perItemCost = 0.5 }: SlowListProps) => {
    const trimmed = keyword.trim();
    const items: number[] = [];
    for (let i = 0; i < itemCount; i += 1) {
        // 简单过滤:关键字为空全量展示,否则匹配编号文本
        if (trimmed === '' || `条目 #${i + 1}`.includes(trimmed)) {
            items.push(i);
        }
    }

    return (
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-slate-800">
            {items.map((index) => (
                <SlowItem key={index} index={index} cost={perItemCost} />
            ))}
        </ul>
    );
});

SlowList.displayName = 'SlowList';
