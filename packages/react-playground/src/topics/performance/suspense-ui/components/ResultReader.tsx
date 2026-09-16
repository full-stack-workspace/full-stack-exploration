/**
 * ============================================================================
 * ResultReader.tsx — Suspense 资源读取与渲染
 * ============================================================================
 *
 * 三场景共用的读取组件:渲染期调用 resource.read(),
 * 未就绪时 throw promise 交给最近的 Suspense 边界。
 *
 * @module topics/performance/suspense-ui/components/ResultReader
 */

import { memo } from 'react';
import { List, Tag } from 'antd';

import type { SuspenseResource } from '../../lab/resource';
import type { SearchResponse } from '../../lab/mockSearchApi';

interface ResultReaderProps {
    resource: SuspenseResource<SearchResponse>;
    /** 区域标签(边界粒度场景区分快/慢区) */
    label?: string;
}

/**
 * @example
 * <Suspense fallback={<Skeleton />}><ResultReader resource={resource} /></Suspense>
 */
export const ResultReader = memo(({ resource, label }: ResultReaderProps) => {
    // 渲染期读资源:pending → throw promise(Suspense 接管);error → throw(error boundary)
    const data = resource.read();

    return (
        <div>
            {label && (
                <div className="mb-1.5 flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                    <Tag color="success" className="m-0">
                        已就绪
                    </Tag>
                    {label}(响应关键字:「{data.keyword}」)
                </div>
            )}
            <List
                size="small"
                className="max-w-sm"
                bordered
                dataSource={data.results.slice(0, 5)}
                renderItem={(word) => <List.Item className="!px-3 !py-1 text-sm">{word}</List.Item>}
            />
        </div>
    );
});

ResultReader.displayName = 'ResultReader';

/** 形似骨架:与 ResultReader 最终布局同构(标签行 + 列表块) */
export const ResultSkeleton = memo(({ label }: { label?: string }) => (
    <div className="animate-pulse" aria-label={label ? `${label}骨架` : '数据骨架'}>
        <div className="mb-1.5 h-4 w-32 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-32 max-w-sm rounded-lg border border-gray-100 bg-gray-50 dark:border-slate-800 dark:bg-slate-800/60" />
    </div>
));

ResultSkeleton.displayName = 'ResultSkeleton';
