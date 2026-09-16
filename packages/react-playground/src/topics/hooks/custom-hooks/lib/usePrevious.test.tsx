/**
 * usePrevious 契约测试:首次为 undefined,之后永远返回上一次的值
 * @module topics/hooks/custom-hooks/lib/usePrevious.test
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
    it('首次渲染返回 undefined', () => {
        const { result } = renderHook(() => usePrevious(1));
        expect(result.current).toBeUndefined();
    });

    it('值变化后返回上一次的值', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 1 },
        });

        rerender({ value: 2 });
        expect(result.current).toBe(1);

        rerender({ value: 3 });
        expect(result.current).toBe(2);
    });

    it('值未变化时持续返回当前值', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 'a' },
        });

        rerender({ value: 'a' });
        expect(result.current).toBe('a');
    });
});
