/**
 * ============================================================================
 * 专题注册表 — topics.tsx
 * ============================================================================
 *
 * 全站信息架构的单一数据源(Single Source of Truth)。
 * 路由、侧边栏菜单、首页卡片导航、面包屑页头全部从此注册表派生,
 * 新增一个演示专题只需:新建目录 + 在此注册一行,三处自动生效。
 *
 * 功能特点:
 * - 声明式注册:path/title/category/description/status/element
 * - 分类定义与专题定义集中管理,导航与路由永不失配
 * - 专题组件通过 React.lazy 按需加载,配合 App.tsx 中的 Suspense
 *
 * @module config/topics
 */

import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';
import {
    ApiOutlined,
    AppstoreOutlined,
    CodeOutlined,
    ExperimentOutlined,
    RobotOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 分类 key,决定专题在信息架构中的归属 */
export type CategoryKey = 'basics' | 'hooks' | 'advanced' | 'apps' | 'agent' | 'performance';

/** 专题完成度,在首页卡片上以徽标形式展示 */
export type TopicStatus = 'done' | 'wip' | 'planned';

export interface TopicMeta {
    /** 路由路径,全站唯一,如 '/topics/hooks/use-state' */
    path: string;
    /** 专题标题,用于侧边栏菜单与卡片标题 */
    title: string;
    /** 所属分类 */
    category: CategoryKey;
    /** 一句话说明,用于首页卡片与专题页页头 */
    description: string;
    /** 完成度徽标,默认 'done' */
    status?: TopicStatus;
    /** 懒加载的专题页面组件 */
    element: LazyExoticComponent<ComponentType>;
}

export interface CategoryMeta {
    key: CategoryKey;
    /** 分类路由前缀,如 '/topics/basics' */
    basePath: string;
    /** 分类名称,用于顶部导航与首页分组标题 */
    title: string;
    /** 分类副标题,用于首页分组描述 */
    subtitle: string;
    /** 分类视觉主题(首页分组与专题卡片使用,Tailwind 类名需为完整字面量) */
    theme: CategoryTheme;
}

/** 分类视觉主题:图标、配色等表现层信息,与路由/导航数据集中管理 */
export interface CategoryTheme {
    /** 分组图标 */
    icon: ReactNode;
    /** 图标容器底色与前景色,如 'bg-indigo-50 text-indigo-600' */
    iconChip: string;
    /** 分类标识小圆点颜色 */
    dot: string;
    /** 文字强调色(卡片"开始练习"链接等) */
    text: string;
    /** 卡片 hover 时的边框色 */
    hoverBorder: string;
}

/* =================================================================
 * 分类定义(顶部导航与首页分组均按此顺序展示)
 * ================================================================ */

export const CATEGORIES: CategoryMeta[] = [
    {
        key: 'basics',
        basePath: '/topics/basics',
        title: 'React 基础',
        subtitle: 'JSX、渲染、事件、列表等核心语法专题',
        theme: {
            icon: <CodeOutlined />,
            iconChip: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300',
            dot: 'bg-indigo-500',
            text: 'text-indigo-600 dark:text-indigo-400',
            hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-700',
        },
    },
    {
        key: 'hooks',
        basePath: '/topics/hooks',
        title: 'Hooks',
        subtitle: '内置 Hook 与自定义 Hook 逐个击破',
        theme: {
            icon: <ApiOutlined />,
            iconChip: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
            dot: 'bg-violet-500',
            text: 'text-violet-600 dark:text-violet-400',
            hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-700',
        },
    },
    {
        key: 'advanced',
        basePath: '/topics/advanced',
        title: '进阶专题',
        subtitle: 'Context、错误边界、组件通信与数据流',
        theme: {
            icon: <ExperimentOutlined />,
            iconChip: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
            dot: 'bg-sky-500',
            text: 'text-sky-600 dark:text-sky-400',
            hoverBorder: 'hover:border-sky-200 dark:hover:border-sky-700',
        },
    },
    {
        key: 'apps',
        basePath: '/apps',
        title: '综合应用',
        subtitle: '贴近真实业务的完整功能演练',
        theme: {
            icon: <AppstoreOutlined />,
            iconChip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
            dot: 'bg-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-700',
        },
    },
    {
        key: 'agent',
        basePath: '/agent',
        title: 'Agent 实战',
        subtitle: '客户端 Agent Runtime Store 与 React 的衔接演练',
        theme: {
            icon: <RobotOutlined />,
            iconChip: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
            dot: 'bg-rose-500',
            text: 'text-rose-600 dark:text-rose-400',
            hoverBorder: 'hover:border-rose-200 dark:hover:border-rose-700',
        },
    },
    {
        key: 'performance',
        basePath: '/performance',
        title: '性能优化',
        subtitle: '渲染优先级与任务调度演练',
        theme: {
            icon: <ThunderboltOutlined />,
            iconChip: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
            dot: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-700',
        },
    },
];

/** 按 key 查找分类元信息(含视觉主题) */
export const getCategoryMeta = (key: CategoryKey): CategoryMeta =>
    CATEGORIES.find((c) => c.key === key)!;

/* =================================================================
 * 专题注册表 — 新增专题在此注册一行即可
 * ================================================================ */

export const TOPICS: TopicMeta[] = [
    /* ---- React 基础 ---- */
    {
        path: '/topics/basics/jsx-render',
        title: 'JSX 与渲染',
        category: 'basics',
        description: 'JSX 本质与表达式插值、条件/列表渲染,及四态/权限/配置驱动等生产渲染范式',
        element: lazy(() => import('../topics/basics/jsx-render')),
    },
    {
        path: '/topics/basics/fragment',
        title: 'Fragment',
        category: 'basics',
        description: '用 Fragment 避免多余的 DOM 包裹节点',
        element: lazy(() => import('../topics/basics/fragment')),
    },
    {
        path: '/topics/basics/event',
        title: '事件与合成事件',
        category: 'basics',
        description: 'SyntheticEvent 委托机制、原生混用高频坑、批处理与面试经典 Case',
        element: lazy(() => import('../topics/basics/event')),
    },
    {
        path: '/topics/basics/list-key',
        title: '列表与 key',
        category: 'basics',
        description: 'key 决定 Diff 身份:双栏错位实验、三条规则、key 重置状态与渲染期生成 key 的坑',
        element: lazy(() => import('../topics/basics/list-key')),
    },

    /* ---- Hooks ---- */
    {
        path: '/topics/hooks/use-state',
        title: 'useState',
        category: 'hooks',
        description: 'state 是一次渲染的快照;setState 排队下一次渲染,并对照惰性初始与不可变更新',
        element: lazy(() => import('../topics/hooks/use-state')),
    },
    {
        path: '/topics/hooks/use-reducer',
        title: 'useReducer',
        category: 'hooks',
        description: 'dispatch 描述发生了什么,reducer 纯函数算出下一份 state;适合多字段关联变化',
        element: lazy(() => import('../topics/hooks/use-reducer')),
    },
    {
        path: '/topics/hooks/use-ref',
        title: 'useRef',
        category: 'hooks',
        description: '改 current 不触发渲染;盒子身份稳定,适合 DOM、定时器 ID,以及让事件/effect 读到最新值',
        element: lazy(() => import('../topics/hooks/use-ref')),
    },
    {
        path: '/topics/hooks/use-imperative-handle',
        title: 'useImperativeHandle',
        category: 'hooks',
        description: '定制父组件经 ref 拿到的命令面:只暴露 focus/clear 这类方法,不把整棵 DOM 交出去',
        element: lazy(() => import('../topics/hooks/use-imperative-handle')),
    },
    {
        path: '/topics/hooks/use-effect',
        title: 'useEffect',
        category: 'hooks',
        description: '副作用的执行时机、依赖数组与清理函数',
        element: lazy(() => import('../topics/hooks/use-effect')),
    },
    {
        path: '/topics/hooks/use-layout-effect',
        title: 'useLayoutEffect',
        category: 'hooks',
        description: '在浏览器绘制前同步读取/调整 DOM,并对照 useEffect 的执行时机',
        element: lazy(() => import('../topics/hooks/use-layout-effect')),
    },
    {
        path: '/topics/hooks/use-callback',
        title: 'useCallback',
        category: 'hooks',
        description: '缓存函数身份,让 memo 子组件和 effect 依赖认得出「还是同一个函数」',
        element: lazy(() => import('../topics/hooks/use-callback')),
    },
    {
        path: '/topics/hooks/use-memo',
        title: 'useMemo 与 memo',
        category: 'hooks',
        description: 'memo 跳过子组件函数,useMemo 跳过这次 render 里的重算;两者都比 Object.is,要配对才有收益',
        element: lazy(() => import('../topics/hooks/use-memo')),
    },
    {
        path: '/topics/hooks/custom-hooks-guide',
        title: '自定义 Hooks 深入梳理',
        category: 'hooks',
        description: '设计原则、组合设计思路与落地实践指南',
        element: lazy(() => import('../topics/hooks/custom-hooks/guide')),
    },
    {
        path: '/topics/hooks/custom-hooks-playground',
        title: '自定义 Hooks 原子演练',
        category: 'hooks',
        description: '8 个生产级基础 Hooks 逐个交互演示',
        element: lazy(() => import('../topics/hooks/custom-hooks/playground')),
    },
    {
        path: '/topics/hooks/custom-hooks-composition',
        title: '自定义 Hooks 组合实战',
        category: 'hooks',
        description: '原子 Hook 分层组合成领域 Hook 的搜索实战',
        element: lazy(() => import('../topics/hooks/custom-hooks/composition')),
    },

    /* ---- 进阶专题 ---- */
    {
        path: '/topics/advanced/context',
        title: 'Context API',
        category: 'advanced',
        description: 'createContext 开通道,Provider 供数,use() 读最近一层;并对照如何拆 Context 避免连坐重渲染',
        element: lazy(() => import('../topics/advanced/context')),
    },
    {
        path: '/topics/advanced/error-boundary',
        title: 'Error Boundary',
        category: 'advanced',
        description: '捕获渲染期异常、隔离失败半径、按粒度降级与恢复;对照事件/异步错误为何必须自己处理',
        element: lazy(() => import('../topics/advanced/error-boundary')),
    },
    {
        path: '/topics/advanced/relay',
        title: 'Relay 数据流',
        category: 'advanced',
        description: 'GraphQL/Relay 的声明式数据获取(mock 数据)',
        element: lazy(() => import('../topics/advanced/relay')),
    },
    {
        path: '/topics/advanced/component-comm-guide',
        title: '组件通信 · 决策梳理',
        category: 'advanced',
        description: '先问数据归谁、传多远、变得有多勤;再在 props / 组合 / Context / URL / Store 里选通道',
        element: lazy(() => import('../topics/advanced/component-comm/guide')),
    },
    {
        path: '/topics/advanced/component-comm-playground',
        title: '组件通信 · 模式演练',
        category: 'advanced',
        description: 'props、提升 state、组合代钻探、URL、命令式 ref 与错误同步的对照演示',
        element: lazy(() => import('../topics/advanced/component-comm/playground')),
    },
    {
        path: '/topics/advanced/component-comm-practice',
        title: '组件通信 · 工作台实战',
        category: 'advanced',
        description: '工单工作台里把过滤、选中、草稿、当前用户拆到各自该在的通道',
        element: lazy(() => import('../topics/advanced/component-comm/practice')),
    },

    /* ---- 综合应用 ---- */
    {
        path: '/apps/todo',
        title: '待办事项清单',
        category: 'apps',
        description: '增删改查、筛选、优先级与本地持久化',
        element: lazy(() => import('../topics/apps/todo')),
    },
    {
        path: '/apps/bookkeeping',
        title: '记账本',
        category: 'apps',
        description: '表单校验、分类联动、汇总统计与表格展示',
        element: lazy(() => import('../topics/apps/bookkeeping')),
    },
    {
        path: '/apps/shopping-cart',
        title: '购物车',
        category: 'apps',
        description: '商品列表、搜索过滤与状态派生计算',
        element: lazy(() =>
            import('../topics/apps/shopping-cart').then((m) => ({
                default: m.ShoppingCart,
            })),
        ),
    },

    /* ---- Agent 实战 ---- */
    {
        path: '/agent/agent-chat',
        title: 'Agent 对话运行时',
        category: 'agent',
        description: '模拟 SSE 事件流驱动外部 Runtime Store,UI 经 useSyncExternalStore 精准订阅',
        element: lazy(() => import('../topics/agent/agent-chat')),
    },
    {
        path: '/agent/use-sync-external-store',
        title: 'useSyncExternalStore 深入梳理',
        category: 'agent',
        description: '外部 Store 订阅协议、并发一致性、Selector 与本演练架构设计说明',
        element: lazy(() => import('../topics/agent/sync-store-guide')),
    },

    /* ---- 性能优化 ---- */
    {
        path: '/performance/transition-deferred',
        title: 'useTransition × useDeferredValue',
        category: 'performance',
        description: '渲染竞态场景演练:输入阻塞、Tab 切换三件套协作、stale 结果',
        element: lazy(() => import('../topics/performance/transition-deferred')),
    },
    {
        path: '/performance/suspense-ui',
        title: 'Suspense 骨架与状态 UI',
        category: 'performance',
        description: '初始骨架、回退闪烁消除与边界粒度的 Suspense × transition 协作演练',
        element: lazy(() => import('../topics/performance/suspense-ui')),
    },
    {
        path: '/performance/render-scheduling-guide',
        title: '渲染调度深入梳理',
        category: 'performance',
        description: '并发渲染心智模型、三件套分工矩阵与工程实践细节',
        element: lazy(() => import('../topics/performance/render-scheduling-guide')),
    },
];

/* =================================================================
 * 派生工具函数
 * ================================================================ */

/** 按分类筛选专题,顺序与注册表一致 */
export const getTopicsByCategory = (category: CategoryKey): TopicMeta[] =>
    TOPICS.filter((t) => t.category === category);

/** 根据当前路径推导所属分类(用于顶部导航高亮与侧边栏内容) */
export const getCategoryByPath = (pathname: string): CategoryMeta | undefined =>
    CATEGORIES.find((c) => pathname.startsWith(c.basePath));

/** 根据路径查找专题元信息 */
export const getTopicByPath = (pathname: string): TopicMeta | undefined =>
    TOPICS.find((t) => t.path === pathname);
