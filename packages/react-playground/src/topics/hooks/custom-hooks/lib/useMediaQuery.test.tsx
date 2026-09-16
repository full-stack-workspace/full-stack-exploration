/**
 * useMediaQuery 契约测试:初始读取 + change 事件驱动更新
 * (matchMedia 为「React 之外的可变数据源」,由 useSyncExternalStore 订阅)
 * @module topics/hooks/custom-hooks/lib/useMediaQuery.test
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMediaQuery } from './useMediaQuery';

/** 可控的 matchMedia mock:记录每个 query 的 matches 与 change 监听器 */
const installMatchMediaMock = (initialMatches: boolean) => {
    const listeners = new Set<() => void>();
    const mql = {
        matches: initialMatches,
        media: '',
        addEventListener: vi.fn((_type: string, listener: () => void) => {
            listeners.add(listener);
        }),
        removeEventListener: vi.fn((_type: string, listener: () => void) => {
            listeners.delete(listener);
        }),
    };
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

    return {
        /** 模拟媒体查询结果翻转,并广播 change */
        flip(nextMatches: boolean) {
            mql.matches = nextMatches;
            for (const listener of [...listeners]) {
                listener();
            }
        },
        listenerCount: () => listeners.size,
    };
};

const originalMatchMedia = window.matchMedia;

describe('useMediaQuery', () => {
    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('初始返回当前匹配结果', () => {
        installMatchMediaMock(true);
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(true);
    });

    it('change 事件到达时更新匹配结果', () => {
        const mock = installMatchMediaMock(false);
        const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
        expect(result.current).toBe(false);

        act(() => mock.flip(true));
        expect(result.current).toBe(true);

        act(() => mock.flip(false));
        expect(result.current).toBe(false);
    });

    it('卸载时退订 change 监听', () => {
        const mock = installMatchMediaMock(false);
        const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

        expect(mock.listenerCount()).toBe(1);
        unmount();
        expect(mock.listenerCount()).toBe(0);
    });
});
