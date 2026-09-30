/**
 * ============================================================================
 * TimingDemo — layout、帧回调、passive 的先后
 * ============================================================================
 *
 * 点击后:useLayoutEffect 在本次提交里同步执行;rAF 在随后的绘制机会;
 * useEffect 由 Scheduler 排到绘制之后的任务。开发环境 StrictMode 只在挂载时
 * 双调用 effect,这次点击是更新,顺序稳定。
 *
 * @module topics/internals/commit/TimingDemo
 */

import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { Button } from 'antd';

interface Entry {
    id: number;
    text: string;
}

let entryId = 0;

export const TimingDemo = memo(() => {
    const [tick, setTick] = useState(0);
    const [log, setLog] = useState<Entry[]>([]);

    const push = (text: string) => {
        entryId += 1;
        const entry = { id: entryId, text };
        setLog((prev) => [...prev, entry]);
    };

    useLayoutEffect(() => {
        if (tick === 0) {
            return;
        }
        push(`layout · tick ${tick}(DOM 已更新,这一帧还没画)`);
    }, [tick]);

    useEffect(() => {
        if (tick === 0) {
            return;
        }
        push(`passive · tick ${tick}(绘制之后)`);
    }, [tick]);

    const handleClick = () => {
        const next = tick + 1;
        requestAnimationFrame(() => {
            push(`rAF · tick ${next}(浏览器准备绘制这一帧)`);
        });
        setTick(next);
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Button type="primary" onClick={handleClick}>
                    触发一次更新
                </Button>
                <Button
                    onClick={() => {
                        setLog([]);
                        setTick(0);
                    }}
                >
                    清空
                </Button>
            </div>
            <ol className="space-y-1 font-mono text-xs text-gray-600 dark:text-slate-300" aria-label="提交时序">
                {log.map((entry) => (
                    <li key={entry.id}>{entry.text}</li>
                ))}
            </ol>
        </div>
    );
});

TimingDemo.displayName = 'TimingDemo';
