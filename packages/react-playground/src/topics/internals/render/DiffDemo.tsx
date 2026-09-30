/**
 * ============================================================================
 * DiffDemo — 多子节点协调的教学模型
 * ============================================================================
 *
 * 先按位置吃掉 key 相同的前缀,剩余旧节点放进 Map,再按 key 决定移动或新建。
 * 对应 reconcileChildrenArray 的形状,省略 lane 与真实 Fiber 复用。
 *
 * @module topics/internals/render/DiffDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

type Op = '复用' | '移动' | '新建' | '删除';

interface Row {
    key: string;
    op: Op;
}

const PRESETS: { id: string; label: string; next: string[] }[] = [
    { id: 'append', label: '尾部插入 e', next: ['a', 'b', 'c', 'd', 'e'] },
    { id: 'prepend', label: '头部插入 e', next: ['e', 'a', 'b', 'c', 'd'] },
    { id: 'swap', label: '交换 b 与 c', next: ['a', 'c', 'b', 'd'] },
    { id: 'drop', label: '删掉 b', next: ['a', 'c', 'd'] },
];

const PREV = ['a', 'b', 'c', 'd'];

/**
 * 教学版多子节点 Diff,对应 placeChild 的 lastPlacedIndex。
 * 前缀 key 相同则原地复用。其余旧节点按 key 查旧序号:
 * 旧序号不小于已放置位置则留在原地,更小则标记移动。查不到则新建,剩下的旧 key 删除。
 */
export function diffKeys(prev: string[], next: string[]): Row[] {
    const rows: Row[] = [];
    let i = 0;
    while (i < prev.length && i < next.length && prev[i] === next[i]) {
        rows.push({ key: next[i], op: '复用' });
        i += 1;
    }
    const indexByKey = new Map<string, number>();
    for (let k = i; k < prev.length; k += 1) {
        indexByKey.set(prev[k], k);
    }
    let lastPlacedIndex = i > 0 ? i - 1 : 0;
    for (let j = i; j < next.length; j += 1) {
        const key = next[j];
        const oldIndex = indexByKey.get(key);
        if (oldIndex === undefined) {
            rows.push({ key, op: '新建' });
            continue;
        }
        indexByKey.delete(key);
        if (oldIndex < lastPlacedIndex) {
            rows.push({ key, op: '移动' });
        } else {
            rows.push({ key, op: '复用' });
            lastPlacedIndex = oldIndex;
        }
    }
    indexByKey.forEach((_index, key) => {
        rows.push({ key, op: '删除' });
    });
    return rows;
}

const OP_CLASS: Record<Op, string> = {
    复用: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    移动: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    新建: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200',
    删除: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export const DiffDemo = memo(() => {
    const [presetId, setPresetId] = useState(PRESETS[0].id);
    const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0];
    const rows = diffKeys(PREV, preset.next);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {PRESETS.map((item) => (
                    <Button
                        key={item.id}
                        type={item.id === presetId ? 'primary' : 'default'}
                        onClick={() => setPresetId(item.id)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
            <p className="font-mono text-xs text-gray-500 dark:text-slate-400">
                旧: {PREV.join(' ')} → 新: {preset.next.join(' ')}
            </p>
            <ul className="space-y-1" aria-label="协调结果">
                {rows.map((row) => (
                    <li key={`${row.op}-${row.key}`} className="flex items-center gap-2 text-sm">
                        <span className={`rounded px-2 py-0.5 text-xs ${OP_CLASS[row.op]}`}>{row.op}</span>
                        <span className="font-mono text-gray-700 dark:text-slate-200">{row.key}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
});

DiffDemo.displayName = 'DiffDemo';
