/**
 * ============================================================================
 * AsyncStatusDemo.tsx — 异步数据四态渲染演示
 * ============================================================================
 *
 * 模拟一次随机结果的请求(成功 / 空数据 / 失败),用判别联合
 * (discriminated union)状态机驱动 idle / loading / error / success
 * 四种界面的渲染,杜绝 isLoading && !isError && ... 的布尔 flag 地狱。
 *
 * @module topics/basics/jsx-render/components/AsyncStatusDemo
 */

import { memo, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';

interface Article {
    id: number;
    title: string;
}

/** 判别联合:status 字段穷举所有渲染分支,互斥且完备 */
type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: Article[] };

const MOCK_ARTICLES: Article[] = [
    { id: 1, title: 'React 19 渲染机制速览' },
    { id: 2, title: '从 JSX 到真实 DOM 发生了什么' },
    { id: 3, title: '判别联合:组织异步 UI 的利器' },
];

/** loading 骨架:纯 Tailwind animate-pulse 灰块,占位避免布局跳动 */
const Skeleton = memo(() => (
    <div className="space-y-2" aria-label="加载中">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className="h-8 animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700"
                style={{ width: `${88 - i * 12}%` }}
            />
        ))}
    </div>
));

Skeleton.displayName = 'Skeleton';

/**
 * 模拟一次接口请求:800ms 后随机返回成功 / 空数据 / 失败
 *
 * @param onSettled - 请求结束时回调最终结果
 * @returns 定时器句柄,供卸载时清理
 * @example
 * const timer = mockFetch((next) => setState(next));
 */
const mockFetch = (onSettled: (next: FetchState) => void): ReturnType<typeof setTimeout> =>
    setTimeout(() => {
        const r = Math.random();
        if (r < 0.3) {
            onSettled({ status: 'error', message: '请求超时,请检查网络后重试' });
        } else if (r < 0.55) {
            onSettled({ status: 'success', data: [] });
        } else {
            onSettled({ status: 'success', data: MOCK_ARTICLES });
        }
    }, 800);

export const AsyncStatusDemo = memo(() => {
    const [state, setState] = useState<FetchState>({ status: 'idle' });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 卸载时清掉在途定时器,避免写已卸载组件的 state
    useEffect(
        () => () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        },
        [],
    );

    const load = () => {
        setState({ status: 'loading' });
        timerRef.current = mockFetch(setState);
    };

    // 渲染完全由 status 驱动:每个分支互斥,不存在 flag 排列组合
    let body;
    switch (state.status) {
        case 'idle':
            body = (
                <p className="py-4 text-center text-sm text-gray-400 dark:text-slate-500">
                    点击「发起请求」加载文章列表
                </p>
            );
            break;
        case 'loading':
            body = <Skeleton />;
            break;
        case 'error':
            body = (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
                    <Button size="small" danger className="mt-3" onClick={load}>
                        重试
                    </Button>
                </div>
            );
            break;
        case 'success':
            body =
                state.data.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400 dark:text-slate-500">
                        暂无数据 —— empty 也是一等公民,值得一个专门的界面
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {state.data.map((article) => (
                            <li
                                key={article.id}
                                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                            >
                                {article.title}
                            </li>
                        ))}
                    </ul>
                );
            break;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Button
                    type="primary"
                    onClick={load}
                    loading={state.status === 'loading'}
                >
                    {state.status === 'idle' ? '发起请求' : '重新请求(随机结果)'}
                </Button>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    结果随机:约 45% 成功 / 25% 空数据 / 30% 失败,多点几次看全四种状态
                </span>
            </div>
            {body}
        </div>
    );
});

AsyncStatusDemo.displayName = 'AsyncStatusDemo';
