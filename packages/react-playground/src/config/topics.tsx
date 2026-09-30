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
 * - 声明式注册:path/title/category/description/element
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
    DeploymentUnitOutlined,
    ExperimentOutlined,
    RobotOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 分类 key,决定专题在信息架构中的归属 */
export type CategoryKey = 'basics' | 'hooks' | 'advanced' | 'internals' | 'apps' | 'agent' | 'performance';

export interface TopicMeta {
    /** 路由路径,全站唯一,如 '/hooks/use-state' */
    path: string;
    /** 专题标题,用于侧边栏菜单与卡片标题 */
    title: string;
    /** 所属分类 */
    category: CategoryKey;
    /** 一句话说明,用于首页卡片与专题页页头 */
    description: string;
    /** 懒加载的专题页面组件 */
    element: LazyExoticComponent<ComponentType>;
}

export interface CategoryMeta {
    key: CategoryKey;
    /** 分类路由前缀(裸前缀,与目录同名),如 '/basics' */
    basePath: string;
    /** 分类名称,用于顶部导航与首页分组标题 */
    title: string;
    /** 分类副标题,用于首页分组描述 */
    subtitle: string;
    /** 分类视觉主题(首页分组与专题卡片使用,Tailwind 类名需为完整字面量) */
    theme: CategoryTheme;
}

/** 专题互链横幅(components/TopicNav)的配色四件套 */
export interface BannerTheme {
    /** 容器边框色 */
    border: string;
    /** 容器底色 */
    bg: string;
    /** 文字颜色 */
    text: string;
    /** 链接 hover 色 */
    linkHover: string;
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
    /** 专题互链横幅(TopicNav)配色 */
    banner: BannerTheme;
}

/* =================================================================
 * 分类定义(顶部导航与首页分组均按此顺序展示)
 * ================================================================ */

