/**
 * ============================================================================
 * HookSlots — 调用顺序如何对应到链表槽位
 * ============================================================================
 *
 * 只移动示意图上的槽,不在真实组件里条件调用 Hook。
 * 插入一个槽之后,后面每次渲染读到的 memoizedState 都错一位。
 *
 * @module topics/internals/hooks-impl/HookSlots
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

const STABLE = [
    { name: 'useState', value: 'count = 1' },
    { name: 'useRef', value: 'box' },
    { name: 'useEffect', value: '订阅' },
];

const SHIFTED = [
    { name: 'useState', value: 'flag = true' },
    { name: 'useState', value: '读到了 count 的节点' },
    { name: 'useRef', value: '读到了 effect 的节点' },
    { name: 'useEffect', value: '链表已经到头' },
];

export const HookSlots = memo(() => {
    const [shifted, setShifted] = useState(false);
    const rows = shifted ? SHIFTED : STABLE;

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Button type={shifted ? 'default' : 'primary'} onClick={() => setShifted(false)}>
                    稳定调用
                </Button>
                <Button type={shifted ? 'primary' : 'default'} onClick={() => setShifted(true)}>
                    中间插入一个 Hook
                </Button>
            </div>
            <ol className="space-y-1" aria-label="Hook 槽位">
                {rows.map((row, index) => (
                    <li
                        key={`${row.name}-${index}`}
                        className="flex items-baseline gap-3 rounded border border-gray-100 px-3 py-2 font-mono text-xs dark:border-slate-700"
                    >
                        <span className="text-gray-400">#{index}</span>
                        <span className="text-cyan-800 dark:text-cyan-200">{row.name}</span>
                        <span className="text-gray-500 dark:text-slate-400">{row.value}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
});

HookSlots.displayName = 'HookSlots';
