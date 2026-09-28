/**
 * ============================================================================
 * WaterfallDemo — 独立请求并行 vs 组件层级串行
 * ============================================================================
 *
 * 规则 2:独立请求尽早并行;有依赖再串行。瀑布往往来自「子组件 mount 后才 fetch」。
 *
 * @module topics/performance/governance/implement/components/WaterfallDemo
 */

import { memo, useState } from 'react';
import { Button, Segmented, Tag } from 'antd';

type Mode = 'waterfall' | 'parallel';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const WaterfallDemo = memo(() => {
    const [mode, setMode] = useState<Mode>('waterfall');
    const [log, setLog] = useState<string[]>([]);
    const [elapsed, setElapsed] = useState<number | null>(null);
    const [running, setRunning] = useState(false);

    const run = async () => {
        setRunning(true);
        setLog([]);
        setElapsed(null);
        const started = performance.now();
        const lines: string[] = [];
        const push = (line: string) => {
            lines.push(line);
            setLog([...lines]);
        };

        if (mode === 'waterfall') {
            push('User 组件 mount,开始拉用户 120ms');
            await sleep(120);
            push('User 完成 → Profile 才 mount,开始拉资料 120ms');
            await sleep(120);
            push('Profile 完成 → Stats 才 mount,开始拉统计 120ms');
            await sleep(120);
        } else {
            push('页面一开始并行:用户 / 配置 120ms;资料依赖用户 id 随后发出');
            await Promise.all([sleep(120), sleep(80)]);
            push('用户与配置完成;资料请求已在用户返回后立即发出');
            await sleep(120);
        }

        setElapsed(Math.round(performance.now() - started));
        setRunning(false);
    };

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="请求编排模式"
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                options={[
                    { label: '组件树瀑布', value: 'waterfall' },
                    { label: '依赖感知并行', value: 'parallel' },
                ]}
            />
            <Button size="small" loading={running} onClick={() => void run()}>
                模拟一次进入页面
            </Button>
            <ul className="space-y-1 font-mono text-xs text-gray-500 dark:text-slate-400">
                {log.map((line) => (
                    <li key={line}>{line}</li>
                ))}
            </ul>
            {elapsed !== null ? (
                <Tag color={mode === 'waterfall' ? 'red' : 'green'}>墙钟 {elapsed}ms</Tag>
            ) : null}
        </div>
    );
});

WaterfallDemo.displayName = 'WaterfallDemo';
