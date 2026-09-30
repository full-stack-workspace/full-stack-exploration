/**
 * ============================================================================
 * LabPanel.tsx — 三栏对照实验共用的「有状态面板」
 * ============================================================================
 *
 * Activity 隐藏保活实验的观测对象:同一个面板组件被三种隐藏策略复用,
 * 面板内部携带三类可观测状态,让「状态是否保留、effect 是否还在跑」可感知:
 * - 受控输入框 + 计数器:组件实例 state,用于观察隐藏再显示后是否还在;
 * - 心跳定时器:effect 每 1s 跳一次 tick 并上报父组件,用于观察隐藏期间
 *   effect(副作用)是否仍在运行;
 * - effect 挂载 / 销毁事件上报:留下日志证据。
 *
 * @module topics/advanced/view-transition-activity/components/LabPanel
 */

import { memo, useEffect, useState } from 'react';
import { Button, Input } from 'antd';

/* =================================================================
 * 三栏标识与展示名(LabPanel 与 ActivityLab 共用,定义在此避免循环依赖)
 * ================================================================ */

/** 三种隐藏策略的栏位标识 */
export type LaneId = 'unmount' | 'css' | 'activity';

/** 栏位展示名,同时作为日志与测试断言的前缀 */
export const LANE_LABELS: Record<LaneId, string> = {
    unmount: '条件卸载',
    css: 'display:none',
    activity: 'Activity',
};

/** effect 生命周期事件:挂载(启动心跳) / 清理(销毁心跳) */
export type EffectEventKind = 'mount' | 'cleanup';

/* =================================================================
 * 有状态面板
 * ================================================================ */

interface LabPanelProps {
    /** 所属栏位,日志与心跳上报时带上 */
    lane: LaneId;
    /** effect 挂载 / 清理时上报(父组件记录日志、统计挂载次数) */
    onEffectEvent?: (lane: LaneId, kind: EffectEventKind) => void;
    /** 心跳 tick 变化时上报(父组件展示「effect 是否还活着」) */
    onTick?: (lane: LaneId, tick: number) => void;
}

/**
 * 带内部状态与副作用的演示面板。
 *
 * 心跳定时器刻意放在 effect 里:心跳停不停,就是「副作用有没有被
 * React 停掉」的直接证据 —— 这正是 Activity 与 display:none 的分水岭。
 *
 * @param props.lane - 所属栏位标识
 * @param props.onEffectEvent - effect 挂载 / 清理回调
 * @param props.onTick - 心跳 tick 回调
 * @returns 面板 UI
 *
 * @example
 * <LabPanel lane="activity" onEffectEvent={log} onTick={tick} />
 */
export const LabPanel = memo(({ lane, onEffectEvent, onTick }: LabPanelProps) => {
    const [text, setText] = useState('');
    const [count, setCount] = useState(0);
    const [tick, setTick] = useState(0);

    // 心跳 effect:挂载即启动定时器,清理即停止。
    // 条件卸载与 Activity 隐藏都会触发清理;display:none 不会。
    useEffect(() => {
        onEffectEvent?.(lane, 'mount');
        const timer = setInterval(() => setTick((t) => t + 1), 1000);
        return () => {
            clearInterval(timer);
            onEffectEvent?.(lane, 'cleanup');
        };
    }, [lane, onEffectEvent]);

    // tick 变化单独上报:隐藏期间面板不可见,只能靠回调把「心跳还在跳」
    // 这件事传递到栏位头部的读数上
    useEffect(() => {
        onTick?.(lane, tick);
    }, [lane, tick, onTick]);

    return (
        <div
            data-testid={`panel-${lane}`}
            className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
        >
            <Input
                size="small"
                placeholder={`在「${LANE_LABELS[lane]}」面板输入`}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-slate-400">计数:{count}</span>
                <Button size="small" onClick={() => setCount((c) => c + 1)}>
                    +1
                </Button>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                面板内心跳 tick:{tick}(由 effect 定时器驱动)
            </p>
        </div>
    );
});

LabPanel.displayName = 'LabPanel';
