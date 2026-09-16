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
} from '@ant-design/icons';

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 分类 key,决定专题在信息架构中的归属 */
export type CategoryKey = 'basics' | 'hooks' | 'advanced' | 'apps';

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
            iconChip: 'bg-indigo-50 text-indigo-600',
            dot: 'bg-indigo-500',
            text: 'text-indigo-600',
            hoverBorder: 'hover:border-indigo-200',
        },
    },
    {
        key: 'hooks',
        basePath: '/topics/hooks',
        title: 'Hooks',
        subtitle: '内置 Hook 与自定义 Hook 逐个击破',
        theme: {
            icon: <ApiOutlined />,
            iconChip: 'bg-violet-50 text-violet-600',
            dot: 'bg-violet-500',
            text: 'text-violet-600',
            hoverBorder: 'hover:border-violet-200',
        },
    },
    {
        key: 'advanced',
        basePath: '/topics/advanced',
        title: '进阶专题',
        subtitle: 'Suspense、错误边界、数据流等进阶能力',
        theme: {
            icon: <ExperimentOutlined />,
            iconChip: 'bg-sky-50 text-sky-600',
            dot: 'bg-sky-500',
            text: 'text-sky-600',
            hoverBorder: 'hover:border-sky-200',
        },
    },
    {
        key: 'apps',
        basePath: '/apps',
        title: '综合应用',
        subtitle: '贴近真实业务的完整功能演练',
        theme: {
            icon: <AppstoreOutlined />,
            iconChip: 'bg-emerald-50 text-emerald-600',
            dot: 'bg-emerald-500',
            text: 'text-emerald-600',
            hoverBorder: 'hover:border-emerald-200',
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
        description: 'JSX 表达式插值、条件渲染与元素的本质',
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
        description: 'SyntheticEvent 的跨浏览器封装与事件委托',
        element: lazy(() => import('../topics/basics/event')),
    },
    {
        path: '/topics/basics/list-key',
        title: '列表与 key',
        category: 'basics',
        description: 'key 如何影响列表的 Diff 与组件状态保持',
        element: lazy(() => import('../topics/basics/list-key')),
    },

    /* ---- Hooks ---- */
    {
        path: '/topics/hooks/use-state',
        title: 'useState',
        category: 'hooks',
        description: '函数组件的状态声明与函数式更新',
        element: lazy(() => import('../topics/hooks/use-state')),
    },
    {
        path: '/topics/hooks/use-effect',
        title: 'useEffect',
        category: 'hooks',
        description: '副作用的执行时机、依赖数组与清理函数',
        element: lazy(() => import('../topics/hooks/use-effect')),
    },

    /* ---- 进阶专题 ---- */
    {
        path: '/topics/advanced/suspense',
        title: 'Suspense',
        category: 'advanced',
        description: '用 Suspense 声明式处理异步加载态',
        element: lazy(() => import('../topics/advanced/suspense')),
    },
    {
        path: '/topics/advanced/error-boundary',
        title: 'Error Boundary',
        category: 'advanced',
        description: '错误边界捕获渲染异常,防止整棵组件树崩溃',
        element: lazy(() => import('../topics/advanced/error-boundary')),
    },
    {
        path: '/topics/advanced/relay',
        title: 'Relay 数据流',
        category: 'advanced',
        description: 'GraphQL/Relay 的声明式数据获取(mock 数据)',
        element: lazy(() => import('../topics/advanced/relay')),
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
