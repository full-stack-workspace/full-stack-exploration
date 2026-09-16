/**
 * ============================================================================
 * EventLogPanel.tsx — 事件日志面板
 * ============================================================================
 *
 * 逐条列出 MockSseClient 推入 RuntimeStore 的 RuntimeEvent:
 * 事件类型、eventId、应用结果与应用后的快照版本号。
 * 被幂等去重 / 非法迁移拒绝的事件以灰色标出 ——
 * 它们不产生新快照,左侧 UI 的 RenderBadge 也不会动。
 *
 * @module topics/agent/agent-chat/components/EventLogPanel
 */

import { memo, useEffect, useRef } from 'react';

import { RenderBadge, useRenderCount } from './RenderBadge';

/** 一条事件日志记录(由页面在 applyEvent 时生成) */
export interface EventLogEntry {
    /** 日志序号,从 1 开始 */
    seq: number;
    eventId: string;
    type: string;
    /** 是否真正产生了新快照(false = 被去重/拒绝) */
    applied: boolean;
    /** 应用后的快照版本(未应用时与上一条相同) */
    versionAfter: number;
}

interface EventLogPanelProps {
    entries: readonly EventLogEntry[];
}

/**
 * @example
 * <EventLogPanel entries={eventLog} />
 */
export const EventLogPanel = memo(({ entries }: EventLogPanelProps) => {
    const renders = useRenderCount();
    const listRef = useRef<HTMLDivElement>(null);

    // 新事件到达时滚动到底部,始终聚焦最新一条
    useEffect(() => {
        const el = listRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [entries.length]);

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    {entries.length === 0
                        ? '暂无事件'
                        : `${entries.length} 条事件,${entries.filter((e) => e.applied).length} 条已应用`}
                </span>
                <RenderBadge label="EventLogPanel" count={renders} />
            </div>
            <div
                ref={listRef}
                className="max-h-80 overflow-y-auto rounded-lg bg-gray-900 p-3 font-mono text-xs dark:bg-slate-950"
            >
                {entries.length === 0 ? (
                    <p className="text-gray-500">发起 Run 后,这里实时显示流入 Store 的事件</p>
                ) : (
                    <ul className="space-y-1">
                        {entries.map((entry) => (
                            <li
                                key={entry.seq}
                                className={
                                    entry.applied ? 'text-emerald-300' : 'text-gray-500 line-through'
                                }
                                title={entry.applied ? '已应用' : '已忽略:重复 eventId 或非法状态迁移'}
                            >
                                <span className="text-gray-500">#{entry.seq}</span>{' '}
                                <span className="text-sky-300">{entry.type}</span>{' '}
                                <span className="text-gray-400">({entry.eventId})</span>{' '}
                                {entry.applied ? (
                                    <span className="text-gray-400">→ v{entry.versionAfter}</span>
                                ) : (
                                    <span className="text-gray-500">已忽略 · 快照不变</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});

EventLogPanel.displayName = 'EventLogPanel';
