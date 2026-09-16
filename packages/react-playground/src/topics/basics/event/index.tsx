/**
 * ============================================================================
 * 事件与合成事件 — React 基础专题
 * ============================================================================
 *
 * 演示 React 合成事件(SyntheticEvent)的特性:跨浏览器统一封装、
 * 事件委托到根节点、阻止默认行为,以及事件冒泡的控制。
 *
 * @module topics/basics/event
 */

import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Button } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

const EventTopic = () => {
    const [logs, setLogs] = useState<string[]>([]);

    const appendLog = (msg: string) =>
        setLogs((prev) => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 6));

    // 合成事件:e 是 React 封装的 SyntheticEvent,而非原生 Event
    const inspectEvent = (e: SyntheticEvent) => {
        appendLog(
            `e.constructor = ${e.constructor.name},e.nativeEvent.constructor = ${e.nativeEvent.constructor.name}`,
        );
    };

    return (
        <TopicPage
            title="事件与合成事件"
            description="React 用 SyntheticEvent 统一封装原生事件,并委托到根节点统一分发"
        >
            <TopicSection
                title="合成事件的封装"
                note="点击按钮,观察事件对象:React 事件处理器收到的是 SyntheticEvent,原生事件在 e.nativeEvent 上"
            >
                <Button type="primary" onClick={inspectEvent}>
                    点我检查事件对象
                </Button>
            </TopicSection>

            <TopicSection
                title="事件冒泡与 stopPropagation"
                note="点击内层按钮:不加阻止时父级也能收到点击(冒泡);勾选后内层调用 e.stopPropagation()"
            >
                <div
                    className="cursor-pointer rounded-card border border-primary-200 bg-primary-50 p-6"
                    onClick={() => appendLog('父级 div 收到点击(冒泡到达)')}
                >
                    <span className="text-sm text-primary-700">父级区域(点击我也会触发)</span>
                    <div className="mt-3 space-x-3">
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                appendLog('内层按钮:已阻止冒泡');
                            }}
                        >
                            阻止冒泡
                        </Button>
                        <Button onClick={() => appendLog('内层按钮:未阻止冒泡')}>
                            不阻止冒泡
                        </Button>
                    </div>
                </div>
            </TopicSection>

            <TopicSection
                title="阻止默认行为"
                note="合成事件同样支持 preventDefault,下方的链接被拦截,不会发生页面跳转"
            >
                <a
                    href="https://react.dev"
                    className="text-primary-600 underline"
                    onClick={(e) => {
                        e.preventDefault();
                        appendLog('已拦截链接跳转(preventDefault)');
                    }}
                >
                    点我试试(不会真的跳转)
                </a>
            </TopicSection>

            {/* 事件日志 */}
            <div className="rounded-card bg-gray-900 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    事件日志
                </p>
                {logs.length === 0 ? (
                    <p className="text-xs text-gray-500">暂无日志,与上方示例交互试试</p>
                ) : (
                    <ul className="space-y-1 font-mono text-xs text-emerald-300">
                        {logs.map((log, i) => (
                            <li key={`${log}-${i}`}>{log}</li>
                        ))}
                    </ul>
                )}
            </div>
        </TopicPage>
    );
};

export default EventTopic;
