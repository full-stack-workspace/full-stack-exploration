/**
 * ============================================================================
 * EventLog.tsx — 共享事件日志面板 + useEventLog Hook
 * ============================================================================
 *
 * 本专题所有 demo 共用的深色终端风日志面板(由旧页日志区升级):
 * - useEventLog:日志状态管理,按时间顺序追加、带全局序号、容量上限
 * - EventLog:日志渲染,带清空按钮,超出高度可滚动
 *
 * 各 demo 各自持有一份日志,互不干扰;append / clear 均为稳定引用,
 * 可安全放入 useEffect 依赖。
 *
 * @module topics/basics/event/components/EventLog
 */

import { memo, useCallback, useRef, useState } from 'react';

/* =================================================================
 * useEventLog — 日志状态 Hook
 * ================================================================ */

/**
 * 事件日志状态管理
 *
 * @param max 日志容量上限,超出后丢弃最旧的记录
 * @returns logs 日志数组(按触发顺序排列);append 追加一条;clear 清空并复位序号
 */
export const useEventLog = (max = 40) => {
    const [logs, setLogs] = useState<string[]>([]);
    // 序号用 ref 而非 state:自增不需要触发渲染,且多次连续 append 能拿到递增序号
    const seqRef = useRef(0);

    const append = useCallback(
        (msg: string) => {
            seqRef.current += 1;
            const seq = seqRef.current;
            const time = new Date().toLocaleTimeString();
            // 追加在尾部而非头部:传播顺序(捕获→冒泡)自上而下阅读才符合直觉
            setLogs((prev) => [...prev, `#${seq} ${time} ${msg}`].slice(-max));
        },
        [max],
    );

    const clear = useCallback(() => {
        seqRef.current = 0;
        setLogs([]);
    }, []);

    return { logs, append, clear };
};

/* =================================================================
 * EventLog — 日志面板组件
 * ================================================================ */

interface EventLogProps {
    /** 面板标题,默认「事件日志」 */
    title?: string;
    /** 日志数组(useEventLog 返回值) */
    logs: string[];
    /** 清空回调(useEventLog 返回值) */
    onClear: () => void;
}

/**
 * @example
 * const { logs, append, clear } = useEventLog();
 * <EventLog logs={logs} onClear={clear} />
 */
export const EventLog = memo(({ title = '事件日志', logs, onClear }: EventLogProps) => {
    return (
        <div className="rounded-card bg-gray-900 p-4 dark:bg-slate-950">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {title}
                </p>
                <button
                    type="button"
                    onClick={onClear}
                    className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                >
                    清空
                </button>
            </div>
            {logs.length === 0 ? (
                <p className="text-xs text-gray-500">暂无日志,与上方示例交互试试</p>
            ) : (
                <ul className="max-h-48 space-y-1 overflow-y-auto font-mono text-xs text-emerald-300">
                    {logs.map((log, i) => (
                        <li key={`${i}-${log}`}>{log}</li>
                    ))}
                </ul>
            )}
        </div>
    );
});

EventLog.displayName = 'EventLog';
