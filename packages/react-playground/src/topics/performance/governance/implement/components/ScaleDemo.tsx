/**
 * ============================================================================
 * ScaleDemo — 分页管取多少,窗口管渲染多少
 * ============================================================================
 *
 * 规则 4:限制单次工作量,也限制累计工作量。无限滚动 + 虚拟列表仍可能无限保留历史。
 *
 * @module topics/performance/governance/implement/components/ScaleDemo
 */

import { memo, useMemo, useState } from 'react';
import { Segmented, Slider } from 'antd';

type Mode = 'all' | 'window' | 'page';

const TOTAL = 400;

export const ScaleDemo = memo(() => {
    const [mode, setMode] = useState<Mode>('all');
    const [offset, setOffset] = useState(0);

    const visible = useMemo(() => {
        if (mode === 'all') {
            return Array.from({ length: TOTAL }, (_, i) => i);
        }
        if (mode === 'window') {
            return Array.from({ length: 12 }, (_, i) => i + offset);
        }
        return Array.from({ length: 20 }, (_, i) => i);
    }, [mode, offset]);

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="列表规模策略"
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                options={[
                    { label: '一次挂 400 条', value: 'all' },
                    { label: '只挂可视 12 条', value: 'window' },
                    { label: '分页每页 20 条', value: 'page' },
                ]}
            />
            {mode === 'window' ? (
                <div>
                    <p className="mb-1 text-xs text-gray-400">滚动窗口起点</p>
                    <Slider
                        aria-label="窗口起点"
                        min={0}
                        max={TOTAL - 12}
                        value={offset}
                        onChange={setOffset}
                    />
                </div>
            ) : null}
            <p className="text-xs text-gray-500 dark:text-slate-400">
                数据总量 {TOTAL} · 当前 DOM 节点 {visible.length}
                {mode === 'all' ? ' · 滚动再快,布局和内存也跟着 400 走' : ''}
                {mode === 'window' ? ' · 若历史数据仍全堆在内存,还要另做回收' : ''}
                {mode === 'page' ? ' · 传输和解析先被页大小卡住' : ''}
            </p>
            <ul className="max-h-40 overflow-auto rounded-lg border border-gray-100 text-xs dark:border-slate-800">
                {visible.map((id) => (
                    <li key={id} className="border-b border-gray-50 px-2 py-1 dark:border-slate-800">
                        行 #{id + 1}
                    </li>
                ))}
            </ul>
        </div>
    );
});

ScaleDemo.displayName = 'ScaleDemo';
