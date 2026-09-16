/**
 * useEventListener 契约测试:监听生效、handler 走最新、退订成对
 * @module topics/hooks/custom-hooks/lib/useEventListener.test
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
    it('window 目标:事件触发时调用 handler', () => {
        const handler = vi.fn();
        renderHook(() => useEventListener(window, 'resize', handler));

        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('handler 每次渲染都换引用,也永远调用最新版本', () => {
        const handler = vi.fn();
        const { rerender } = renderHook(
            ({ n }) => useEventListener(window, 'keydown', () => handler(n)),
            { initialProps: { n: 1 } },
        );

        rerender({ n: 2 });
        act(() => {
            window.dispatchEvent(new Event('keydown'));
        });
        expect(handler).toHaveBeenLastCalledWith(2);
    });

    it('卸载时退订,之后事件不再触发', () => {
        const handler = vi.fn();
        const { unmount } = renderHook(() => useEventListener(window, 'resize', handler));

        unmount();
        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(handler).not.toHaveBeenCalled();
    });

    it('支持元素 ref 目标', () => {
        const handler = vi.fn();
        const element = document.createElement('button');
        document.body.appendChild(element);

        renderHook(() => {
            const ref = { current: element };
            useEventListener(ref, 'click', handler);
        });

        act(() => {
            element.dispatchEvent(new Event('click'));
        });
        expect(handler).toHaveBeenCalledTimes(1);

        document.body.removeChild(element);
    });

    it('target 为 null 时不挂监听也不报错', () => {
        const handler = vi.fn();
        renderHook(() => useEventListener(null, 'resize', handler));

        act(() => {
            window.dispatchEvent(new Event('resize'));
        });
        expect(handler).not.toHaveBeenCalled();
    });
});
