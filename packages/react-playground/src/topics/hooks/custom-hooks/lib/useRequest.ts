/**
 * ============================================================================
 * useRequest.ts — 生产级异步请求 Hook
 * ============================================================================
 *
 * 教学定位:组合实战的基石,演示异步 Hook 的三大生产要点:
 * 1. 竞态处理 —— 请求序号 + AbortController 双保险,过期结果直接丢弃;
 * 2. 卸载安全 —— 组件卸载时自动 abort 在途请求;
 * 3. 回调 ref —— asyncFn / onSuccess / onError / onEvent 全部走 ref,
 *    调用方传内联函数也不会引发重复请求。
 *
 * @module topics/hooks/custom-hooks/lib/useRequest
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 传给 asyncFn 的上下文:本次请求的取消信号 */
export interface RequestContext {
    signal: AbortSignal;
}

/** 请求生命周期事件,供日志面板 / 监控埋点使用 */
export type UseRequestEvent =
    | { type: 'start'; requestId: number }
    | { type: 'stale'; requestId: number }
    | { type: 'cancel'; requestId: number }
    | { type: 'success'; requestId: number }
    | { type: 'error'; requestId: number; message: string };

export interface UseRequestOptions<TData, TParams extends unknown[]> {
    /** 为 true 时不自动执行,等待手动 run;默认 false */
    manual?: boolean;
    /** 自动执行时使用的参数 */
    defaultParams?: TParams;
    /** 这些依赖变化时,以 defaultParams 自动重跑(类似 useEffect 依赖) */
    refreshDeps?: readonly unknown[];
    onSuccess?: (data: TData, params: TParams) => void;
    onError?: (error: unknown, params: TParams) => void;
    /** 生命周期事件回调(start / stale / cancel / success / error) */
    onEvent?: (event: UseRequestEvent) => void;
}

export interface UseRequestResult<TData, TParams extends unknown[]> {
    data: TData | undefined;
    loading: boolean;
    /** 最近一次失败的错误(未知类型,由调用方收窄) */
    error: unknown;
    /** 手动发起请求;会自动取消并废弃上一次在途请求 */
    run: (...params: TParams) => void;
    /** 用上一次 run 的参数重新发起 */
    refresh: () => void;
    /** 取消当前在途请求 */
    cancel: () => void;
}

/** 从 unknown 错误中提取可读信息 */
const toMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

/* =================================================================
 * useRequest
 * ================================================================ */

/**
 * 管理一次异步请求的完整生命周期。
 *
 * @param asyncFn 请求函数,第一个参数为 { signal },其后为 run 传入的业务参数
 * @param options 见 UseRequestOptions
 * @returns { data, loading, error, run, refresh, cancel }
 *
 * @example
 * const { data, loading, run } = useRequest(
 *     ({ signal }, keyword: string) => searchUsers(keyword, { signal }),
 *     { manual: true },
 * );
 */
export function useRequest<TData, TParams extends unknown[] = []>(
    asyncFn: (ctx: RequestContext, ...params: TParams) => Promise<TData>,
    options: UseRequestOptions<TData, TParams> = {},
): UseRequestResult<TData, TParams> {
    const {
        manual = false,
        defaultParams,
        refreshDeps = [],
        onSuccess,
        onError,
        onEvent,
    } = options;

    const [data, setData] = useState<TData | undefined>(undefined);
    const [error, setError] = useState<unknown>(undefined);
    const [loading, setLoading] = useState(!manual);

    /* ---- 回调 ref:调用方传内联函数也不会让 run 的引用变化 ---- */
    const asyncFnRef = useRef(asyncFn);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        asyncFnRef.current = asyncFn;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onEventRef.current = onEvent;
    });

    /* ---- 竞态基础设施:请求序号 + 在途 AbortController ---- */
    const requestSeqRef = useRef(0);
    const abortRef = useRef<AbortController | null>(null);
    const lastParamsRef = useRef<TParams | null>(defaultParams ?? null);

    const emit = useCallback((event: UseRequestEvent) => {
        onEventRef.current?.(event);
    }, []);

    const run = useCallback(
        (...params: TParams) => {
            // 序号单调递增:只有最新一次请求有权写 state
            const requestId = ++requestSeqRef.current;
            lastParamsRef.current = params;

            // 取消上一次在途请求(双保险之一:让对方 promise 尽快 reject)
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            emit({ type: 'start', requestId });
            setLoading(true);
            setError(undefined);

            asyncFnRef
                .current({ signal: controller.signal }, ...params)
                .then((nextData) => {
                    // 双保险之二:即使对方忽略 signal 正常返回,过期结果也丢弃
                    if (requestId !== requestSeqRef.current) {
                        emit({ type: 'stale', requestId });
                        return;
                    }
                    setData(nextData);
                    setLoading(false);
                    emit({ type: 'success', requestId });
                    onSuccessRef.current?.(nextData, params);
                })
                .catch((requestError: unknown) => {
                    if (requestId !== requestSeqRef.current) {
                        emit({ type: 'stale', requestId });
                        return;
                    }
                    setLoading(false);
                    if (controller.signal.aborted) {
                        emit({ type: 'cancel', requestId });
                        return;
                    }
                    setError(requestError);
                    emit({ type: 'error', requestId, message: toMessage(requestError) });
                    onErrorRef.current?.(requestError, params);
                });
        },
        [emit],
    );

    const refresh = useCallback(() => {
        const params = lastParamsRef.current;
        if (params) {
            run(...params);
        }
    }, [run]);

    const cancel = useCallback(() => {
        abortRef.current?.abort();
    }, []);

    /* ---- 自动执行与依赖重跑 ---- */
    useEffect(() => {
        if (!manual) {
            run(...((defaultParams ?? []) as TParams));
        }
        // refreshDeps / defaultParams 由调用方声明(语义等同 useEffect 依赖),
        // 是用户控制的数组,无法静态分析;本包 eslint 的 react-hooks 规则仅作用于 .tsx,
        // .ts 文件不触发 exhaustive-deps,故无需豁免注释
    }, [run, manual, ...refreshDeps]);

    /* ---- 卸载安全:取消在途请求,避免无意义的回调与写状态 ---- */
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    return { data, loading, error, run, refresh, cancel };
}
