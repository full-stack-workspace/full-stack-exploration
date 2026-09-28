/**
 * ============================================================================
 * hooks.ts — 看板从 class 实例上拆下来的两块同步关系
 * ============================================================================
 *
 * 时钟与报价互不相关,不该挤在同一个 componentDidMount。
 * 函数组件把它们变成可以单独测试、单独复用的 Hook。
 *
 * @module topics/basics/fn-vs-class/practice/hooks
 */

import { useEffect, useState } from 'react';

import { fetchQuote, type Quote } from './quotes';

/**
 * 按间隔把「现在」同步到 UI。delay 变化会拆掉旧 interval。
 */
export function useClock(delayMs: number): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), delayMs);
        return () => window.clearInterval(id);
    }, [delayMs]);

    return now;
}

export type QuoteStatus = 'idle' | 'loading' | 'ready';

/**
 * 选定品种后拉报价;换 id 或卸载时 abort,避免后发先至。
 */
export function useQuote(symbolId: string | null): { quote: Quote | null; status: QuoteStatus } {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [status, setStatus] = useState<QuoteStatus>('idle');

    useEffect(() => {
        if (symbolId === null) {
            setQuote(null);
            setStatus('idle');
            return;
        }

        const controller = new AbortController();
        setStatus('loading');

        fetchQuote(symbolId, controller.signal)
            .then((next) => {
                setQuote(next);
                setStatus('ready');
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                throw error;
            });

        return () => controller.abort();
    }, [symbolId]);

    return { quote, status };
}
