/**
 * ============================================================================
 * LiftStateDemo — 兄弟共用,提升到父级
 * ============================================================================
 *
 * 列表与预览互不认识,selectedId 只活在父级。点左侧一项,右侧立刻显示,
 * 中间没有 effect 同步。
 *
 * @module topics/advanced/component-comm/playground/components/LiftStateDemo
 */

import { memo, useState } from 'react';

interface Fruit {
    id: string;
    name: string;
    note: string;
}

const FRUITS: Fruit[] = [
    { id: 'apple', name: '苹果', note: '详情只从父级拿到 id,自己不存选中态' },
    { id: 'pear', name: '梨', note: '兄弟组件之间没有直接通道' },
    { id: 'grape', name: '葡萄', note: '改选中只走父级的 setSelectedId' },
];

export const LiftStateDemo = memo(() => {
    const [selectedId, setSelectedId] = useState(FRUITS[0].id);
    const selected = FRUITS.find((fruit) => fruit.id === selectedId) ?? FRUITS[0];

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <ul className="space-y-2">
                {FRUITS.map((fruit) => (
                    <li key={fruit.id}>
                        <button
                            type="button"
                            onClick={() => setSelectedId(fruit.id)}
                            className={`w-full rounded-card border px-3 py-2 text-left text-sm transition-colors ${
                                fruit.id === selectedId
                                    ? 'border-sky-500 bg-sky-50 font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                                    : 'border-gray-100 text-gray-600 hover:border-sky-300 dark:border-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {fruit.name}
                        </button>
                    </li>
                ))}
            </ul>
            <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{selected.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">{selected.note}</p>
                <p className="mt-2 font-mono text-[11px] text-gray-400">selectedId = {selectedId}</p>
            </div>
        </div>
    );
});

LiftStateDemo.displayName = 'LiftStateDemo';
