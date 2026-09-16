/**
 * ============================================================================
 * FrameMeter.tsx — 帧耗时迷你条图 + 输入延迟读数
 * ============================================================================
 *
 * 把 useFrameStats 的采样结果可视化:60 根帧条按耗时分色
 * (绿 < 16.7ms,琥珀 < 50ms,红 ≥ 50ms),直观呈现「卡不卡」。
 *
 * @module topics/performance/lab/FrameMeter
 */

import { memo } from 'react';

/** 60fps 帧预算:16.6ms */
const FRAME_BUDGET = 16.7;
/** 超过 50ms 视为明显长帧 */
const LONG_FRAME = 50;

interface FrameMeterProps {
    frames: readonly number[];
    inputLag: number | null;
}

/** 单根帧条颜色分档 */
const barColor = (duration: number): string => {
    if (duration >= LONG_FRAME) {
        return 'bg-rose-400';
    }
    if (duration >= FRAME_BUDGET) {
        return 'bg-amber-400';
    }
    return 'bg-emerald-400';
};

/**
 * @example
 * const { frames, inputLag } = useFrameStats();
 * <FrameMeter frames={frames} inputLag={inputLag} />
 */
export const FrameMeter = memo(({ frames, inputLag }: FrameMeterProps) => {
    return (
        <div className="space-y-1.5">
            <div className="flex h-10 items-end gap-px rounded-lg bg-gray-50 p-1 dark:bg-slate-800/60">
                {frames.length === 0 ? (
                    <span className="self-center text-[10px] text-gray-400 dark:text-slate-500">
                        帧采集中…
                    </span>
                ) : (
                    frames.map((duration, i) => (
                        <span
                            key={i}
                            title={`${duration.toFixed(1)}ms`}
                            className={`w-1 rounded-sm ${barColor(duration)}`}
                            style={{ height: `${Math.min(100, (duration / LONG_FRAME) * 100)}%` }}
                        />
                    ))
                )}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    &lt;16.7ms
                </span>
                <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    &lt;50ms
                </span>
                <span className="flex items-center gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    ≥50ms 长帧
                </span>
                <span className="ml-auto font-mono">
                    输入延迟:{inputLag === null ? '—' : `${inputLag.toFixed(0)}ms`}
                </span>
            </div>
        </div>
    );
});

FrameMeter.displayName = 'FrameMeter';
