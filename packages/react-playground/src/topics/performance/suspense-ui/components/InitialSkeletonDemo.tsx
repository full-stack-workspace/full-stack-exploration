/**
 * ============================================================================
 * InitialSkeletonDemo.tsx — 场景 0:初始加载的两种资源
 * ============================================================================
 *
 * 同一「初始骨架」语义覆盖两类资源(迁移自旧 Suspense 专题并升级):
 * - chunk 资源:React.lazy + Suspense(1.5s 人为延迟,fallback 升级为形似骨架);
 * - 数据资源:wrapPromise + mockSearchApi。
 * Suspense 协议对两类资源完全一致:read/加载未就绪 → 声明式骨架接管。
 *
 * 套件标注:本场景只用 Suspense(初始加载,无更新调度需求)。
 *
 * @module topics/performance/suspense-ui/components/InitialSkeletonDemo
 */

import { memo, Suspense, lazy, useState } from 'react';
import type { ComponentType } from 'react';
import { Button } from 'antd';

import { wrapPromise } from '../../lab/resource';
import type { SuspenseResource } from '../../lab/resource';
import { searchItems } from '../../lab/mockSearchApi';
import type { SearchResponse } from '../../lab/mockSearchApi';
import { ResultReader, ResultSkeleton } from './ResultReader';

// 人为 1.5s 延迟,模拟大体积 chunk 的网络加载(沿用旧专题演示)
const LazyDocPanel = lazy(
    () =>
        new Promise<{ default: ComponentType }>((resolve) => {
            setTimeout(() => {
                import('./LazyDocPanel').then((m) => resolve({ default: m.default }));
            }, 1500);
        }),
);

/** 形似骨架:与 LazyDocPanel 最终布局同构,避免加载完成时的布局位移 */
const DocSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-100 p-6 dark:border-slate-800" aria-label="文档骨架">
        <div className="h-4 w-40 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="mt-2 h-3 w-72 rounded bg-gray-100 dark:bg-slate-800" />
    </div>
);

interface InitialSkeletonDemoProps {
    /** 可注入的数据资源工厂(测试用可控 Promise 替换) */
    createResource?: () => SuspenseResource<SearchResponse>;
}

/**
 * @example
 * <InitialSkeletonDemo />
 */
export const InitialSkeletonDemo = memo(
    ({
        createResource = () => wrapPromise(searchItems('suspense', { delay: 1200 })),
    }: InitialSkeletonDemoProps) => {
        // chunk 资源:key 变化强制重挂,反复观察加载过程
        const [chunkKey, setChunkKey] = useState(0);
        // 数据资源:在事件处理器中创建(发起请求即创建),绝不放渲染期
        const [resource, setResource] = useState<SuspenseResource<SearchResponse>>(() =>
            createResource(),
        );

        return (
            <div className="grid gap-6 lg:grid-cols-2">
                {/* chunk 资源:React.lazy + Suspense */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                        chunk 资源(React.lazy)
                        <Button size="small" onClick={() => setChunkKey((k) => k + 1)}>
                            {chunkKey === 0 ? '加载' : '重新加载'}
                        </Button>
                    </div>
                    {chunkKey > 0 ? (
                        <Suspense key={chunkKey} fallback={<DocSkeleton />}>
                            <LazyDocPanel />
                        </Suspense>
                    ) : (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                            点击「加载」发起 chunk 请求
                        </p>
                    )}
                </div>

                {/* 数据资源:wrapPromise + mockSearchApi */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                        数据资源(wrapPromise)
                        <Button size="small" onClick={() => setResource(createResource())}>
                            重新加载
                        </Button>
                    </div>
                    <Suspense fallback={<ResultSkeleton label="数据资源" />}>
                        <ResultReader resource={resource} label="数据资源" />
                    </Suspense>
                </div>
            </div>
        );
    },
);

InitialSkeletonDemo.displayName = 'InitialSkeletonDemo';
