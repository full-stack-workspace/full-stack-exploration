/**
 * ============================================================================
 * BoundaryGranularityDemo.tsx — 场景 2:边界粒度
 * ============================================================================
 *
 * 同页两个独立数据区(快区 300ms / 慢区 1500ms),对照:
 * - 一个大 Suspense 边界:互相拖累,慢区拖住快区,整片骨架;
 * - 两个细粒度边界:各出各的骨架,快区先就绪先显示。
 * 重载叠加 startTransition:旧内容保持,各边界独立接管自己的等待。
 *
 * 套件标注:Suspense(边界)+ transition(重载调度)二件套。
 *
 * @module topics/performance/suspense-ui/components/BoundaryGranularityDemo
 */

import { memo, Suspense, useState, useTransition } from 'react';
import { Button, Segmented, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { wrapPromise } from '../../lab/resource';
import type { SuspenseResource } from '../../lab/resource';
import { searchItems } from '../../lab/mockSearchApi';
import type { SearchResponse } from '../../lab/mockSearchApi';
import { ResultReader, ResultSkeleton } from './ResultReader';

/** 两个数据区的资源对 */
interface AreaResources {
    fast: SuspenseResource<SearchResponse>;
    slow: SuspenseResource<SearchResponse>;
}

const createAreaResources = (): AreaResources => ({
    fast: wrapPromise(searchItems('cache', { delay: 300 })),
    slow: wrapPromise(searchItems('suspense', { delay: 1500 })),
});

/** 单一大边界用的整体骨架 */
const WholeSkeleton = () => (
    <div className="grid animate-pulse gap-4 lg:grid-cols-2" aria-label="整体骨架">
        <div className="h-40 rounded-lg bg-gray-100 dark:bg-slate-800" />
        <div className="h-40 rounded-lg bg-gray-100 dark:bg-slate-800" />
    </div>
);

/**
 * @example
 * <BoundaryGranularityDemo />
 */
export const BoundaryGranularityDemo = memo(() => {
    const [split, setSplit] = useState(true);
    const [resources, setResources] = useState<AreaResources>(() => createAreaResources());
    const [isPending, startTransition] = useTransition();

    // 重载叠加 transition:旧内容保持可见,新资源就绪后一次性切换
    const reload = () => {
        startTransition(() => setResources(createAreaResources()));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Segmented
                    options={[
                        { label: '一个大边界(慢区拖住快区)', value: false },
                        { label: '两个细边界(各出各的骨架)', value: true },
                    ]}
                    value={split}
                    onChange={(v) => setSplit(v as boolean)}
                />
                <Button size="small" icon={<ReloadOutlined />} onClick={reload}>
                    重载(transition 保持旧 UI)
                </Button>
                {isPending && <Tag color="processing">重载调度中</Tag>}
            </div>

            <div className={isPending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                {split ? (
                    // 细粒度边界:快区不被慢区拖累
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Suspense fallback={<ResultSkeleton label="快区" />}>
                            <ResultReader resource={resources.fast} label="快区(300ms)" />
                        </Suspense>
                        <Suspense fallback={<ResultSkeleton label="慢区" />}>
                            <ResultReader resource={resources.slow} label="慢区(1500ms)" />
                        </Suspense>
                    </div>
                ) : (
                    // 单一大边界:任何一区未就绪,整片都是骨架
                    <Suspense fallback={<WholeSkeleton />}>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <ResultReader resource={resources.fast} label="快区(300ms)" />
                            <ResultReader resource={resources.slow} label="慢区(1500ms)" />
                        </div>
                    </Suspense>
                )}
            </div>
        </div>
    );
});

BoundaryGranularityDemo.displayName = 'BoundaryGranularityDemo';
