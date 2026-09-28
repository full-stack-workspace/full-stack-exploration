/**
 * ============================================================================
 * WatchFn.tsx — 同一份看板的函数组件实现
 * ============================================================================
 *
 * 过滤在渲染期派生;时钟与报价是两个 Hook。实例上不再堆字段。
 *
 * @module topics/basics/fn-vs-class/practice/WatchFn
 */

import { memo, useState } from 'react';

import { Input } from '../../../../components/Input';
import { useClock, useQuote } from './hooks';
import { filterSymbols, pickSelectedId, SYMBOLS } from './quotes';

export const WatchFn = memo(() => {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(SYMBOLS[0].id);
    const visible = filterSymbols(query);
    const effectiveId = pickSelectedId(visible, selectedId);
    const now = useClock(1000);
    const { quote, status } = useQuote(effectiveId);
    const selected = visible.find((item) => item.id === effectiveId) ?? null;

    return (
        <div className="space-y-3">
            <Input
                aria-label="函数 过滤代码"
                placeholder="过滤代码 / 名称"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />
            <p className="font-mono text-[11px] text-gray-400" aria-label="函数 时钟">
                时钟 {new Date(now).toLocaleTimeString()}
            </p>
            <ul className="space-y-1">
                {visible.map((item) => (
                    <li key={item.id}>
                        <button
                            type="button"
                            aria-label={`函数 品种 ${item.ticker}`}
                            onClick={() => setSelectedId(item.id)}
                            className={`w-full rounded-card border px-3 py-2 text-left text-sm ${
                                selected?.id === item.id
                                    ? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300'
                                    : 'border-gray-100 text-gray-600 dark:border-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {item.ticker}
                            <span className="mt-0.5 block text-[11px] font-normal text-gray-400">{item.name}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <p className="text-sm text-gray-700 dark:text-slate-300" aria-label="函数 报价">
                {selected === null
                    ? '没有匹配品种'
                    : status === 'loading'
                      ? `正在拉 ${selected.ticker}…`
                      : quote && quote.symbolId === selected.id
                        ? `${selected.ticker} · ${quote.price.toFixed(2)}`
                        : `${selected.ticker} · 尚无报价`}
            </p>
        </div>
    );
});

WatchFn.displayName = 'WatchFn';
