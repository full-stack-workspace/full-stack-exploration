/**
 * ============================================================================
 * PoolingHistoryDemo.tsx — 特殊场景(上):事件池化历史 & onChange 语义陷阱
 * ============================================================================
 *
 * 两个面试高频 Case:
 * a) 事件池化:React 16 及以前 SyntheticEvent 会被回收复用,异步访问得到 null;
 *    React 17+ 已移除池化 —— 点击后 setTimeout 500ms 再读 e.type,现在能正常读到
 * b) onChange 语义:React 的 onChange 实际是原生 input 事件(每次键入即触发),
 *    原生 change 要等 blur 才触发 —— 同一输入框挂两种监听对比触发时机
 *
 * @module topics/basics/event/components/PoolingHistoryDemo
 */

import { memo, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Button } from 'antd';

import { EventLog, useEventLog } from './EventLog';

export const PoolingHistoryDemo = memo(() => {
    const pooling = useEventLog();
    const { logs: changeLogs, append: appendChange, clear: clearChange } = useEventLog();
    const inputRef = useRef<HTMLInputElement>(null);

    /* ==== Case a:React 17+ 无池化,异步读取合成事件属性依然有效 ==== */
    const handleAsyncRead = (e: MouseEvent<HTMLButtonElement>) => {
        pooling.append(`同步读取:e.type = "${e.type}"`);
        // 闭包持有合成事件引用;React 16 及以前这里会读到 null(对象已回池复用)
        setTimeout(() => {
            pooling.append(`500ms 后异步读取:e.type = "${e.type}"(React 17+ 无池化,正常可读)`);
        }, 500);
    };

    /* ==== Case b:同一输入框同时挂原生 change 监听,与 React onChange 对比 ==== */
    useEffect(() => {
        const el = inputRef.current;
        if (!el) {
            return;
        }
        const onNativeChange = () =>
            appendChange('原生 change 触发(blur 且值发生变化后才触发)');
        el.addEventListener('change', onNativeChange);
        return () => el.removeEventListener('change', onNativeChange);
    }, [appendChange]);

    return (
        <div className="space-y-6">
            {/* Case a:事件池化 */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    a) 异步读取事件属性(池化复现)
                </p>
                <Button type="primary" onClick={handleAsyncRead}>
                    点击,500ms 后再读 e.type
                </Button>
                <EventLog title="池化日志" logs={pooling.logs} onClear={pooling.clear} />
            </div>

            {/* Case b:onChange 语义 */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    b) React onChange vs 原生 change(连续键入,然后点别处 blur)
                </p>
                <input
                    ref={inputRef}
                    placeholder="输入几个字,再点击页面空白处"
                    className="w-72 rounded-card border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    onChange={() => appendChange('React onChange 触发(每次键入立即触发,实为原生 input 事件)')}
                />
                <EventLog title="触发时机对比" logs={changeLogs} onClear={clearChange} />
            </div>
        </div>
    );
});

PoolingHistoryDemo.displayName = 'PoolingHistoryDemo';
