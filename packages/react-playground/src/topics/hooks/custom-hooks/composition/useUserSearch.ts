/**
 * ============================================================================
 * useUserSearch.ts — 用户搜索领域 Hook(分层组合范本)
 * ============================================================================
 *
 * 教学定位:演示「原子 Hooks → 领域 Hook」的组合设计 ——
 * useState(输入框状态) + useDebouncedValue(请求节流)
 * + useRequest(请求生命周期)三者各管一段,组合出一个
 * 面向业务的搜索 Hook;UI 组件只消费它,不感知任何实现细节。
 *
 * @module topics/hooks/custom-hooks/composition/useUserSearch
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebouncedValue, useRequest } from '../lib';
import type { UseRequestEvent } from '../lib';
import { searchUsers } from './mockUserApi';
import type { User } from './mockUserApi';

/** 请求生命周期日志条目(供日志面板展示竞态废弃过程) */
export interface SearchLogEntry {
    /** 日志序号,从 1 开始 */
    seq: number;
    /** 事件类型:start 发起 / stale 废弃(竞态)/ cancel 取消 / success 成功 / error 失败 */
    type: UseRequestEvent['type'];
    /** useRequest 内部的请求序号 */
    requestId: number;
    /** 发起该请求时的关键字 */
    keyword: string;
    /** 仅 error 事件携带 */
    message?: string;
}

export interface UseUserSearchResult {
    keyword: string;
    setKeyword: (keyword: string) => void;
    /** 防抖后的关键字(实际触发请求的那个) */
    debouncedKeyword: string;
    users: User[] | undefined;
    loading: boolean;
    error: unknown;
    /** 用上一次关键字重新请求(失败重试) */
    retry: () => void;
    /** 请求生命周期日志(最多保留 50 条) */
    logs: readonly SearchLogEntry[];
}

/**
 * 用户搜索领域 Hook。
 *
 * 状态归属决策:
 * - keyword 留在 Hook 内(输入框草稿,跟随搜索语义);
 * - users/loading/error 由 useRequest 托管;
 * - 日志属于「可观测性」,同样内聚在这里,UI 只负责渲染。
 *
 * @example
 * const { keyword, setKeyword, users, loading } = useUserSearch();
 */
export function useUserSearch(): UseUserSearchResult {
    /* ---- 第一层:输入框原始状态(每次击键都变) ---- */
    const [keyword, setKeyword] = useState('');

    /* ---- 第二层:防抖,把击键流折叠成请求信号 ---- */
    const debouncedKeyword = useDebouncedValue(keyword, 400);

    /* ---- 日志:可观测性内聚在领域 Hook 内 ---- */
    const [logs, setLogs] = useState<readonly SearchLogEntry[]>([]);
    const logSeqRef = useRef(0);
    // 发起请求时的关键字,供日志条目回溯
    const requestedKeywordRef = useRef(debouncedKeyword);

    const appendLog = useCallback((event: UseRequestEvent) => {
        const entry: SearchLogEntry = {
            seq: ++logSeqRef.current,
            type: event.type,
            requestId: event.requestId,
            keyword: requestedKeywordRef.current,
            message: event.type === 'error' ? event.message : undefined,
        };
        setLogs((prev) => [...prev.slice(-49), entry]);
    }, []);

    /* ---- 第三层:请求生命周期(竞态 / 取消 / 错误全托管) ---- */
    const { data, loading, error, run, refresh } = useRequest(
        ({ signal }, nextKeyword: string) => searchUsers(nextKeyword, { signal }),
        { manual: true, onEvent: appendLog },
    );

    // 组合点:防抖值变化 → 发起新请求。快速输入时旧请求被 useRequest
    // 自动 abort + 标 stale,日志面板可看到废弃过程
    useEffect(() => {
        requestedKeywordRef.current = debouncedKeyword;
        run(debouncedKeyword);
    }, [debouncedKeyword, run]);

    return {
        keyword,
        setKeyword,
        debouncedKeyword,
        users: data,
        loading,
        error,
        retry: refresh,
        logs,
    };
}
