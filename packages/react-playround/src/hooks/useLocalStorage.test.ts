/**
 * @file useLocalStorage.test.ts
 *
 * @description useLocalStorage Hook 单元测试
 * 验证初始读取、同步写入、异常降级等核心行为。
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

const TEST_KEY = 'test-key';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('无存储数据时返回 fallback', () => {
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));
        expect(result.current[0]).toBe('default');
    });

    it('已有存储数据时读取并解析', () => {
        localStorage.setItem(TEST_KEY, JSON.stringify('stored-value'));
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'default'));
        expect(result.current[0]).toBe('stored-value');
    });

    it('调用 setter 后自动写入 localStorage', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'initial'));

        act(() => {
            result.current[1]('updated');
        });

        expect(result.current[0]).toBe('updated');
        expect(setItemSpy).toHaveBeenCalledWith(TEST_KEY, JSON.stringify('updated'));
    });

    it('localStorage.getItem 抛错时降级到 fallback', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('getItem error');
        });
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 'fallback'));
        expect(result.current[0]).toBe('fallback');
    });

    it('localStorage.setItem 抛错时静默处理，状态仍正常更新', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });
        const { result } = renderHook(() => useLocalStorage(TEST_KEY, 0));

        // 不应抛出，组件状态正常更新
        expect(() => {
            act(() => {
                result.current[1](42);
            });
        }).not.toThrow();
        expect(result.current[0]).toBe(42);
    });
});
