/**
 * ============================================================================
 * 专题注册表 — topics.ts
 * ============================================================================
 *
 * 全站信息架构的单一数据源(Single Source of Truth)。
 * 路由、顶部导航、首页卡片、面包屑页头、document.title 全部从此注册表派生,
 * 新增一个演示专题只需:新建目录 + 在此注册一行,三处自动生效。
 *
 * 功能特点:
 * - 声明式注册:path/title/category/description/element
 * - 分类定义与专题定义集中管理,导航与路由永不失配
 * - 专题组件通过动态 import 按需加载(vue-router 懒加载)
 *
 * @module config/topics
 */

import {
    Collection,
    Connection,
    Cpu,
    Document,
    Grid,
    MagicStick,
    Odometer,
    SetUp,
} from '@element-plus/icons-vue';
import type { Component } from 'vue';

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 分类 key,决定专题在信息架构中的归属 */
export type CategoryKey =
    | 'basics'
    | 'reactivity'
    | 'composables'
    | 'advanced'
    | 'state'
    | 'architecture'
    | 'apps'
    | 'performance';

export interface TopicMeta {
    /** 路由路径,全站唯一,如 '/reactivity/ref-vs-reactive' */
    path: string;
    /** 专题标题,用于侧边栏菜单与卡片标题 */
    title: string;
    /** 所属分类 */
    category: CategoryKey;
    /** 一句话说明,用于首页卡片与专题页页头 */
    description: string;
    /** 懒加载的专题页面组件(vue-router 直接消费) */
    element: () => Promise<{ default: Component }>;
}

