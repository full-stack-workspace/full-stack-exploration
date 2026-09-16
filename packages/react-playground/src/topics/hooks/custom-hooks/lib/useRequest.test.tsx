/**
 * useRequest 契约测试:loading 流转、竞态丢弃、取消、卸载安全
 * @module topics/hooks/custom-hooks/lib/useRequest.test
 */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRequest } from './useRequest';
import type { RequestContext, UseRequestEvent } from './useRequest';

/** 手动控制 settle 时机的 Promise,用于精确编排竞态 */
const createDeferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

describe('useRequest', () => {
    it('自动执行:loading → success 全链路,触发 onSuccess 与事件', async () => {
        const deferred = createDeferred<string>();
        const onSuccess = vi.fn();
        const events: UseRequestEvent[] = [];

        const { result } = renderHook(() =>
            useRequest(() => deferred.promise, {
                onSuccess,
                onEvent: (e) => events.push(e),
            }),
        );
        expect(result.current.loading).toBe(true);

        await act(async () => deferred.resolve('数据'));

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe('数据');
        expect(result.current.error).toBeUndefined();
        expect(onSuccess).toHaveBeenCalledWith('数据', []);
        expect(events.map((e) => e.type)).toEqual(['start', 'success']);
    });

    it('失败路径:error 落地,触发 onError,不污染 data', async () => {
        const deferred = createDeferred<string>();
        const onError = vi.fn();

        const { result } = renderHook(() =>
            useRequest(() => deferred.promise, { onError }),
        );

        await act(async () => deferred.reject(new Error('服务端 500')));

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect((result.current.error as Error).message).toBe('服务端 500');
        expect(onError).toHaveBeenCalledOnce();
    });

    it('竞态:旧请求后返回,结果被废弃(stale),state 以新请求为准', async () => {
        const deferredA = createDeferred<string>();
        const deferredB = createDeferred<string>();
        const events: UseRequestEvent[] = [];
        let call = 0;

        const { result } = renderHook(() =>
            useRequest(
                (_ctx: RequestContext, _keyword: string) =>
                    ++call === 1 ? deferredA.promise : deferredB.promise,
                { manual: true, onEvent: (e) => events.push(e) },
            ),
        );

        // 连续发起 A、B 两次请求
        act(() => result.current.run('a'));
        act(() => result.current.run('b'));

        // B 先返回 → 生效
        await act(async () => deferredB.resolve('B 的结果'));
        expect(result.current.data).toBe('B 的结果');

        // A 后返回 → 过期丢弃,state 不被覆盖
        await act(async () => deferredA.resolve('A 的结果'));
        expect(result.current.data).toBe('B 的结果');

        expect(events.map((e) => e.type)).toEqual(['start', 'start', 'success', 'stale']);
    });

    it('cancel:在途请求被中止,loading 复位', async () => {
        const events: UseRequestEvent[] = [];
        // 永不主动 settle、只在 abort 时 reject 的请求
        const neverEnding = ({ signal }: RequestContext) =>
            new Promise<string>((_, reject) => {
                signal.addEventListener('abort', () => reject(new Error('aborted')));
            });

        const { result } = renderHook(() =>
            useRequest(neverEnding, { manual: true, onEvent: (e) => events.push(e) }),
        );

        act(() => result.current.run());
        expect(result.current.loading).toBe(true);

        await act(async () => result.current.cancel());

        expect(result.current.loading).toBe(false);
        expect(events.map((e) => e.type)).toEqual(['start', 'cancel']);
    });

    it('refresh 复用上一次 run 的参数', async () => {
        const asyncFn = vi.fn((_ctx: RequestContext, keyword: string) =>
            Promise.resolve(`结果:${keyword}`),
        );
        const { result } = renderHook(() => useRequest(asyncFn, { manual: true }));

        await act(async () => result.current.run('react'));
        await act(async () => result.current.refresh());

        expect(asyncFn).toHaveBeenCalledTimes(2);
        expect(asyncFn).toHaveBeenLastCalledWith(expect.anything(), 'react');
    });

    it('卸载时自动 abort 在途请求', async () => {
        let capturedSignal: AbortSignal | null = null;
        const pending = ({ signal }: RequestContext) => {
            capturedSignal = signal;
            return new Promise<string>(() => {});
        };

        const { result, unmount } = renderHook(() => useRequest(pending, { manual: true }));
        act(() => result.current.run());

        unmount();
        expect(capturedSignal!.aborted).toBe(true);
    });
});
