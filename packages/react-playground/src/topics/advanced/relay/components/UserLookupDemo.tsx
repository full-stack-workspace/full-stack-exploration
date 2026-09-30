/**
 * ============================================================================
 * UserLookupDemo.tsx — 交互实验:变量查询与 store 缓存
 * ============================================================================
 *
 * 点击按钮切换查询变量 id,触发 user(id: $id) 变量查询:
 * - 首次查询:走 mock 网络(300ms 延迟),Suspense 显示骨架屏
 * - 切回已查过的用户:Relay store 缓存命中,立即渲染、不再请求、不闪骨架
 *
 * 这就是 Relay 默认 fetchPolicy(store-or-network)的直观对照:
 * 「要不要发请求」由归一化缓存里有没有这份数据决定,而不是组件自己判断。
 *
 * @module topics/advanced/relay/components/UserLookupDemo
 */

import { memo, Suspense, useCallback, useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { UserLookupDemoQuery } from '../../../../__generated__/UserLookupDemoQuery.graphql';

/** 可选的查询对象:两个真实用户 + 一个不存在的 id(演示空态) */
const LOOKUP_TARGETS = [
    { id: '1', label: '查 Alice' },
    { id: '2', label: '查 Bob' },
    { id: '404', label: '查不存在的用户' },
];

/* =================================================================
 * 查询结果:变量变化触发新查询;缓存命中时同步渲染
 * ================================================================ */

interface LookupResultProps {
    /** 当前查询的用户 id(作为查询变量下发) */
    userId: string;
    /** 数据落地(含空态)后回调,用于记录「该变量已入 store」 */
    onLoaded: (id: string) => void;
}

const LookupResult = memo(({ userId, onLoaded }: LookupResultProps) => {
    const data = useLazyLoadQuery<UserLookupDemoQuery>(
        graphql`
            query UserLookupDemoQuery($id: ID!) {
                user(id: $id) {
                    id
                    name
                    email
                    avatar
                }
            }
        `,
        { id: userId },
    );

    // 渲染成功即代表数据已写入 store,此后同变量查询必然缓存命中
    useEffect(() => {
        onLoaded(userId);
    }, [userId, onLoaded]);

    if (!data.user) {
        return (
            <p className="text-sm text-gray-500 dark:text-slate-400">
                查询结果:null —— id={userId} 的用户不存在(schema 中 user 字段可空,空态由组件自己决定怎么画)
            </p>
        );
    }

    return (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-gray-400 dark:text-slate-500">name</dt>
            <dd className="font-medium text-gray-800 dark:text-slate-200">{data.user.name}</dd>
            <dt className="text-gray-400 dark:text-slate-500">email</dt>
            <dd className="text-gray-600 dark:text-slate-300">{data.user.email}</dd>
            <dt className="text-gray-400 dark:text-slate-500">avatar</dt>
            <dd className="text-gray-600 dark:text-slate-300">{data.user.avatar ?? 'null'}</dd>
        </dl>
    );
});

LookupResult.displayName = 'LookupResult';

/* =================================================================
 * 实验主体:按钮切换变量 + 缓存命中标记
 * ================================================================ */

export const UserLookupDemo = memo(() => {
    const [selectedId, setSelectedId] = useState('1');
    // 已写入 store 的变量集合(数据真正落地后才记录)
    const [visitedIds, setVisitedIds] = useState<ReadonlySet<string>>(() => new Set());
    // 最近一次点击的取数方式:首屏默认走网络
    const [lastFetch, setLastFetch] = useState<'network' | 'cache'>('network');

    // 数据落地回调:组件渲染成功 = store 里已有这份数据
    const handleLoaded = useCallback((id: string) => {
        setVisitedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
    }, []);

    const select = (id: string) => {
        // 点击瞬间判定:store 里已有该变量的数据 → 本次将缓存命中
        setLastFetch(visitedIds.has(id) ? 'cache' : 'network');
        setSelectedId(id);
    };

    return (
        <div data-testid="relay-user-lookup" className="grid gap-6 lg:grid-cols-[200px_1fr]">
            {/* 查询变量切换 */}
            <div className="space-y-2">
                {LOOKUP_TARGETS.map((target) => (
                    <button
                        key={target.id}
                        type="button"
                        onClick={() => select(target.id)}
                        className={`w-full rounded-card border px-3 py-2 text-left text-sm transition-colors ${
                            target.id === selectedId
                                ? 'border-primary-500 bg-primary-50 font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                : 'border-gray-100 text-gray-600 hover:border-primary-300 dark:border-slate-800 dark:text-slate-300'
                        }`}
                    >
                        {target.label}
                        {visitedIds.has(target.id) && (
                            <span className="ml-1 text-[11px] text-gray-400 dark:text-slate-500">(已缓存)</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                    当前变量 <code className="rounded bg-gray-100 px-1 dark:bg-slate-800">id: &quot;{selectedId}&quot;</code>
                    {' —— '}
                    {lastFetch === 'cache' ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            缓存命中:数据已在 store,不发起请求
                        </span>
                    ) : (
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                            首次查询:走网络,Suspense 骨架屏接管
                        </span>
                    )}
                </p>
                {/* key={selectedId}:换变量时挂新实例,Suspense 只兜「未命中缓存」的情况 */}
                <Suspense
                    fallback={
                        <div data-testid="lookup-skeleton" className="space-y-2">
                            <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                            <div className="h-4 w-56 animate-pulse rounded bg-gray-200 dark:bg-slate-700" />
                        </div>
                    }
                >
                    <LookupResult key={selectedId} userId={selectedId} onLoaded={handleLoaded} />
                </Suspense>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    玩法:先点「查 Bob」观察骨架屏 → 再点回「查 Alice」—— 没有骨架、没有等待,
                    因为 Relay 的归一化 store 里已有这份数据(store-or-network)。
                </p>
            </div>
        </div>
    );
});

UserLookupDemo.displayName = 'UserLookupDemo';
