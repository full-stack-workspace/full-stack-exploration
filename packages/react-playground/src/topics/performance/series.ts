/**
 * ============================================================================
 * series.ts — 性能优化分类的系列目录
 * ============================================================================
 *
 * 性能优化的页头导航有三条教学系列,外加一条 React Compiler 独立页和放在最后的理解检验:
 * 治理全链路(原则→指标→架构→实现→排查)、渲染调度(梳理→演练→Suspense)、AI-Native(金字塔/流式/工具链)。
 * Compiler 独立页讲「开/不开的判断」,不属于任何一条系列,单独一组。
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
    | 'render-scheduling-guide'
    | 'react-compiler'
    | 'check';

export interface SeriesLink {
    key: PerformanceTopicKey;
    to: string;
    label: string;
}

export interface PerformanceSeries {
    id: 'governance' | 'ai-native' | 'scheduling' | 'compiler' | 'review';
    title: string;
    links: readonly SeriesLink[];
}

/** 页头导航;新增子专题时只改这里和 topics.tsx。理解检验放在最后,避免分类点击落到题库。 */
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
        id: 'scheduling',
        title: '渲染调度',
        links: [
            { key: 'render-scheduling-guide', to: '/performance/render-scheduling-guide', label: '调度梳理' },
            { key: 'transition-deferred', to: '/performance/transition-deferred', label: 'transition × deferred' },
            { key: 'suspense-ui', to: '/performance/suspense-ui', label: 'Suspense 骨架' },
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
        id: 'compiler',
        title: 'React Compiler',
        links: [{ key: 'react-compiler', to: '/performance/react-compiler', label: 'Compiler 判断框架' }],
    },
    {
        id: 'review',
        title: '检验',
        links: [{ key: 'check', to: '/performance/check', label: '理解检验' }],
    },
];
