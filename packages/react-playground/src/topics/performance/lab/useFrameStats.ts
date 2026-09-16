/**
 * ============================================================================
 * useFrameStats.ts — rAF 帧耗时与输入延迟采样
 * ============================================================================
 *
 * 用 requestAnimationFrame 循环测量每帧实际耗时,并支持
 * 「输入事件发生 → 下一帧完成」的输入延迟打点。帧耗时进入
 * 60 帧环形缓冲,按固定间隔批量 flush 到 state(避免每帧都触发渲染)。
 *
 * @module topics/performance/lab/useFrameStats
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/** 环形缓冲长度:展示最近 60 帧 */
const FRAME_BUFFER_SIZE = 60;

export interface FrameStats {
    /** 最近 60 帧的耗时(毫秒),新帧在末尾 */
    frames: readonly number[];
    /** 最近一次「输入 → 下一帧」的延迟(毫秒);未打点过为 null */
    inputLag: number | null;
    /** 在输入事件处理器里调用,记录打点时间 */
    markInput: () => void;
}

/**
 * 采样帧耗时与输入延迟。
 *
 * @param flushInterval 批量写入 state 的间隔(毫秒),默认 250
 *
 * @example
 * const { frames, inputLag, markInput } = useFrameStats();
 * <input onChange={(e) => { markInput(); setKeyword(e.target.value); }} />
 * <FrameMeter frames={frames} inputLag={inputLag} />
 */
export function useFrameStats(flushInterval = 250): FrameStats {
    const [frames, setFrames] = useState<readonly number[]>([]);
    const [inputLag, setInputLag] = useState<number | null>(null);

    // 采样数据走 ref:每帧都写 state 会让测量本身成为性能负担
    const bufferRef = useRef<number[]>([]);
    const pendingInputRef = useRef<number | null>(null);
    const lagRef = useRef<number | null>(null);

    useEffect(() => {
        let last = performance.now();
        let rafId = 0;

        const loop = (now: number) => {
            const duration = now - last;
            last = now;
            bufferRef.current = [...bufferRef.current.slice(-(FRAME_BUFFER_SIZE - 1)), duration];
            // 输入打点后的第一帧:间隔即本次输入延迟
            if (pendingInputRef.current !== null) {
                lagRef.current = now - pendingInputRef.current;
                pendingInputRef.current = null;
            }
            rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);

        const flush = setInterval(() => {
            setFrames(bufferRef.current);
            setInputLag(lagRef.current);
        }, flushInterval);

        return () => {
            cancelAnimationFrame(rafId);
            clearInterval(flush);
        };
    }, [flushInterval]);

    const markInput = useCallback(() => {
        pendingInputRef.current = performance.now();
    }, []);

    return { frames, inputLag, markInput };
}