export const CATEGORIES: CategoryMeta[] = [
    {
        key: 'basics',
        basePath: '/basics',
        title: 'React 基础',
        subtitle: 'JSX、渲染、事件、函数组件与类组件',
        theme: {
            icon: <CodeOutlined />,
            iconChip: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300',
            dot: 'bg-indigo-500',
            text: 'text-indigo-600 dark:text-indigo-400',
            hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-700',
            banner: {
                border: 'border-indigo-100 dark:border-indigo-900',
                bg: 'bg-indigo-50/60 dark:bg-indigo-950/40',
                text: 'text-indigo-700 dark:text-indigo-300',
                linkHover: 'hover:text-indigo-800 dark:hover:text-indigo-200',
            },
        },
    },
    {
        key: 'hooks',
        basePath: '/hooks',
        title: 'Hooks',
        subtitle: '内置 Hook 与自定义 Hook 逐个击破',
        theme: {
            icon: <ApiOutlined />,
            iconChip: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
            dot: 'bg-violet-500',
            text: 'text-violet-600 dark:text-violet-400',
            hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-700',
            banner: {
                border: 'border-violet-100 dark:border-violet-900',
                bg: 'bg-violet-50/60 dark:bg-violet-950/40',
                text: 'text-violet-600 dark:text-violet-300',
                linkHover: 'hover:text-violet-700 dark:hover:text-violet-200',
            },
        },
    },
    {
        key: 'advanced',
        basePath: '/advanced',
        title: '进阶专题',
        subtitle: '组件通信、Context、错误边界、RSC 与数据流',
        theme: {
            icon: <ExperimentOutlined />,
            iconChip: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
            dot: 'bg-sky-500',
            text: 'text-sky-600 dark:text-sky-400',
            hoverBorder: 'hover:border-sky-200 dark:hover:border-sky-700',
            banner: {
                border: 'border-sky-100 dark:border-sky-900',
                bg: 'bg-sky-50/60 dark:bg-sky-950/40',
                text: 'text-sky-700 dark:text-sky-300',
                linkHover: 'hover:text-sky-800 dark:hover:text-sky-200',
            },
        },
    },
    {
        key: 'internals',
        basePath: '/internals',
        title: '内部机制',
        subtitle: 'Fiber、Render、Commit、更新队列、Hooks 链表与调度',
        theme: {
            icon: <DeploymentUnitOutlined />,
            iconChip: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
            dot: 'bg-cyan-500',
            text: 'text-cyan-700 dark:text-cyan-300',
            hoverBorder: 'hover:border-cyan-200 dark:hover:border-cyan-700',
            banner: {
                border: 'border-cyan-100 dark:border-cyan-900',
                bg: 'bg-cyan-50/60 dark:bg-cyan-950/40',
                text: 'text-cyan-700 dark:text-cyan-300',
                linkHover: 'hover:text-cyan-800 dark:hover:text-cyan-200',
            },
        },
    },
    {
        key: 'performance',
        basePath: '/performance',
        title: '性能优化',
        subtitle: '原则、指标、架构、实现、排查；含渲染调度与 AI-Native',
        theme: {
            icon: <ThunderboltOutlined />,
            iconChip: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
            dot: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-700',
            banner: {
                border: 'border-amber-100 dark:border-amber-900',
                bg: 'bg-amber-50/60 dark:bg-amber-950/40',
                text: 'text-amber-700 dark:text-amber-300',
                linkHover: 'hover:text-amber-800 dark:hover:text-amber-200',
            },
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
            banner: {
                border: 'border-rose-100 dark:border-rose-900',
                bg: 'bg-rose-50/60 dark:bg-rose-950/40',
                text: 'text-rose-600 dark:text-rose-300',
                linkHover: 'hover:text-rose-700 dark:hover:text-rose-200',
            },
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
            banner: {
                border: 'border-emerald-100 dark:border-emerald-900',
                bg: 'bg-emerald-50/60 dark:bg-emerald-950/40',
                text: 'text-emerald-600 dark:text-emerald-300',
                linkHover: 'hover:text-emerald-700 dark:hover:text-emerald-200',
            },
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
        path: '/basics/jsx-render',
        title: 'JSX 与渲染',
        category: 'basics',
        description: 'JSX 本质与表达式插值、条件/列表渲染,及四态/权限/配置驱动等生产渲染范式',
        element: lazy(() => import('../topics/basics/jsx-render')),
    },
    {
        path: '/basics/fragment',
        title: 'Fragment',
        category: 'basics',
        description: '用 Fragment 避免多余的 DOM 包裹节点',
        element: lazy(() => import('../topics/basics/fragment')),
    },
    {
        path: '/basics/list-key',
        title: '列表与 key',
        category: 'basics',
        description: 'key 决定 Diff 身份:双栏错位实验、三条规则、key 重置状态与渲染期生成 key 的坑',
        element: lazy(() => import('../topics/basics/list-key')),
    },
    {
        path: '/basics/event',
        title: '事件与合成事件',
        category: 'basics',
        description: 'SyntheticEvent 委托机制、原生混用高频坑、批处理与面试经典 Case',
        element: lazy(() => import('../topics/basics/event')),
    },
    {
        path: '/basics/fn-vs-class-guide',
        title: '函数组件与类组件 · 范式梳理',
        category: 'basics',
        description: 'UI = f(state):用函数组件 + Hooks 覆盖 class 的能力,并说明新范式为什么更适合生产与并发',
        element: lazy(() => import('../topics/basics/fn-vs-class/guide')),
    },
    {
        path: '/basics/fn-vs-class-playground',
        title: '函数组件与类组件 · 对照演练',
        category: 'basics',
        description: '快照 vs this、派生值、订阅拆生命周期 vs useEffect,对照同一行为的两种写法',
        element: lazy(() => import('../topics/basics/fn-vs-class/playground')),
    },
    {
        path: '/basics/fn-vs-class-practice',
        title: '函数组件与类组件 · 看板实战',
        category: 'basics',
        description: '同一份行情看板:class 把时钟/请求/过滤堆在实例上,函数组件拆成可复用 Hook',
        element: lazy(() => import('../topics/basics/fn-vs-class/practice')),
    },
    {
        path: '/basics/check',
        title: '理解检验',
        category: 'basics',
        description: '用来检验 JSX、列表 key、事件和函数组件是否掌握;RSC 题保留,其专题已归入进阶。星级题标出考察点',
        element: lazy(() => import('../topics/basics/check')),
    },

    /* ---- Hooks ---- */
    {
        path: '/hooks/use-state',
        title: 'useState',
        category: 'hooks',
        description: 'state 是一次渲染的快照;setState 排队下一次渲染,并对照惰性初始与不可变更新',
        element: lazy(() => import('../topics/hooks/use-state')),
    },
    {
        path: '/hooks/use-reducer',
        title: 'useReducer',
        category: 'hooks',
        description: 'dispatch 描述发生了什么,reducer 纯函数算出下一份 state;适合多字段关联变化',
        element: lazy(() => import('../topics/hooks/use-reducer')),
    },
    {
        path: '/hooks/use-ref',
        title: 'useRef',
        category: 'hooks',
        description: '改 current 不触发渲染;盒子身份稳定,适合 DOM、定时器 ID,以及让事件/effect 读到最新值',
        element: lazy(() => import('../topics/hooks/use-ref')),
    },
    {
        path: '/hooks/use-imperative-handle',
        title: 'useImperativeHandle',
        category: 'hooks',
        description: '定制父组件经 ref 拿到的命令面:只暴露 focus/clear 这类方法,不把整棵 DOM 交出去',
        element: lazy(() => import('../topics/hooks/use-imperative-handle')),
    },
    {
        path: '/hooks/use-effect',
        title: 'useEffect',
        category: 'hooks',
        description: '副作用的执行时机、依赖数组与清理函数',
        element: lazy(() => import('../topics/hooks/use-effect')),
    },
    {
        path: '/hooks/use-layout-effect',
        title: 'useLayoutEffect',
        category: 'hooks',
        description: '在浏览器绘制前同步读取/调整 DOM,并对照 useEffect 的执行时机',
        element: lazy(() => import('../topics/hooks/use-layout-effect')),
    },
    {
        path: '/hooks/use-callback',
        title: 'useCallback',
        category: 'hooks',
        description: '缓存函数身份,让 memo 子组件和 effect 依赖认得出「还是同一个函数」',
        element: lazy(() => import('../topics/hooks/use-callback')),
    },
    {
        path: '/hooks/use-memo',
        title: 'useMemo 与 memo',
        category: 'hooks',
        description: 'memo 跳过子组件函数,useMemo 跳过这次 render 里的重算;两者都比 Object.is,要配对才有收益',
        element: lazy(() => import('../topics/hooks/use-memo')),
    },
    {
        path: '/hooks/actions',
        title: 'React 19 Actions',
        category: 'hooks',
        description: 'form action / useActionState / useOptimistic / useFormStatus:一次提交的收集、pending、回显与乐观更新',
        element: lazy(() => import('../topics/hooks/actions')),
    },
    {
        path: '/hooks/custom-hooks-guide',
        title: '自定义 Hooks 深入梳理',
        category: 'hooks',
        description: '设计原则、组合设计思路与落地实践指南',
        element: lazy(() => import('../topics/hooks/custom-hooks/guide')),
    },
    {
        path: '/hooks/custom-hooks-playground',
        title: '自定义 Hooks 原子演练',
        category: 'hooks',
        description: '8 个生产级基础 Hooks 逐个交互演示',
        element: lazy(() => import('../topics/hooks/custom-hooks/playground')),
    },
    {
        path: '/hooks/custom-hooks-composition',
        title: '自定义 Hooks 组合实战',
        category: 'hooks',
        description: '原子 Hook 分层组合成领域 Hook 的搜索实战',
        element: lazy(() => import('../topics/hooks/custom-hooks/composition')),
    },
    {
        path: '/hooks/check',
        title: '理解检验',
        category: 'hooks',
        description: '用来检验 state、effect、缓存、自定义 Hook 和并发读取是否掌握。较难题标出星级和考察点',
        element: lazy(() => import('../topics/hooks/check')),
    },

    /* ---- 进阶专题 ---- */
    {
        path: '/advanced/component-comm-guide',
        title: '组件通信 · 决策梳理',
        category: 'advanced',
        description: '先问数据归谁、传多远、变得有多勤;再在 props / 组合 / Context / URL / Store 里选通道',
        element: lazy(() => import('../topics/advanced/component-comm/guide')),
    },
    {
        path: '/advanced/component-comm-playground',
        title: '组件通信 · 模式演练',
        category: 'advanced',
        description: 'props、提升 state、组合代钻探、URL、命令式 ref 与错误同步的对照演示',
        element: lazy(() => import('../topics/advanced/component-comm/playground')),
    },
    {
        path: '/advanced/component-comm-practice',
        title: '组件通信 · 工作台实战',
        category: 'advanced',
        description: '工单工作台里把过滤、选中、草稿、当前用户拆到各自该在的通道',
        element: lazy(() => import('../topics/advanced/component-comm/practice')),
    },
    {
        path: '/advanced/context',
        title: 'Context API',
        category: 'advanced',
        description: 'createContext 开通道,Provider 供数,use() 读最近一层;并对照如何拆 Context 避免连坐重渲染',
        element: lazy(() => import('../topics/advanced/context')),
    },
    {
        path: '/advanced/error-boundary',
        title: 'Error Boundary',
        category: 'advanced',
        description: '捕获渲染期异常、隔离失败半径、按粒度降级与恢复;对照事件/异步错误为何必须自己处理',
        element: lazy(() => import('../topics/advanced/error-boundary')),
    },
    {
        path: '/advanced/relay',
        title: 'Relay 数据流',
        category: 'advanced',
        description: 'GraphQL/Relay 的声明式数据获取(mock 数据)',
        element: lazy(() => import('../topics/advanced/relay')),
    },
    {
        path: '/advanced/rsc-guide',
        title: 'RSC · 深度梳理',
        category: 'advanced',
        description: 'Server Component 与 SSR、Client Component 的分界,以及生产里何时把边界下沉到交互叶子',
        element: lazy(() => import('../topics/advanced/rsc/guide')),
    },
    {
        path: '/advanced/rsc-boundary',
        title: 'RSC · 边界示意',
        category: 'advanced',
        description: '用商品页切分 Server 与 Client:看包、载荷,以及 Client 不能 import Server',
        element: lazy(() => import('../topics/advanced/rsc/boundary')),
    },
    {
        path: '/advanced/view-transition-activity',
        title: 'ViewTransition 与 Activity',
        category: 'advanced',
        description: 'React 19.2 的两个新组件:声明式视图过渡(代码示意)与隐藏保活 Activity(三栏对照实验)',
        element: lazy(() => import('../topics/advanced/view-transition-activity')),
    },
    {
        path: '/advanced/check',
        title: '理解检验',
        category: 'advanced',
        description: '用来检验通信、Context、错误边界、组合和数据边界是否掌握。较难题标出星级和考察点',
        element: lazy(() => import('../topics/advanced/check')),
    },

    /* ---- 内部机制 ---- */
    {
        path: '/internals/runtime-map',
        title: '运行时总览',
        category: 'internals',
        description: '三个包、Element 与 Fiber、Render 与 Commit、Lane 与时间片,各管哪一段',
        element: lazy(() => import('../topics/internals/runtime-map')),
    },
    {
        path: '/internals/fiber',
        title: 'Fiber',
        category: 'internals',
        description: 'child / sibling / return 把调用栈展开成可暂停的链表,alternate 保留屏幕上的那一棵',
        element: lazy(() => import('../topics/internals/fiber')),
    },
    {
        path: '/internals/render',
        title: 'Render',
        category: 'internals',
        description: 'beginWork 向下比对,completeWork 向上收口;多子节点按 lastPlacedIndex 决定移动',
        element: lazy(() => import('../topics/internals/render')),
    },
    {
        path: '/internals/commit',
        title: 'Commit',
        category: 'internals',
        description: '同步改 DOM、绘制前的 layout、绘制后的 useEffect,以及为什么这段不能让出',
        element: lazy(() => import('../topics/internals/commit')),
    },
    {
        path: '/internals/update-queue',
        title: '更新队列',
        category: 'internals',
        description: 'setState 先入队再在 Render 里按顺序处理;批处理合并的是渲染次数',
        element: lazy(() => import('../topics/internals/update-queue')),
    },
    {
        path: '/internals/hooks-impl',
        title: 'Hooks 链表',
        category: 'internals',
        description: 'memoizedState 按调用顺序成链;条件调用会串位,use 不占这种槽',
        element: lazy(() => import('../topics/internals/hooks-impl')),
    },
    {
        path: '/internals/scheduler',
        title: 'Scheduler',
        category: 'internals',
        description: 'Lane 决定哪些更新进入这一轮,约 5ms 的时间片决定何时把主线程还回去',
        element: lazy(() => import('../topics/internals/scheduler')),
    },
    {
        path: '/internals/events',
        title: '合成事件',
        category: 'internals',
        description: '监听在根容器上,分发时沿 Fiber.return 重放捕获和冒泡;事件池已在 React 17 移除',
        element: lazy(() => import('../topics/internals/events')),
    },
    {
        path: '/internals/ssr',
        title: 'SSR 与水合',
        category: 'internals',
        description: '流式 HTML、hydrateRoot 复用已有 DOM,以及它和 RSC 不是同一条管线',
        element: lazy(() => import('../topics/internals/ssr')),
    },
    {
        path: '/internals/interview',
        title: '理解检验',
        category: 'internals',
        description: '六十道问答,用来检验前面九页是否掌握。先用要点自答,再对照展开,卡住就回到对应的梳理和演示',
        element: lazy(() => import('../topics/internals/interview')),
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
        path: '/apps/shopping-cart',
        title: '购物车',
        category: 'apps',
        description: '商品列表、搜索过滤与状态派生计算',
        element: lazy(() => import('../topics/apps/shopping-cart')),
    },
    {
        path: '/apps/bookkeeping',
        title: '记账本',
        category: 'apps',
        description: '表单校验、分类联动、汇总统计与表格展示',
        element: lazy(() => import('../topics/apps/bookkeeping')),
    },

    /* ---- Agent 实战 ---- */
    {
        path: '/agent/use-sync-external-store',
        title: 'useSyncExternalStore 深入梳理',
        category: 'agent',
        description: '外部 Store 订阅协议、并发一致性、Selector 与本演练架构设计说明',
        element: lazy(() => import('../topics/agent/sync-store-guide')),
    },
    {
        path: '/agent/agent-chat',
        title: 'Agent 对话运行时',
        category: 'agent',
        description: '模拟 SSE 事件流驱动外部 Runtime Store,UI 经 useSyncExternalStore 精准订阅',
        element: lazy(() => import('../topics/agent/agent-chat')),
    },

    /* ---- 性能优化 · 治理全链路 ---- */
    {
        path: '/performance/governance-guide',
        title: '性能治理 · 原则与约定',
        category: 'performance',
        description: '三目标五原则、阶段地图,以及一张可改的性能约定表',
        element: lazy(() => import('../topics/performance/governance/guide')),
    },
    {
        path: '/performance/metrics-lab',
        title: '性能治理 · 指标实验室',
        category: 'performance',
        description: '按场景切换北极星:CWV、业务完成时间与 AI 思考指标不能混用',
        element: lazy(() => import('../topics/performance/governance/metrics-lab')),
    },
    {
        path: '/performance/architecture-guide',
        title: '性能治理 · 架构关键路径',
        category: 'performance',
        description: '按区域决定何时生成、谁可以慢、首屏带哪些客户端成本',
        element: lazy(() => import('../topics/performance/governance/architecture')),
    },
    {
        path: '/performance/implement-lab',
        title: '性能治理 · 实现六规则',
        category: 'performance',
        description: '所有权、请求、调度、规模、资源、记忆化最后的对照演练',
        element: lazy(() => import('../topics/performance/governance/implement')),
    },
    {
        path: '/performance/diagnose-lab',
        title: '性能治理 · 排查演练',
        category: 'performance',
        description: '按用户现象选证据链,写出可验证假设,避免改错指标',
        element: lazy(() => import('../topics/performance/governance/diagnose')),
    },

    /* ---- 性能优化 · 渲染调度 ---- */
    {
        path: '/performance/render-scheduling-guide',
        title: '渲染调度深入梳理',
        category: 'performance',
        description: '并发渲染心智模型、三件套分工矩阵与工程实践细节',
        element: lazy(() => import('../topics/performance/render-scheduling-guide')),
    },
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

    /* ---- 性能优化 · AI-Native ---- */
    {
        path: '/performance/ai-native-guide',
        title: 'AI-Native · 指标金字塔',
        category: 'performance',
        description: 'CWV 是入场券;TTFUI 才是北极星。快但错不如慢但对',
        element: lazy(() => import('../topics/performance/ai-native/guide')),
    },
    {
        path: '/performance/ai-native-lab',
        title: 'AI-Native · 流式体验演练',
        category: 'performance',
        description: '拆开 TTFT / FTRT / TTFUI / TPOT / 取消,看开场白和批处理如何骗人',
        element: lazy(() => import('../topics/performance/ai-native/lab')),
    },
    {
        path: '/performance/ai-native-agent',
        title: 'AI-Native · Agent 工具链演练',
        category: 'performance',
        description: '规划、RAG、工具串行 vs 并行、取消计费,以及快但错的墙钟翻倍',
        element: lazy(() => import('../topics/performance/ai-native/agent-lab')),
    },

    /* ---- 性能优化 · React Compiler(独立页)与理解检验 ---- */
    {
        path: '/performance/react-compiler',
        title: 'React Compiler',
        category: 'performance',
        description: '自动记忆化的定位、手写 memo 的噪音对照、Rules of React 前提,以及开/不开的四步判断框架',
        element: lazy(() => import('../topics/performance/react-compiler')),
    },
    {
        path: '/performance/check',
        title: '理解检验',
        category: 'performance',
        description: '用来检验治理、指标、架构、调度、排查和 AI-Native 是否连成体系。资深题标出星级和考察点',
        element: lazy(() => import('../topics/performance/check')),
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
