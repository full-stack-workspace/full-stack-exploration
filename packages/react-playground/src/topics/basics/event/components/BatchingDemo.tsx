/**
 * ============================================================================
 * BatchingDemo.tsx — 事件中的状态批处理
 * ============================================================================
 *
 * 渲染计数器(useRef 在 render 中自增)+ 两种触发方式对照:
 * - 事件处理器里连续 3 次 setState → 只渲染 1 次
 * - setTimeout 里同样 3 次 setState → React 18+ 自动批处理下仍只渲染 1 次
 *   (React 18 之前 setTimeout / Promise 里不批处理,面试常考)
 *
 * @module topics/basics/event/components/BatchingDemo
 */

import { memo, useEffect, useRef, useState } from 'react';
import { Button, Tag } from 'antd';

import { EventLog, useEventLog } from './EventLog';

export const BatchingDemo = memo(() => {
    const { logs, append, clear } = useEventLog();
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const [c, setC] = useState(0);

    // ref 在 render 中自增:不触发额外渲染,又能累计每次 render 的次数
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    // 每次 a/b/c 提交后记录一次渲染;deps 不含 logs,append 日志引发的渲染不会重复记录
    useEffect(() => {
        append(`提交完成:a=${a} b=${b} c=${c},累计渲染 ${renderCountRef.current} 次`);
    }, [a, b, c, append]);

    const handleSync = () => {
        append('—— 事件处理器中连续调用 3 次 setState ——');
        setA((v) => v + 1);
        setB((v) => v + 1);
        setC((v) => v + 1);
    };

    const handleTimeout = () => {
        append('—— setTimeout 中调用 3 次 setState(React 18+ 自动批处理)——');
        setTimeout(() => {
            setA((v) => v + 1);
            setB((v) => v + 1);
            setC((v) => v + 1);
        }, 0);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Button type="primary" onClick={handleSync}>
                    事件中 3 次 setState
                </Button>
                <Button onClick={handleTimeout}>setTimeout 中 3 次 setState</Button>
                <Tag color="geekblue">渲染次数:{renderCountRef.current}</Tag>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    a={a} b={b} c={c} —— 每次点击渲染只 +1,而不是 +3
                </span>
            </div>
            <EventLog logs={logs} onClear={clear} />
        </div>
    );
});

BatchingDemo.displayName = 'BatchingDemo';
