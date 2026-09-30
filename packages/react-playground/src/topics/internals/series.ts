/**
 * ============================================================================
 * series.ts — 内部机制分类的系列目录
 * ============================================================================
 *
 * 十页按一次更新的因果往下走:总览 → 数据结构 → 两个阶段 → 更新如何入队
 * → 何时执行 → 事件与 SSR 两个入口 → 理解检验。页头 SeriesNav 与注册表共用这些路径。
 *
 * @module topics/internals/series
 */

export type InternalsTopicKey =
    | 'runtime-map'
    | 'fiber'
    | 'render'
    | 'commit'
    | 'update-queue'
    | 'hooks-impl'
    | 'scheduler'
    | 'events'
    | 'ssr'
    | 'interview';

export interface SeriesLink {
    key: InternalsTopicKey;
    to: string;
    label: string;
}

export interface InternalsSeries {
    id: 'pipeline' | 'structure' | 'entry' | 'review';
    title: string;
    links: readonly SeriesLink[];
}

/** 页头导航。新增子专题时同时改这里和 topics.tsx。 */
export const INTERNALS_SERIES: readonly InternalsSeries[] = [
    {
        id: 'pipeline',
        title: '一次更新',
        links: [
            { key: 'runtime-map', to: '/internals/runtime-map', label: '运行时总览' },
            { key: 'fiber', to: '/internals/fiber', label: 'Fiber' },
            { key: 'render', to: '/internals/render', label: 'Render' },
            { key: 'commit', to: '/internals/commit', label: 'Commit' },
        ],
    },
    {
        id: 'structure',
        title: '状态与调度',
        links: [
            { key: 'update-queue', to: '/internals/update-queue', label: '更新队列' },
            { key: 'hooks-impl', to: '/internals/hooks-impl', label: 'Hooks 链表' },
            { key: 'scheduler', to: '/internals/scheduler', label: 'Scheduler' },
        ],
    },
    {
        id: 'entry',
        title: '入口',
        links: [
            { key: 'events', to: '/internals/events', label: '合成事件' },
            { key: 'ssr', to: '/internals/ssr', label: 'SSR 与水合' },
        ],
    },
    {
        id: 'review',
        title: '复盘',
        links: [{ key: 'interview', to: '/internals/interview', label: '理解检验' }],
    },
];
