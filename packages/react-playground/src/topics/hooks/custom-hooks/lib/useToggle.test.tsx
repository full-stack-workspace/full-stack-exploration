/**
 * useToggle 契约测试:行为正确 + 操作函数引用稳定
 * @module topics/hooks/custom-hooks/lib/useToggle.test
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useToggle } from './useToggle';

describe('useToggle', () => {
    it('默认初始值为 false,可指定初始值', () => {
        const { result: defaultResult } = renderHook(() => useToggle());
        expect(defaultResult.current[0]).toBe(false);

        const { result: customResult } = renderHook(() => useToggle(true));
        expect(customResult.current[0]).toBe(true);
    });

    it('toggle / setTrue / setFalse 行为正确', () => {
        const { result } = renderHook(() => useToggle());

        act(() => result.current[1].toggle());
        expect(result.current[0]).toBe(true);

        act(() => result.current[1].toggle());
        expect(result.current[0]).toBe(false);

        act(() => result.current[1].setTrue());
        expect(result.current[0]).toBe(true);

        act(() => result.current[1].setFalse());
        expect(result.current[0]).toBe(false);
    });

    it('操作函数与 actions 对象引用跨渲染稳定', () => {
        const { result, rerender } = renderHook(() => useToggle());
        const actionsBefore = result.current[1];

        act(() => result.current[1].toggle());
        rerender();

        expect(result.current[1]).toBe(actionsBefore);
        expect(result.current[1].toggle).toBe(actionsBefore.toggle);
        expect(result.current[1].setTrue).toBe(actionsBefore.setTrue);
    });
});
