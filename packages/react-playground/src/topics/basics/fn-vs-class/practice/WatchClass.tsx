/**
 * ============================================================================
 * WatchClass.tsx — 行情看板的 class 实现
 * ============================================================================
 *
 * 时钟、请求、过滤、选中全部挂在同一个实例上。能跑,但无法把「报价」
 * 单独测、也无法在别的页面复用时钟而不拷贝 didMount。
 *
 * @module topics/basics/fn-vs-class/practice/WatchClass
 */

import { Component } from 'react';

import { Input } from '../../../../components/Input';
import { fetchQuote, filterSymbols, pickSelectedId, SYMBOLS, type Quote } from './quotes';

interface WatchClassState {
    query: string;
    selectedId: string;
    now: number;
    quote: Quote | null;
    loading: boolean;
}

export class WatchClass extends Component<object, WatchClassState> {
    static displayName = 'WatchClass';

    private clockId: number | null = null;
    private fetchController: AbortController | null = null;

    state: WatchClassState = {
        query: '',
        selectedId: SYMBOLS[0].id,
        now: Date.now(),
        quote: null,
        loading: false,
    };

    componentDidMount() {
        this.clockId = window.setInterval(() => {
            this.setState({ now: Date.now() });
        }, 1000);
        this.loadQuote(this.state.selectedId);
    }

    componentDidUpdate(_prevProps: object, prevState: WatchClassState) {
        const prevId = pickSelectedId(filterSymbols(prevState.query), prevState.selectedId);
        const nextId = pickSelectedId(filterSymbols(this.state.query), this.state.selectedId);
        if (nextId !== null && nextId !== prevId) {
            this.loadQuote(nextId);
        }
    }

    componentWillUnmount() {
        if (this.clockId !== null) {
            window.clearInterval(this.clockId);
        }
        this.fetchController?.abort();
    }

    loadQuote(symbolId: string) {
        this.fetchController?.abort();
        const controller = new AbortController();
        this.fetchController = controller;
        this.setState({ loading: true });

        fetchQuote(symbolId, controller.signal)
            .then((quote) => {
                this.setState({ quote, loading: false });
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                throw error;
            });
    }

    render() {
        const { query, selectedId, now, quote, loading } = this.state;
        const visible = filterSymbols(query);
        const effectiveId = pickSelectedId(visible, selectedId);
        const selected = visible.find((item) => item.id === effectiveId) ?? null;

        return (
            <div className="space-y-3">
                <Input
                    aria-label="class 过滤代码"
                    placeholder="过滤代码 / 名称"
                    value={query}
                    onChange={(event) => this.setState({ query: event.target.value })}
                />
                <p className="font-mono text-[11px] text-gray-400" aria-label="class 时钟">
                    时钟 {new Date(now).toLocaleTimeString()}
                </p>
                <ul className="space-y-1">
                    {visible.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                aria-label={`class 品种 ${item.ticker}`}
                                onClick={() => this.setState({ selectedId: item.id })}
                                className={`w-full rounded-card border px-3 py-2 text-left text-sm ${
                                    selected?.id === item.id
                                        ? 'border-amber-500 bg-amber-50 font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                                        : 'border-gray-100 text-gray-600 dark:border-slate-800 dark:text-slate-300'
                                }`}
                            >
                                {item.ticker}
                                <span className="mt-0.5 block text-[11px] font-normal text-gray-400">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-gray-700 dark:text-slate-300" aria-label="class 报价">
                    {selected === null
                        ? '没有匹配品种'
                        : loading
                          ? `正在拉 ${selected.ticker}…`
                          : quote && quote.symbolId === selected.id
                            ? `${selected.ticker} · ${quote.price.toFixed(2)}`
                            : `${selected.ticker} · 尚无报价`}
                </p>
            </div>
        );
    }
}
