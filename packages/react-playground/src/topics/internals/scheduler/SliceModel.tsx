/**
 * ============================================================================
 * SliceModel — 5ms 时间片的教学模型
 * ============================================================================
 *
 * 每按一次「走一个工作单元」消耗固定成本。预算用尽就停,模拟 shouldYield。
 * 这不是 Scheduler 的 MessageChannel,也不是真实的 beginWork 计时。
 *
 * @module topics/internals/scheduler/SliceModel
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

const UNITS = ['App', 'Header', 'Title', 'List', 'Item A', 'Item B'];
const BUDGET = 5;
const COST = 2;

interface Frame {
    yielded: boolean;
    done: string[];
}

export const SliceModel = memo(() => {
    const [cursor, setCursor] = useState(0);
    const [spent, setSpent] = useState(0);
    const [frames, setFrames] = useState<Frame[]>([]);

    const finished = cursor >= UNITS.length;

    const step = () => {
        if (finished) {
            return;
        }
        const nextSpent = spent + COST;
        const nextCursor = cursor + 1;
        const yielded = nextSpent >= BUDGET && nextCursor < UNITS.length;
        setFrames((prev) => {
            const copy = [...prev];
            if (copy.length === 0 || copy[copy.length - 1].yielded) {
                copy.push({ yielded: false, done: [] });
            }
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { done: [...last.done, UNITS[cursor]], yielded };
            return copy;
        });
        setCursor(nextCursor);
        setSpent(yielded ? 0 : nextSpent);
    };

    const reset = () => {
        setCursor(0);
        setSpent(0);
        setFrames([]);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={step} disabled={finished}>
                    走一个工作单元
                </Button>
                <Button onClick={reset}>重置</Button>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    本片已用 {spent}ms / 预算 {BUDGET}ms,每个单元记 {COST}ms
                </span>
            </div>
            <ol className="space-y-2 text-xs" aria-label="时间片">
                {frames.map((frame, index) => (
                    <li key={index} className="rounded border border-gray-100 px-3 py-2 dark:border-slate-700">
                        <span className="text-gray-400">片 {index + 1}</span>
                        <span className="ml-2 font-mono text-gray-700 dark:text-slate-200">
                            {frame.done.join(' → ') || '尚未开始'}
                        </span>
                        {frame.yielded ? (
                            <span className="ml-2 text-amber-700 dark:text-amber-300">让出主线程</span>
                        ) : null}
                    </li>
                ))}
            </ol>
        </div>
    );
});

SliceModel.displayName = 'SliceModel';
