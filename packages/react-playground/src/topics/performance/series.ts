/**
 * ============================================================================
 * series.ts — 性能优化分类的系列目录
 * ============================================================================
 *
 * 性能优化不再只有「渲染调度操作」,而是三条互链的系列:
 * 治理全链路(原则→指标→架构→实现→排查)、AI-Native(金字塔/流式/工具链)、已有渲染调度演练。
 * SeriesNav 与注册表共用这份目录,避免路径写散。
 *
 * @module topics/performance/series
 */

export type PerformanceTopicKey =
    | 'governance-guide'
    | 'metrics-lab'
    | 'architecture-guide'
    | 'implement-lab'
    | 'diagnose-lab'
    | 'ai-native-guide'
    | 'ai-native-lab'
    | 'ai-native-agent'
    | 'transition-deferred'
    | 'suspense-ui'
    | 'render-scheduling-guide';

export interface SeriesLink {
    key: PerformanceTopicKey;
    to: string;
    label: string;
}

export interface PerformanceSeries {
    id: 'governance' | 'ai-native' | 'scheduling';
    title: string;
    links: readonly SeriesLink[];
}

/** 三条系列的页头导航;新增子专题时只改这里和 topics.tsx */
export const PERFORMANCE_SERIES: readonly PerformanceSeries[] = [
    {
        id: 'governance',
        title: '性能治理全链路',
        links: [
            { key: 'governance-guide', to: '/performance/governance-guide', label: '原则与约定' },
            { key: 'metrics-lab', to: '/performance/metrics-lab', label: '指标实验室' },
            { key: 'architecture-guide', to: '/performance/architecture-guide', label: '架构关键路径' },
            { key: 'implement-lab', to: '/performance/implement-lab', label: '实现六规则' },
            { key: 'diagnose-lab', to: '/performance/diagnose-lab', label: '排查演练' },
        ],
    },
    {
        id: 'ai-native',
        title: 'AI-Native 性能',
        links: [
            { key: 'ai-native-guide', to: '/performance/ai-native-guide', label: '指标金字塔' },
            { key: 'ai-native-lab', to: '/performance/ai-native-lab', label: '流式体验演练' },
            { key: 'ai-native-agent', to: '/performance/ai-native-agent', label: 'Agent 工具链' },
        ],
    },
    {
        id: 'scheduling',
        title: '渲染调度(已有)',
        links: [
            { key: 'transition-deferred', to: '/performance/transition-deferred', label: 'transition × deferred' },
            { key: 'suspense-ui', to: '/performance/suspense-ui', label: 'Suspense 骨架' },
            { key: 'render-scheduling-guide', to: '/performance/render-scheduling-guide', label: '调度梳理' },
        ],
    },
];
