/**
 * useFrameStats 契约测试:rAF 帧耗时采样与输入延迟打点
 * (jsdom 下手工 mock requestAnimationFrame + 假定时器控制 flush)
 * @module topics/performance/lab/useFrameStats.test
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useFrameStats } from './useFrameStats';

/** 可控 rAF mock:收集回调,step(now) 手动推进一帧 */
const installRafMock = () => {
    type RafCallback = (now: number) => void;
    let callback: RafCallback | null = null;
    window.requestAnimationFrame = ((cb: RafCallback) => {
        callback = cb;
        return 1;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = (() => {}) as typeof window.cancelAnimationFrame;

    return {
        /** 以指定时间戳推进一帧(回调会重新注册自己) */
        step(now: number) {
            const cb = callback;
            callback = null;
            cb?.(now);
        },
    };
};

const originalRaf = window.requestAnimationFrame;
const originalCancel = window.cancelAnimationFrame;

describe('useFrameStats', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        window.requestAnimationFrame = originalRaf;
        window.cancelAnimationFrame = originalCancel;
    });

    it('按帧记录耗时,flush 后写入 state', () => {
        const raf = installRafMock();
        const { result } = renderHook(() => useFrameStats(250));

        act(() => {
            raf.step(100);
            raf.step(116.7);
            raf.step(133.4);
        });
        // 未 flush 前 state 仍为空(采样走 ref)
        expect(result.current.frames).toHaveLength(0);

        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current.frames).toHaveLength(3);
        // 相邻帧差约 16.7ms
        expect(result.current.frames[1]).toBeCloseTo(16.7, 0);
    });

    it('markInput 后,下一帧记录输入延迟', () => {
        const raf = installRafMock();
        const { result } = renderHook(() => useFrameStats(250));

        act(() => {
            // markInput 内部用 performance.now() 打点,帧时间戳用同一时钟基准
            raf.step(performance.now());
            result.current.markInput();
            raf.step(performance.now() + 150);
        });
        act(() => {
            vi.advanceTimersByTime(250);
        });

        expect(result.current.inputLag).not.toBeNull();
        expect(result.current.inputLag!).toBeGreaterThan(0);
    });

    it('帧缓冲只保留最近 60 帧', () => {
        const raf = installRafMock();
        const { result } = renderHook(() => useFrameStats(250));

        act(() => {
            let now = 0;
            for (let i = 0; i < 80; i += 1) {
                now += 16.7;
                raf.step(now);
            }
            vi.advanceTimersByTime(250);
        });

        expect(result.current.frames).toHaveLength(60);
    });

    it('卸载后停止采样与 flush', () => {
        const raf = installRafMock();
        const { result, unmount } = renderHook(() => useFrameStats(250));

        unmount();
        act(() => {
            raf.step(100);
            vi.advanceTimersByTime(1000);
        });
        expect(result.current.frames).toHaveLength(0);
    });
});