export interface CategoryMeta {
    key: CategoryKey;
    /** 分类路由前缀(裸前缀,与目录同名),如 '/reactivity' */
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
    /** 分组图标(Element Plus 图标组件) */
    icon: Component;
    /** 图标容器底色与前景色,如 'bg-indigo-50 text-indigo-600' */
    iconChip: string;
    /** 分类标识小圆点颜色 */
    dot: string;
    /** 文字强调色(卡片「开始练习」链接等) */
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
        title: 'Vue 基础',
        subtitle: '模板语法、事件表单、组件基础与生命周期',
        theme: {
            icon: Document,
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
        key: 'reactivity',
        basePath: '/reactivity',
        title: '响应式',
        subtitle: 'ref/reactive、computed/watch,以及 Proxy 背后的追踪与触发',
        theme: {
            icon: MagicStick,
            iconChip: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
            dot: 'bg-violet-500',
            text: 'text-violet-600 dark:text-violet-400',
            hoverBorder: 'hover:border-violet-200 dark:hover:border-violet-700',
            banner: {
                border: 'border-violet-100 dark:border-violet-900',
                bg: 'bg-violet-50/60 dark:bg-violet-950/40',
                text: 'text-violet-700 dark:text-violet-300',
                linkHover: 'hover:text-violet-700 dark:hover:text-violet-200',
            },
        },
    },
    {
        key: 'composables',
        basePath: '/composables',
        title: '组合式函数',
        subtitle: 'Composables 设计原则、原子演练与组合实战',
        theme: {
            icon: Connection,
            iconChip: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300',
            dot: 'bg-teal-500',
            text: 'text-teal-600 dark:text-teal-400',
            hoverBorder: 'hover:border-teal-200 dark:hover:border-teal-700',
            banner: {
                border: 'border-teal-100 dark:border-teal-900',
                bg: 'bg-teal-50/60 dark:bg-teal-950/40',
                text: 'text-teal-700 dark:text-teal-300',
                linkHover: 'hover:text-teal-700 dark:hover:text-teal-200',
            },
        },
    },
    {
        key: 'advanced',
        basePath: '/advanced',
        title: '进阶专题',
        subtitle: '组件通信、异步组件、Teleport/Transition 与错误处理',
        theme: {
            icon: SetUp,
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
        key: 'state',
        basePath: '/state',
        title: '状态管理',
        subtitle: 'Pinia 核心、store 设计,以及 provide/inject 的取舍',
        theme: {
            icon: Collection,
            iconChip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
            dot: 'bg-emerald-500',
            text: 'text-emerald-600 dark:text-emerald-400',
            hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-700',
            banner: {
                border: 'border-emerald-100 dark:border-emerald-900',
                bg: 'bg-emerald-50/60 dark:bg-emerald-950/40',
                text: 'text-emerald-700 dark:text-emerald-300',
                linkHover: 'hover:text-emerald-700 dark:hover:text-emerald-200',
            },
        },
    },
    {
        key: 'architecture',
        basePath: '/architecture',
        title: '原理与架构',
        subtitle: '编译时与运行时、虚拟 DOM Diff、Patch Flag 与渲染管线',
        theme: {
            icon: Cpu,
            iconChip: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
            dot: 'bg-fuchsia-500',
            text: 'text-fuchsia-700 dark:text-fuchsia-300',
            hoverBorder: 'hover:border-fuchsia-200 dark:hover:border-fuchsia-700',
            banner: {
                border: 'border-fuchsia-100 dark:border-fuchsia-900',
                bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/40',
                text: 'text-fuchsia-700 dark:text-fuchsia-300',
                linkHover: 'hover:text-fuchsia-800 dark:hover:text-fuchsia-200',
            },
        },
    },
    {
        key: 'apps',
        basePath: '/apps',
        title: '综合应用',
        subtitle: '贴近真实业务的完整功能演练,与 React 权衡录同名对照',
        theme: {
            icon: Grid,
            iconChip: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300',
            dot: 'bg-cyan-500',
            text: 'text-cyan-600 dark:text-cyan-400',
            hoverBorder: 'hover:border-cyan-200 dark:hover:border-cyan-700',
            banner: {
                border: 'border-cyan-100 dark:border-cyan-900',
                bg: 'bg-cyan-50/60 dark:bg-cyan-950/40',
                text: 'text-cyan-700 dark:text-cyan-300',
                linkHover: 'hover:text-cyan-700 dark:hover:text-cyan-200',
            },
        },
    },
    {
        key: 'performance',
        basePath: '/performance',
        title: '性能优化',
        subtitle: '懒加载、keep-alive、v-memo、大列表与响应式性能边界',
        theme: {
            icon: Odometer,
            iconChip: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
            dot: 'bg-amber-500',
            text: 'text-amber-600 dark:text-amber-400',
            hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-700',
            banner: {
                border: 'border-amber-100 dark:border-amber-900',
                bg: 'bg-amber-50/60 dark:bg-amber-950/40',
                text: 'text-amber-700 dark:text-amber-300',
                linkHover: 'hover:text-amber-700 dark:hover:text-amber-200',
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
    /* ---- Vue 基础 ---- */
    {
        path: '/basics/template-render',
        title: '模板语法与渲染',
        category: 'basics',
        description: '插值的表达式边界、v-if vs v-show 成本对照、v-for 与 key 的身份实验,及四态/权限/配置驱动渲染范式',
        element: () => import('@/topics/basics/template-render/index.vue'),
    },
    {
        path: '/basics/event-form',
        title: '事件与表单',
        category: 'basics',
        description: '事件修饰符、v-model 家族与自定义组件 v-model(defineModel + 自定义修饰符)',
        element: () => import('@/topics/basics/event-form/index.vue'),
    },
    {
        path: '/basics/component-basic',
        title: '组件基础',
        category: 'basics',
        description: 'props 契约与单向数据流、emits 事件上报、插槽三件套,及 scoped / :deep() / v-bind 样式',
        element: () => import('@/topics/basics/component-basic/index.vue'),
    },
    {
        path: '/basics/lifecycle',
        title: '生命周期',
        category: 'basics',
        description: '六钩子时间线实验、三幕职责边界,以及组合式函数如何取代散落的钩子',
        element: () => import('@/topics/basics/lifecycle/index.vue'),
    },
    {
        path: '/basics/check',
        title: '理解检验',
        category: 'basics',
        description: '检验模板编译、v-if/v-show 成本、key 身份、v-model、单向数据流、插槽与生命周期是否掌握',
        element: () => import('@/topics/basics/check/index.vue'),
    },

    /* ---- 响应式 ---- */
    {
        path: '/reactivity/ref-vs-reactive',
        title: 'ref vs reactive',
        category: 'reactivity',
        description: '解构断连、整体替换、模板解包三组对照实验,及「默认 ref」的团队约定',
        element: () => import('@/topics/reactivity/ref-vs-reactive/index.vue'),
    },
    {
        path: '/reactivity/computed-watch',
        title: 'computed 与 watch',
        category: 'reactivity',
        description: 'computed 缓存实测、可写 computed、watch 显式依赖 vs watchEffect 自动追踪,及三选一决策矩阵',
        element: () => import('@/topics/reactivity/computed-watch/index.vue'),
    },
    {
        path: '/reactivity/internals',
        title: '响应式原理',
        category: 'reactivity',
        description: '手写 30 行迷你响应式系统驱动真实 DOM,依赖图实时可视;对照 Vue 真身还差的工程细节',
        element: () => import('@/topics/reactivity/internals/index.vue'),
    },
    {
        path: '/reactivity/next-tick',
        title: 'nextTick 与批量更新',
        category: 'reactivity',
        description: '连改三次渲染一次的批处理实验、nextTick 前后读 DOM 实测,及真正需要 nextTick 的场景',
        element: () => import('@/topics/reactivity/next-tick/index.vue'),
    },
    {
        path: '/reactivity/shallow-family',
        title: 'shallow 家族与性能边界',
        category: 'reactivity',
        description: 'shallowRef/triggerRef 语义实验,5000 行数据深响应 vs 浅响应初始化成本实测',
        element: () => import('@/topics/reactivity/shallow-family/index.vue'),
    },
    {
        path: '/reactivity/check',
        title: '理解检验',
        category: 'reactivity',
        description: '检验 API 边界、缓存与惰性、依赖追踪、track/trigger、批处理与响应式边界是否掌握',
        element: () => import('@/topics/reactivity/check/index.vue'),
    },

    /* ---- 组合式函数 ---- */
    {
        path: '/composables/guide',
        title: '组合式函数深入梳理',
        category: 'composables',
        description: '抽象时机的四个信号、解剖三要素、签名约定,及与 mixins / 工具函数 / Pinia 的边界',
        element: () => import('@/topics/composables/guide/index.vue'),
    },
    {
        path: '/composables/playground',
        title: '组合式函数原子演练',
        category: 'composables',
        description: 'lib/ 的 9 个生产级原子 composable 逐个交互演示,每个都配契约测试',
        element: () => import('@/topics/composables/playground/index.vue'),
    },
    {
        path: '/composables/composition',
        title: '组合式函数组合实战',
        category: 'composables',
        description: '防抖 → 派生 URL → 请求四态 → 领域过滤:原子分层组合成 useUserSearch 的用户搜索实战',
        element: () => import('@/topics/composables/composition/index.vue'),
    },
    {
        path: '/composables/check',
        title: '理解检验',
        category: 'composables',
        description: '检验抽象时机、签名约定、副作用所有权、异步竞态与分层纪律',
        element: () => import('@/topics/composables/check/index.vue'),
    },

    /* ---- 状态管理 ---- */
    {
        path: '/state/pinia-core',
        title: 'Pinia 核心',
        category: 'state',
        description: 'setup 风格 store 三要素、异步 action、storeToRefs 解构实验与单例验证',
        element: () => import('@/topics/state/pinia-core/index.vue'),
    },
    {
        path: '/state/store-design',
        title: 'store 设计与模块化',
        category: 'state',
        description: '按领域切分、跨 store 单向组合、$patch/$reset,以及什么不该进 store',
        element: () => import('@/topics/state/store-design/index.vue'),
    },
    {
        path: '/state/persistence',
        title: '持久化与跨页共享',
        category: 'state',
        description: 'setup store × useLocalStorage 的字段级持久化,及 store 应用级单例的跨页验证',
        element: () => import('@/topics/state/persistence/index.vue'),
    },
    {
        path: '/state/decision',
        title: '状态通道决策',
        category: 'state',
        description: 'provide/inject vs Pinia 的四问决策框架;Vuex 的历史定位(仅提及)',
        element: () => import('@/topics/state/decision/index.vue'),
    },
    {
        path: '/state/check',
        title: '理解检验',
        category: 'state',
        description: '检验 Pinia 心智模型、解构陷阱、模块化、批量提交、持久化安全与通道选型',
        element: () => import('@/topics/state/check/index.vue'),
    },

    /* ---- 进阶专题 ---- */
    {
        path: '/advanced/component-comm-guide',
        title: '组件通信 · 决策梳理',
        category: 'advanced',
        description: '四问定归属,再沿通道梯子(props/emits → v-model → 插槽 → provide/inject → URL → Pinia)选型',
        element: () => import('@/topics/advanced/component-comm/guide/index.vue'),
    },
    {
        path: '/advanced/component-comm-playground',
        title: '组件通信 · 模式演练',
        category: 'advanced',
        description: '同一份数据走六种通道的对照演练:接线方式、适用信号与红线',
        element: () => import('@/topics/advanced/component-comm/playground/index.vue'),
    },
    {
        path: '/advanced/component-comm-practice',
        title: '组件通信 · 工作台实战',
        category: 'advanced',
        description: '工单工作台:筛选归 URL、选中归组件、草稿归本地、改派走上报——四问的落地',
        element: () => import('@/topics/advanced/component-comm/practice/index.vue'),
    },
    {
        path: '/advanced/async-suspense',
        title: '异步组件与 Suspense',
        category: 'advanced',
        description: 'defineAsyncComponent 代码分割、Suspense 的等待态编排与 fallback 粒度决策',
        element: () => import('@/topics/advanced/async-suspense/index.vue'),
    },
    {
        path: '/advanced/teleport-transition',
        title: 'Teleport 与 Transition',
        category: 'advanced',
        description: '弹层挂到 body 逃离层叠上下文;单元素过渡与 TransitionGroup 的 FLIP 列表动画',
        element: () => import('@/topics/advanced/teleport-transition/index.vue'),
    },
    {
        path: '/advanced/directive-plugin',
        title: '自定义指令与插件',
        category: 'advanced',
        description: 'v-focus/v-highlight 指令解剖、app.use 安装协议,及指令 vs 组件 vs composable 的边界',
        element: () => import('@/topics/advanced/directive-plugin/index.vue'),
    },
    {
        path: '/advanced/error-handling',
        title: '错误处理',
        category: 'advanced',
        description: 'onErrorCaptured 边界实验(崩溃/降级/恢复)、边界抓不到的三类错误与三层兜底',
        element: () => import('@/topics/advanced/error-handling/index.vue'),
    },
    {
        path: '/advanced/check',
        title: '理解检验',
        category: 'advanced',
        description: '检验通道选型、代码分割、Teleport 语义、列表过渡、抽象选型与错误分层',
        element: () => import('@/topics/advanced/check/index.vue'),
    },

    /* ---- 综合应用 ---- */
    {
        path: '/apps/todo',
        title: '待办事项清单',
        category: 'apps',
        description: '增删改查、筛选、优先级与 localStorage 持久化(Pinia + Element Plus)',
        element: () => import('@/topics/apps/todo/index.vue'),
    },
    {
        path: '/apps/shopping-cart',
        title: '购物车',
        category: 'apps',
        description: '商品列表、搜索过滤与购物车派生计算——总价总数一律 computed,不存第二份',
        element: () => import('@/topics/apps/shopping-cart/index.vue'),
    },
    {
        path: '/apps/bookkeeping',
        title: '记账本',
        category: 'apps',
        description: 'ElForm 校验、分类二级联动、收支汇总统计与 ElTable 明细',
        element: () => import('@/topics/apps/bookkeeping/index.vue'),
    },

    /* ---- 原理与架构 ---- */
    {
        path: '/architecture/compile-runtime',
        title: '编译时与运行时',
        category: 'architecture',
        description: '模板 → render → VNode → DOM 流水线;编译期静态分析为什么是 Vue 独有的优化地盘',
        element: () => import('@/topics/architecture/compile-runtime/index.vue'),
    },
    {
        path: '/architecture/vdom-diff',
        title: '虚拟 DOM 与 Diff',
        category: 'architecture',
        description: 'VNode 解剖、同层双端比较步进演示、key 与最长递增子序列,及 VDOM 的边界',
        element: () => import('@/topics/architecture/vdom-diff/index.vue'),
    },
    {
        path: '/architecture/compile-optimization',
        title: '编译优化三件套',
        category: 'architecture',
        description: 'Patch Flag 标记动态绑定、Block Tree 跳过静态子树、静态提升复用不变节点',
        element: () => import('@/topics/architecture/compile-optimization/index.vue'),
    },
    {
        path: '/architecture/render-pipeline',
        title: '渲染管线与调度器',
        category: 'architecture',
        description: '一次更新的八步旅程;调度器的去重/排序/微任务三设计与 flush 三档',
        element: () => import('@/topics/architecture/render-pipeline/index.vue'),
    },
    {
        path: '/architecture/check',
        title: '理解检验',
        category: 'architecture',
        description: '检验双引擎分界、Patch Flag、Block Tree、静态提升、LIS 与调度器是否连成体系',
        element: () => import('@/topics/architecture/check/index.vue'),
    },

    /* ---- 性能优化 ---- */
    {
        path: '/performance/lazy-bundle',
        title: '懒加载与包体积',
        category: 'performance',
        description: '路由级/组件级代码分割、第三方依赖治理与加载时机策略',
        element: () => import('@/topics/performance/lazy-bundle/index.vue'),
    },
    {
        path: '/performance/keepalive-vmemo',
        title: 'keep-alive 与 v-memo',
        category: 'performance',
        description: 'Tab 切换保活实验(activated/deactivated)与 v-memo 按依赖跳过子树',
        element: () => import('@/topics/performance/keepalive-vmemo/index.vue'),
    },
    {
        path: '/performance/virtual-list',
        title: '大列表与虚拟滚动',
        category: 'performance',
        description: '手写 40 行迷你虚拟列表:10000 行数据,DOM 常数级;生产使用清单',
        element: () => import('@/topics/performance/virtual-list/index.vue'),
    },
    {
        path: '/performance/reactivity-perf',
        title: '响应式性能边界',
        category: 'performance',
        description: '成本来源地图(深代理/deep watch/巨型 computed/effect 爆炸)与减压手段',
        element: () => import('@/topics/performance/reactivity-perf/index.vue'),
    },
    {
        path: '/performance/check',
        title: '理解检验',
        category: 'performance',
        description: '检验代码分割、keep-alive、v-memo、虚拟滚动与响应式成本;元规则:先测量再优化',
        element: () => import('@/topics/performance/check/index.vue'),
    },
];

/* =================================================================
 * 派生工具函数
 * ================================================================ */

/** 按分类筛选专题,顺序与注册表一致 */
export const getTopicsByCategory = (category: CategoryKey): TopicMeta[] =>
    TOPICS.filter((t) => t.category === category);

/** 根据当前路径推导所属分类(用于顶部导航高亮与面包屑) */
export const getCategoryByPath = (pathname: string): CategoryMeta | undefined =>
    CATEGORIES.find((c) => pathname.startsWith(c.basePath));

/** 根据路径查找专题元信息 */
export const getTopicByPath = (pathname: string): TopicMeta | undefined =>
    TOPICS.find((t) => t.path === pathname);

/** 分类下第一个专题的路径(顶部导航/侧边栏的落点;无专题时回退首页锚点) */
export const getCategoryLandingPath = (key: CategoryKey): string => {
    const first = getTopicsByCategory(key)[0];
    const category = getCategoryMeta(key);
    return first ? first.path : `/#cat-${category.key}`;
};
