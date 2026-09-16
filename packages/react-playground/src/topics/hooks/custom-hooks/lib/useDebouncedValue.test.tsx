/**
 * useDebouncedValue 契约测试:静止 delay 后跟进,快速变化只落定最后一次
 * @module topics/hooks/custom-hooks/lib/useDebouncedValue.test
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('初始值立即返回,无需等待', () => {
        const { result } = renderHook(() => useDebouncedValue('init', 300));
        expect(result.current).toBe('init');
    });

    it('delay 内不更新,delay 后跟进最新值', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } },
        );

        rerender({ value: 'b' });
        act(() => vi.advanceTimersByTime(299));
        expect(result.current).toBe('a');

        act(() => vi.advanceTimersByTime(1));
        expect(result.current).toBe('b');
    });

    it('快速连续变化只落定最后一次', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } },
        );

        rerender({ value: 'b' });
        act(() => vi.advanceTimersByTime(100));
        rerender({ value: 'c' });
        act(() => vi.advanceTimersByTime(100));
        rerender({ value: 'd' });

        // 每次变化都重置计时:中途值永远不会出现
        act(() => vi.advanceTimersByTime(300));
        expect(result.current).toBe('d');
    });

    it('卸载后定时器被清理,不再更新', () => {
        const { result, rerender, unmount } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } },
        );

        rerender({ value: 'b' });
        unmount();
        act(() => vi.advanceTimersByTime(1000));
        expect(result.current).toBe('a');
    });
});
