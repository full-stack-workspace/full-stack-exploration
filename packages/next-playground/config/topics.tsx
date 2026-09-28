/**
 * ============================================================================
 * 专题注册表 — 全站单一数据源
 * ============================================================================
 *
 * 顶栏导航、侧边栏、首页卡片、页面 metadata 全部从本文件派生。
 *
 * 新增专题三步：
 * 1. 新建 `app/<category.basePath 去掉前导斜杠>/<name>/page.tsx` 薄壳
 *    （导出 metadata + 渲染 topics/ 下的专题组件）
 * 2. 新建 `topics/<category>/<name>/index.tsx` 编写专题内容
 * 3. 在下方 TOPICS 数组注册一行（path 必须与 app/ 路由一致）
 *
 * 注意：App Router 的路由由文件系统决定，注册表只驱动导航与元信息，
 * 不要用注册表去「生成路由」。
 *
 * @module config/topics
 */

/* =================================================================
 * 类型定义
 * ================================================================ */

/** 分类 key;metadata / engineering 分类的专题在后续阶段落地 */
export type CategoryKey =
    | "rendering"
    | "rsc-boundary"
    | "router"
    | "data"
    | "metadata"
    | "engineering"
    | "ai-native";

/** 专题状态:planned 的条目暂不出现在导航与首页 */
export type TopicStatus = "done" | "wip" | "planned";

/**
 * 分类视觉主题。
 * 所有 Tailwind 类名必须是完整字面量(会被构建期扫描),禁止动态拼接。
 */
export interface CategoryTheme {
    /** 分类色点,如 "bg-amber-500" */
    dot: string;
    /** 分类标题文字色,如 "text-amber-600 dark:text-amber-400" */
    text: string;
    /** 计数徽标底色,如 "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" */
    chip: string;
    /** 卡片悬浮边框,如 "hover:border-amber-200 dark:hover:border-amber-700" */
    hoverBorder: string;
}

export interface CategoryMeta {
    key: CategoryKey;
    /** 分类路由前缀,如 "/rendering";也是侧边栏/顶栏高亮匹配依据 */
    basePath: string;
    title: string;
    subtitle: string;
    theme: CategoryTheme;
}

export interface TopicMeta {
    /** 与 app/ 下路由一致的全站唯一路径,如 "/rendering/isr" */
    path: string;
    title: string;
    category: CategoryKey;
    /** 一句话描述:首页卡片、专题页头、metadata.description 三处共用 */
    description: string;
    /** 注入 generateMetadata 的 SEO 关键词 */
    keywords?: string[];
    status?: TopicStatus;
}

/* =================================================================
 * 分类注册(数组顺序即顶栏导航顺序)
 * ================================================================ */

export const CATEGORIES: CategoryMeta[] = [
    {
        key: "rendering",
        basePath: "/rendering",
        title: "渲染策略",
        subtitle: "SSG / ISR / SSR / Streaming / PPR 的光谱与选择",
        theme: {
            dot: "bg-amber-500",
            text: "text-amber-600 dark:text-amber-400",
            chip: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300",
            hoverBorder: "hover:border-amber-200 dark:hover:border-amber-700",
        },
    },
    {
        key: "rsc-boundary",
        basePath: "/rsc-boundary",
        title: "Server/Client 边界",
        subtitle: "RSC 优先;客户端 JS 是显式 opt-in",
        theme: {
            dot: "bg-indigo-500",
            text: "text-indigo-600 dark:text-indigo-400",
            chip: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
            hoverBorder: "hover:border-indigo-200 dark:hover:border-indigo-700",
        },
    },
    {
        key: "router",
        basePath: "/router",
        title: "路由机制",
        subtitle: "文件系统路由、约定文件与导航缓存",
        theme: {
            dot: "bg-sky-500",
            text: "text-sky-600 dark:text-sky-400",
            chip: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
            hoverBorder: "hover:border-sky-200 dark:hover:border-sky-700",
        },
    },
    {
        key: "data",
        basePath: "/data",
        title: "数据与缓存",
        subtitle: "四层缓存心智模型与取数通道选择",
        theme: {
            dot: "bg-emerald-500",
            text: "text-emerald-600 dark:text-emerald-400",
            chip: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
            hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-700",
        },
    },
    {
        key: "ai-native",
        basePath: "/ai-native",
        title: "AI-Native 与 Agent",
        subtitle: "流式端点、Generative UI 与长任务体验",
        theme: {
            dot: "bg-violet-500",
            text: "text-violet-600 dark:text-violet-400",
            chip: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
            hoverBorder: "hover:border-violet-200 dark:hover:border-violet-700",
        },
    },
];

