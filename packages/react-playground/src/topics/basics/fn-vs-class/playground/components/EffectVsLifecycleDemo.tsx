/**
 * ============================================================================
 * EffectVsLifecycleDemo — 订阅拆三处 vs 一个 effect
 * ============================================================================
 *
 * 换房间时两边都应先退订再订阅。class 靠 didUpdate 手写对比;
 * 漏写更新分支是生产里最常见的 class 订阅事故。函数用 deps 表达同一件事。
 *
 * @module topics/basics/fn-vs-class/playground/components/EffectVsLifecycleDemo
 */

import { Component, memo, useCallback, useEffect, useState } from 'react';
import { Button } from 'antd';

import { ComparePane } from '../../components/ComparePane';

const ROOMS = ['大厅', '工单'] as const;

type Room = (typeof ROOMS)[number];

class ClassRoom extends Component<{ room: Room; onLog: (line: string) => void }> {
    static displayName = 'ClassRoom';

    componentDidMount() {
        this.props.onLog(`class 订阅 ${this.props.room}`);
    }

    componentDidUpdate(prev: { room: Room }) {
        if (prev.room !== this.props.room) {
            this.props.onLog(`class 退订 ${prev.room}`);
            this.props.onLog(`class 订阅 ${this.props.room}`);
        }
    }

    componentWillUnmount() {
        this.props.onLog(`class 退订 ${this.props.room}`);
    }

    render() {
        return (
            <p className="text-sm text-gray-700 dark:text-slate-300" aria-label="class 当前房间">
                实例还在,房间 = {this.props.room}
            </p>
        );
    }
}

const FnRoom = memo(({ room, onLog }: { room: Room; onLog: (line: string) => void }) => {
    useEffect(() => {
        onLog(`函数 订阅 ${room}`);
        return () => {
            onLog(`函数 退订 ${room}`);
        };
    }, [onLog, room]);

    return (
        <p className="text-sm text-gray-700 dark:text-slate-300" aria-label="函数 当前房间">
            函数还在,房间 = {room}
        </p>
    );
});

FnRoom.displayName = 'FnRoom';

export const EffectVsLifecycleDemo = memo(() => {
    const [room, setRoom] = useState<Room>('大厅');
    const [log, setLog] = useState<string[]>([]);

    const onLog = useCallback((line: string) => {
        setLog((curr) => [...curr.slice(-9), line]);
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {ROOMS.map((item) => (
                    <Button
                        key={item}
                        size="small"
                        type={room === item ? 'primary' : 'default'}
                        aria-label={`切换房间 ${item}`}
                        onClick={() => setRoom(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>
            <ComparePane
                classTitle="class · didMount / didUpdate / willUnmount"
                fnTitle="函数 · useEffect([room])"
                classSlot={<ClassRoom room={room} onLog={onLog} />}
                fnSlot={<FnRoom room={room} onLog={onLog} />}
            />
            <ul
                aria-label="订阅日志"
                className="max-h-36 space-y-1 overflow-auto rounded-card border border-gray-100 bg-gray-50 p-2 font-mono text-[11px] text-gray-500 dark:border-slate-800 dark:bg-slate-950"
            >
                {log.length === 0 ? <li>点「工单」看退订 / 订阅成对出现</li> : null}
                {log.map((line, index) => (
                    <li key={`${line}-${index}`}>{line}</li>
                ))}
            </ul>
        </div>
    );
});

EffectVsLifecycleDemo.displayName = 'EffectVsLifecycleDemo';
