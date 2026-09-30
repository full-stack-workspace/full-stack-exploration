/**
 * ============================================================================
 * ActivityLab.tsx — 隐藏保活三栏对照实验(本站招牌形态)
 * ============================================================================
 *
 * 同一个 LabPanel(输入框 + 计数器 + effect 心跳)被三种「隐藏策略」
 * 并排渲染,共用一个全局「隐藏 / 显示」开关,唯一变量就是隐藏方式:
 *
 * - 条件卸载:隐藏时从 JSX 移除 —— 组件销毁,state 与 DOM 一并丢失;
 * - display:none:DOM 保留,state 保留,但组件继续参与渲染、effect
 *   心跳在隐藏期间照跑(浪费,且副作用可能还在做不该做的事);
 * - <Activity mode="hidden">:state 与 DOM 保留,effect 被 React 销毁
 *   (心跳停止、清理函数执行),并以低优先级后台预渲染;恢复 visible 时
 *   effect 重新挂载,state 原样接上。
 *
 * 观测点:输入框与计数器(state 是否保留)、栏位头部的心跳读数与
 * effect 挂载次数(effect 死活)、底部共享日志(生命周期事件流)。
 *
 * @module topics/advanced/view-transition-activity/components/ActivityLab
 */

import { memo, useCallback, useState } from 'react';
import { Button, Tag } from 'antd';
import { Activity } from 'react';

import { LANE_LABELS, LabPanel } from './LabPanel';
import type { EffectEventKind, LaneId } from './LabPanel';

/** 每栏的实时读数:心跳 tick(效活证据)与 effect 挂载次数(重建证据) */
interface LaneStatus {
    tick: number;
    effectMounts: number;
}

const INITIAL_STATUS: Record<LaneId, LaneStatus> = {
    unmount: { tick: 0, effectMounts: 0 },
    css: { tick: 0, effectMounts: 0 },
    activity: { tick: 0, effectMounts: 0 },
};

/** 日志条数上限:实验是给人看的,只留最近几条,避免无限增长 */
const LOG_LIMIT = 8;

/**
 * 三栏对照实验容器。
 *
 * @returns 三栏实验 UI(开关 + 三栏 + 日志)
 *
 * @example
 * <ActivityLab />
 */
export const ActivityLab = memo(() => {
    const [hidden, setHidden] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<Record<LaneId, LaneStatus>>(INITIAL_STATUS);

    // effect 挂载 / 销毁:记日志,挂载时累加「effect 挂载次数」——
    // 条件卸载与 Activity 重新显示都会 +1,display:none 永远停在 1
    const handleEffectEvent = useCallback((lane: LaneId, kind: EffectEventKind) => {
        const text = `[${LANE_LABELS[lane]}] effect ${kind === 'mount' ? '挂载' : '销毁'}`;
        setLogs((prev) => [text, ...prev].slice(0, LOG_LIMIT));
        if (kind === 'mount') {
            setStatus((prev) => ({
                ...prev,
                [lane]: { ...prev[lane], effectMounts: prev[lane].effectMounts + 1 },
            }));
        }
    }, []);

    const handleTick = useCallback((lane: LaneId, tick: number) => {
        setStatus((prev) => ({ ...prev, [lane]: { ...prev[lane], tick } }));
    }, []);

    const laneHeader = (lane: LaneId, strategy: string) => (
        <div className="mb-2 space-y-1">
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                    {LANE_LABELS[lane]}
                </span>
                <Tag color={lane === 'activity' ? 'green' : lane === 'css' ? 'orange' : 'red'}>
                    {strategy}
                </Tag>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                心跳 tick:{status[lane].tick} · effect 挂载次数:{status[lane].effectMounts}
            </p>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* 全局开关:三栏同时隐藏 / 显示,保证唯一变量是隐藏策略 */}
            <div className="flex items-center gap-3">
                <Button type="primary" onClick={() => setHidden((h) => !h)}>
                    {hidden ? '显示全部面板' : '隐藏全部面板'}
                </Button>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    先在三个面板里各输入内容、点几下 +1,再切换隐藏 ——
                    然后盯着「心跳 tick」与「effect 挂载次数」
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* 栏一:条件卸载 —— 隐藏即销毁,state 随实例一起没了 */}
                <div data-testid="lane-unmount">
                    {laneHeader('unmount', 'state 丢失')}
                    {hidden ? (
                        <div className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500">
                            组件已卸载:实例、state 与 DOM 一并销毁
                        </div>
                    ) : (
                        <LabPanel lane="unmount" onEffectEvent={handleEffectEvent} onTick={handleTick} />
                    )}
                </div>

                {/* 栏二:display:none —— DOM 与 state 保留,但渲染与副作用照旧 */}
                <div data-testid="lane-css">
                    {laneHeader('css', 'state 保留 / effect 照跑')}
                    {/* Tailwind 的 hidden 即 display:none */}
                    <div className={hidden ? 'hidden' : undefined}>
                        <LabPanel lane="css" onEffectEvent={handleEffectEvent} onTick={handleTick} />
                    </div>
                </div>

                {/* 栏三:Activity —— state 保留,隐藏时 effect 被销毁、后台预渲染 */}
                <div data-testid="lane-activity">
                    {laneHeader('activity', 'state 保留 / effect 暂停')}
                    <Activity mode={hidden ? 'hidden' : 'visible'} name="lab-panel">
                        <LabPanel lane="activity" onEffectEvent={handleEffectEvent} onTick={handleTick} />
                    </Activity>
                </div>
            </div>

            {/* 生命周期日志:effect 的挂载 / 销毁事件流(最新在上) */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                        effect 生命周期日志(最新在上)
                    </span>
                    <Button size="small" type="text" onClick={() => setLogs([])}>
                        清空日志
                    </Button>
                </div>
                {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-slate-500">暂无日志</p>
                ) : (
                    <ul className="space-y-1 font-mono text-xs text-gray-500 dark:text-slate-400">
                        {logs.map((log, i) => (
                            <li key={`${log}-${i}`}>{log}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});

ActivityLab.displayName = 'ActivityLab';
