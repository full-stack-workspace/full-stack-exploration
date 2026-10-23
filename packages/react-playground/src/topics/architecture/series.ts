/**
 * ============================================================================
 * series.ts — 原理与架构的系列目录
 * ============================================================================
 *
 * 迁入后的十页。后续任务把设计约束、工作单元、双缓冲、阅读地图插进对应组。
 *
 * @module topics/architecture/series
 */

export type ArchitectureTopicKey =
    | 'constraints'
    | 'runtime-map'
    | 'work-unit'
    | 'fiber'
    | 'render'
    | 'commit'
    | 'update-queue'
    | 'hooks-impl'
    | 'scheduler'
    | 'events'
    | 'ssr'
    | 'check';

export interface SeriesLink {
    key: ArchitectureTopicKey;
    to: string;
    label: string;
}

export interface ArchitectureSeries {
    id: 'why' | 'fiber' | 'update' | 'entry' | 'review';
    title: string;
    links: readonly SeriesLink[];
}

export const ARCHITECTURE_SERIES: readonly ArchitectureSeries[] = [
    {
        id: 'why',
        title: '为什么',
        links: [
            { key: 'constraints', to: '/architecture/constraints', label: '设计约束' },
            { key: 'runtime-map', to: '/architecture/runtime-map', label: '运行时总览' },
        ],
    },
    {
        id: 'fiber',
        title: 'Fiber 架构',
        links: [
            { key: 'work-unit', to: '/architecture/work-unit', label: '工作单元' },
            { key: 'fiber', to: '/architecture/fiber', label: 'Fiber' },
        ],
    },
    {
        id: 'update',
        title: '一次更新',
        links: [
            { key: 'render', to: '/architecture/render', label: 'Render' },
            { key: 'commit', to: '/architecture/commit', label: 'Commit' },
            { key: 'update-queue', to: '/architecture/update-queue', label: '更新队列' },
            { key: 'hooks-impl', to: '/architecture/hooks-impl', label: 'Hooks 链表' },
            { key: 'scheduler', to: '/architecture/scheduler', label: 'Scheduler' },
        ],
    },
    {
        id: 'entry',
        title: '入口',
        links: [
            { key: 'events', to: '/architecture/events', label: '合成事件' },
            { key: 'ssr', to: '/architecture/ssr', label: 'SSR 与水合' },
        ],
    },
    {
        id: 'review',
        title: '复盘',
        links: [{ key: 'check', to: '/architecture/check', label: '理解检验' }],
    },
];
