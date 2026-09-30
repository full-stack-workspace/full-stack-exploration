/**
 * ============================================================================
 * PathDemo — 根上的一次监听如何还原捕获与冒泡
 * ============================================================================
 *
 * 原生点击发生在 button 上,演示用 React 的 onClickCapture / onClick
 * 记录顺序。机制页说明:React 17 起监听在根容器,再沿 Fiber.return 收集路径。
 *
 * @module topics/internals/events/PathDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

interface Entry {
    id: number;
    text: string;
}

let entryId = 0;

export const PathDemo = memo(() => {
    const [log, setLog] = useState<Entry[]>([]);

    const mark = (text: string) => () => {
        entryId += 1;
        const entry = { id: entryId, text };
        setLog((prev) => [...prev, entry]);
    };

    return (
        <div className="space-y-3">
            <div
                className="rounded-lg border border-dashed border-cyan-300 p-3 dark:border-cyan-800"
                onClickCapture={mark('App 捕获')}
                onClick={mark('App 冒泡')}
            >
                <p className="mb-2 text-xs text-gray-400">App</p>
                <div
                    className="rounded-md border border-dashed border-cyan-200 p-3 dark:border-cyan-900"
                    onClickCapture={mark('List 捕获')}
                    onClick={mark('List 冒泡')}
                >
                    <p className="mb-2 text-xs text-gray-400">List</p>
                    <Button type="primary" onClick={mark('Button 冒泡')}>
                        点在按钮上
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => setLog([])}>清空</Button>
            </div>
            <ol className="space-y-1 font-mono text-xs text-gray-600 dark:text-slate-300" aria-label="事件路径">
                {log.map((entry) => (
                    <li key={entry.id}>{entry.text}</li>
                ))}
            </ol>
        </div>
    );
});

PathDemo.displayName = 'PathDemo';
