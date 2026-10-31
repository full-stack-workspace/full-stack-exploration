/**
 * ============================================================================
 * 组合式函数契约测试 — lib.test.ts
 * ============================================================================
 *
 * 校验原子 composable 的行为契约:返回值形状、边界钳制、防抖时序、
 * 持久化与容错、定时器启停与卸载清理。改实现不改契约时,测试不应变。
 *
 * @module composables/lib.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useCounter, useDebouncedRef, useInterval, useLocalStorage, useToggle } from '@/composables/lib';
import { withSetup } from '@/test/utils';

describe('useToggle', () => {
    it('初始值、toggle 翻转、set 直写', () => {
        const { result, unmount } = withSetup(() => useToggle());
        const [state, toggle, set] = result;
        expect(state.value).toBe(false);
        toggle();
        expect(state.value).toBe(true);
        set(false);
        expect(state.value).toBe(false);
        unmount();
    });
});

describe('useCounter', () => {
    it('inc/dec/reset 与 min/max 钳制', () => {
        const { result, unmount } = withSetup(() => useCounter(0, { min: 0, max: 2 }));
        result.inc();
        result.inc();
        result.inc();
        expect(result.count.value).toBe(2);
        result.dec(5);
        expect(result.count.value).toBe(0);
        result.set(99);
        expect(result.count.value).toBe(2);
        result.reset();
        expect(result.count.value).toBe(0);
        unmount();
    });
});

describe('useDebouncedRef', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('源变化延迟同步;高频变化只取最终值', async () => {
        const source = ref('a');
        const { result, unmount } = withSetup(() => useDebouncedRef(source, 300));
        expect(result.value).toBe('a');

        source.value = 'ab';
        source.value = 'abc';
        await nextTick();
        // 未到 300ms:不同步
        expect(result.value).toBe('a');
        await vi.advanceTimersByTimeAsync(300);
        expect(result.value).toBe('abc');
        unmount();
    });
});

describe('useLocalStorage', () => {
    it('写入即持久化;损坏的存储回退默认值', async () => {
        localStorage.setItem('bad-key', '{not-json');
        const { result: bad, unmount: u1 } = withSetup(() => useLocalStorage('bad-key', 'fallback'));
        expect(bad.value).toBe('fallback');
        u1();

        const { result, unmount } = withSetup(() => useLocalStorage('good-key', 'init'));
        result.value = 'changed';
        await nextTick();
        expect(JSON.parse(localStorage.getItem('good-key')!)).toBe('changed');
        unmount();
    });
});

describe('useInterval', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('按间隔计数;pause 停表;卸载自动清理', async () => {
        const cb = vi.fn();
        const { result, unmount } = withSetup(() => useInterval(cb, 100));
        await vi.advanceTimersByTimeAsync(350);
        expect(result.counter.value).toBe(3);
        expect(cb).toHaveBeenCalledTimes(3);

        result.pause();
        await vi.advanceTimersByTimeAsync(300);
        expect(result.counter.value).toBe(3);

        unmount();
        result.resume();
        await vi.advanceTimersByTimeAsync(300);
        // 卸载后 resume 不应再触发
        expect(result.counter.value).toBe(3);
    });
});