/* =================================================================
 * 专题注册(数组顺序即侧边栏与首页展示顺序)
 * ================================================================ */

export const TOPICS: TopicMeta[] = [
    {
        path: "/rendering/isr",
        title: "ISR 与静态再生",
        category: "rendering",
        description:
            "revalidate=60 的增量静态再生:页面预渲染为静态 HTML,过期后后台重建;generateMetadata 与页面共享 cache() 记忆化请求",
        keywords: ["ISR", "revalidate", "SSG", "React cache"],
    },
    {
        path: "/rsc-boundary/props-boundary",
        title: "Server/Client 边界",
        category: "rsc-boundary",
        description:
            "page 保持 Server Component 预渲染,交互(搜索/添加)下沉到 Client Component;初始数据以 props 跨越边界",
        keywords: ["RSC", "use client", "序列化", "边界下沉"],
    },
    {
        path: "/router/dynamic-routes",
        title: "动态路由与动态 metadata",
        category: "router",
        description:
            "[id] 动态段 + useParams 客户端取参;Client 页面无法导出 metadata 时,用同级 layout 的 generateMetadata 兜底",
        keywords: ["动态路由", "generateMetadata", "useParams"],
    },
    {
        path: "/data/route-handlers",
        title: "Route Handler",
        category: "data",
        description:
            "GET/POST/PUT/DELETE 四方法端点;Route Handler 与页面取数相互独立,各自直连外部服务避免构建期自调用",
        keywords: ["Route Handler", "REST", "NextResponse"],
    },
    {
        path: "/ai-native/streaming-endpoint",
        title: "AI 流式响应",
        category: "ai-native",
        description:
            "以 AI 模型列表为场景模拟流式加载:Suspense 骨架 + async generator 分段输出,感受「边生成边渲染」的体验基线",
        keywords: ["Streaming", "Suspense", "AI", "async generator"],
    },
];

/* =================================================================
 * 派生工具函数
 * ================================================================ */

/** 按 key 取分类元信息 */
export const getCategoryMeta = (key: CategoryKey): CategoryMeta | undefined =>
    CATEGORIES.find((c) => c.key === key);

/** 取分类下的专题(保持注册顺序;默认不含 planned) */
export const getTopicsByCategory = (
    category: CategoryKey,
    { includePlanned = false }: { includePlanned?: boolean } = {},
): TopicMeta[] =>
    TOPICS.filter(
        (t) =>
            t.category === category &&
            (includePlanned || (t.status ?? "done") !== "planned"),
    );

/** 由路径反查所属分类(顶栏高亮与侧边栏内容依据) */
export const getCategoryByPath = (pathname: string): CategoryMeta | undefined =>
    CATEGORIES.find(
        (c) => pathname === c.basePath || pathname.startsWith(`${c.basePath}/`),
    );

/**
 * 由路径反查专题。
 * 先精确匹配;再取「最长前缀匹配」,使 /router/dynamic-routes/3 命中
 * /router/dynamic-routes(动态段详情页归属其专题)。
 */
export const getTopicByPath = (pathname: string): TopicMeta | undefined => {
    const exact = TOPICS.find((t) => t.path === pathname);
    if (exact) {return exact;}
    return TOPICS.filter(
        (t) => t.status !== "planned" && pathname.startsWith(`${t.path}/`),
    ).sort((a, b) => b.path.length - a.path.length)[0];
};

/** 分类的第一个可访问专题(顶栏点击分类时的跳转目标) */
export const getCategoryFirstPath = (key: CategoryKey): string => {
    const first = getTopicsByCategory(key)[0];
    return first ? first.path : getCategoryMeta(key)?.basePath ?? "/";
};
