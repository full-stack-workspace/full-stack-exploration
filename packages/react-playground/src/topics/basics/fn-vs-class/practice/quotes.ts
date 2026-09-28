/**
 * ============================================================================
 * quotes.ts — 行情看板 mock
 * ============================================================================
 *
 * 品种列表是静态事实;报价是可取消的异步事实。class 和函数组件共用这份数据层。
 *
 * @module topics/basics/fn-vs-class/practice/quotes
 */

export interface SymbolItem {
    id: string;
    ticker: string;
    name: string;
}

export interface Quote {
    symbolId: string;
    price: number;
    asOf: number;
}

export const SYMBOLS: SymbolItem[] = [
    { id: 'aapl', ticker: 'AAPL', name: '苹果' },
    { id: 'tsla', ticker: 'TSLA', name: '特斯拉' },
    { id: 'rely', ticker: 'RELY', name: 'Relay 缓存' },
    { id: 'hook', ticker: 'HOOK', name: 'Hooks 运行时' },
];

/** 过滤在渲染期算,不另存一份列表 state */
export function filterSymbols(query: string): SymbolItem[] {
    const keyword = query.trim().toLowerCase();
    return SYMBOLS.filter((item) => {
        if (keyword === '') {
            return true;
        }
        return item.ticker.toLowerCase().includes(keyword) || item.name.includes(keyword);
    });
}

/** 当前选中若不在可见集里,回落到第一条 —— 仍是派生,不是 effect 同步 */
export function pickSelectedId(visible: SymbolItem[], selectedId: string): string | null {
    if (visible.some((item) => item.id === selectedId)) {
        return selectedId;
    }
    return visible[0]?.id ?? null;
}

const PRICE_SEED: Record<string, number> = {
    aapl: 191.2,
    tsla: 248.6,
    rely: 42.1,
    hook: 19,
};

/**
 * 模拟行情接口。signal 被 abort 时必须丢掉结果,避免 class didUpdate 竞态。
 */
export function fetchQuote(symbolId: string, signal: AbortSignal): Promise<Quote> {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
            const seed = PRICE_SEED[symbolId] ?? 10;
            resolve({
                symbolId,
                price: Math.round((seed + Math.random()) * 100) / 100,
                asOf: Date.now(),
            });
        }, 250);

        const onAbort = () => {
            window.clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        };

        if (signal.aborted) {
            onAbort();
            return;
        }
        signal.addEventListener('abort', onAbort, { once: true });
    });
}
