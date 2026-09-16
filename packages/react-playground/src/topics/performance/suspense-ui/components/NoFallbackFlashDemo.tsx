/**
 * ============================================================================
 * NoFallbackFlashDemo.tsx — 场景 1:回退闪烁(Suspense × transition 协作)
 * ============================================================================
 *
 * 已显示内容的页面切换查询条件,对照:
 * - 裸 Suspense:更新直接回退到骨架屏,已显示内容瞬间消失(闪烁);
 * - startTransition 包裹更新:保留旧内容 + 角落 isPending 指示,
 *   新数据就绪后一次性切换 —— React 对 transition 中的挂起不展示 fallback。
 *
 * 套件标注:Suspense + transition 二件套 —— 同一边界、两种时机:
 * 初始加载出骨架(Suspense 管),更新切换保持旧 UI(transition 管)。
 *
 * @module topics/performance/suspense-ui/components/NoFallbackFlashDemo
 */

import { memo, Suspense, useState, useTransition } from 'react';
import { Segmented, Tag } from 'antd';

import { wrapPromise } from '../../lab/resource';
import type { SuspenseResource } from '../../lab/resource';
import { searchItems } from '../../lab/mockSearchApi';
import type { SearchResponse } from '../../lab/mockSearchApi';
import { ResultReader, ResultSkeleton } from './ResultReader';

/** 可切换的查询词 */
const QUERIES = ['cache', 'render', 'suspense'] as const;
type Query = (typeof QUERIES)[number];

interface NoFallbackFlashDemoProps {
    /** 可注入的资源工厂(测试用可控 Promise 替换) */
    createResource?: (query: Query) => SuspenseResource<SearchResponse>;
}

/**
 * @example
 * <NoFallbackFlashDemo />
 */
export const NoFallbackFlashDemo = memo(
    ({
        createResource = (query: Query) => wrapPromise(searchItems(query, { delay: 1200 })),
    }: NoFallbackFlashDemoProps) => {
        const [useTransitionMode, setUseTransitionMode] = useState(true);
        const [query, setQuery] = useState<Query>('cache');
        const [resource, setResource] = useState<SuspenseResource<SearchResponse>>(() =>
            createResource('cache'),
        );
        const [isPending, startTransition] = useTransition();

        const handleQueryChange = (next: Query) => {
            setQuery(next);
            if (useTransitionMode) {
                // 非紧急更新:挂起时保留旧 UI,不回退骨架
                startTransition(() => setResource(createResource(next)));
            } else {
                // 同步更新:新资源未就绪 → 边界立即回退到骨架(闪烁)
                setResource(createResource(next));
            }
        };

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Segmented
                        options={[
                            { label: '裸 Suspense(回退闪烁)', value: false },
                            { label: 'Suspense + transition(保持旧 UI)', value: true },
                        ]}
                        value={useTransitionMode}
                        onChange={(v) => setUseTransitionMode(v as boolean)}
                    />
                    {isPending && <Tag color="processing">新数据加载中,旧内容保持可见</Tag>}
                </div>

                <Segmented
                    options={QUERIES.map((q) => ({ label: `查询「${q}」`, value: q }))}
                    value={query}
                    onChange={(v) => handleQueryChange(v as Query)}
                />

                <div className={isPending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                    <Suspense fallback={<ResultSkeleton label="查询结果" />}>
                        <ResultReader resource={resource} label="查询结果" />
                    </Suspense>
                </div>
            </div>
        );
    },
);

NoFallbackFlashDemo.displayName = 'NoFallbackFlashDemo';
