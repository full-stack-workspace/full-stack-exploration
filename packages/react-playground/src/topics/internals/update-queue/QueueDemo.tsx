/**
 * ============================================================================
 * QueueDemo — 同一事件里的多次 setState 如何合并
 * ============================================================================
 *
 * 对象式更新读到的是这一轮渲染时的 n,后一次覆盖前一次。
 * 函数式更新依次看见队列里已经排上的值。React 18 在 setTimeout 里同样批处理。
 *
 * @module topics/internals/update-queue/QueueDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

export const QueueDemo = memo(() => {
    const [n, setN] = useState(0);
    const [note, setNote] = useState('还没有触发');

    return (
        <div className="space-y-3">
            <p className="font-mono text-sm text-gray-700 dark:text-slate-200">当前 n = {n}</p>
            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => {
                        setN(n + 1);
                        setN(n + 1);
                        setNote('两次 setN(n + 1):都读到同一次渲染的 n,结果 +1');
                    }}
                >
                    两次直接 +1
                </Button>
                <Button
                    onClick={() => {
                        setN((value) => value + 1);
                        setN((value) => value + 1);
                        setN((value) => value + 1);
                        setNote('三次函数式更新排进同一条队列,依次 +1,结果 +3');
                    }}
                >
                    三次函数式 +1
                </Button>
                <Button
                    onClick={() => {
                        window.setTimeout(() => {
                            setN((value) => value + 1);
                            setN((value) => value + 1);
                            setNote('setTimeout 里的两次函数式更新仍被批成一次渲染,+2');
                        }, 0);
                    }}
                >
                    超时里 +1 两次
                </Button>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-400">{note}</p>
        </div>
    );
});

QueueDemo.displayName = 'QueueDemo';
