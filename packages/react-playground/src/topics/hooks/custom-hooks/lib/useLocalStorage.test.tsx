/**
 * useLocalStorage 契约测试:读写一致、函数式更新、损坏数据兜底
 * @module topics/hooks/custom-hooks/lib/useLocalStorage.test
 */

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

const KEY = 'useLocalStorage-test';

describe('useLocalStorage', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('无缓存时返回初始值', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('setValue 同步更新 state 与 localStorage', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, ''));

        act(() => result.current[1]('hello'));

        expect(result.current[0]).toBe('hello');
        expect(window.localStorage.getItem(KEY)).toBe(JSON.stringify('hello'));
    });

    it('支持函数式更新,且持久化的是更新后的值', () => {
        const { result } = renderHook(() => useLocalStorage(KEY, 1));

        act(() => result.current[1]((prev) => prev + 1));
        act(() => result.current[1]((prev) => prev + 1));

        expect(result.current[0]).toBe(3);
        expect(window.localStorage.getItem(KEY)).toBe('3');
    });

    it('新 Hook 实例能读到已持久化的值(模拟刷新)', () => {
        window.localStorage.setItem(KEY, JSON.stringify({ name: '已保存' }));

        const { result } = renderHook(() => useLocalStorage(KEY, { name: '初始' }));
        expect(result.current[0]).toEqual({ name: '已保存' });
    });

    it('缓存 JSON 损坏时兜底为初始值', () => {
        window.localStorage.setItem(KEY, '{不是合法JSON');

        const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));
        expect(result.current[0]).toBe('fallback');
    });

    it('setValue 引用跨渲染稳定', () => {
        const { result, rerender } = renderHook(() => useLocalStorage(KEY, 0));
        const setterBefore = result.current[1];

        act(() => result.current[1](1));
        rerender();

        expect(result.current[1]).toBe(setterBefore);
    });
});
