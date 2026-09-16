/**
 * useInterval 契约测试:节拍正确、null 暂停、回调永远读最新闭包
 * @module topics/hooks/custom-hooks/lib/useInterval.test
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInterval } from './useInterval';

describe('useInterval', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('按 delay 间隔反复触发', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, 1000));

        act(() => vi.advanceTimersByTime(3000));
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('delay 为 null 时暂停', () => {
        const callback = vi.fn();
        renderHook(() => useInterval(callback, null));

        act(() => vi.advanceTimersByTime(5000));
        expect(callback).not.toHaveBeenCalled();
    });

    it('回调永远读最新闭包(回调 ref 模式)', () => {
        const { result, rerender } = renderHook(
            ({ step }) => {
                const spy = vi.fn();
                // 每次渲染都传新箭头函数;interval 不应重建,且永远调到最新闭包
                useInterval(() => spy(step), 1000);
                return spy;
            },
            { initialProps: { step: 1 } },
        );

        act(() => vi.advanceTimersByTime(1000));
        expect(result.current).toHaveBeenLastCalledWith(1);

        rerender({ step: 2 });
        act(() => vi.advanceTimersByTime(1000));
        // 关键断言:读到的是新 step,而不是首次渲染闭包里的 1
        expect(result.current).toHaveBeenLastCalledWith(2);
    });

    it('callback 变化不重置计时节拍', () => {
        const callback = vi.fn();
        const { rerender } = renderHook(
            ({ n }) => useInterval(() => callback(n), 1000),
            { initialProps: { n: 1 } },
        );

        // 走到 600ms 时换回调:若 effect 依赖 callback,节拍会被重置,400ms 后不会触发
        act(() => vi.advanceTimersByTime(600));
        rerender({ n: 2 });

        act(() => vi.advanceTimersByTime(400));
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(2);
    });

    it('卸载后不再触发', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useInterval(callback, 1000));

        unmount();
        act(() => vi.advanceTimersByTime(5000));
        expect(callback).not.toHaveBeenCalled();
    });
});
