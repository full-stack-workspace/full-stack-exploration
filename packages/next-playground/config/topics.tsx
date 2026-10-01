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

/** 分类 key */
export type CategoryKey =
    | "rendering"
    | "rsc-boundary"
    | "router"
    | "data"
    | "metadata"
    | "engineering"
    | "security"
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
    /**
     * 相关专题 path 数组(建议双向填写):
     * TopicPage 页尾据此渲染「相关专题」互链行
     */
    related?: string[];
}

/* =================================================================
 * 分类注册(数组顺序即顶栏导航顺序)
 * ================================================================ */

export const CATEGORIES: CategoryMeta[] = [
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
        key: "metadata",
        basePath: "/metadata",
        title: "Metadata 与 SEO",
        subtitle: "metadata 流水线:静态导出、动态生成与约定文件",
        theme: {
            dot: "bg-rose-500",
            text: "text-rose-600 dark:text-rose-400",
            chip: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
            hoverBorder: "hover:border-rose-200 dark:hover:border-rose-700",
        },
    },
    {
        key: "engineering",
        basePath: "/engineering",
        title: "工程化",
        subtitle: "中间件边界、缓存策略设计与资产性能治理",
        theme: {
            dot: "bg-slate-500",
            text: "text-slate-600 dark:text-slate-400",
            chip: "bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300",
            hoverBorder: "hover:border-slate-300 dark:hover:border-slate-700",
        },
    },
    {
        key: "security",
        basePath: "/security",
        title: "安全",
        subtitle: "安全响应头与 CSP、Server/Client 信任边界",
        theme: {
            dot: "bg-red-500",
            text: "text-red-600 dark:text-red-400",
            chip: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300",
            hoverBorder: "hover:border-red-200 dark:hover:border-red-700",
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
    /* ------------------------- Server/Client 边界 ------------------------- */
    {
        path: "/rsc-boundary/guide",
        title: "RSC 心智模型",
        category: "rsc-boundary",
        description:
            "为什么默认 Server:RSC 载荷是序列化的 UI 描述;每条 'use client' 边界都是一次 bundle 切点与序列化约束;Client 嵌 Server 走 children 槽",
        keywords: ["RSC", "心智模型", "use client", "children 槽"],
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
        path: "/rsc-boundary/server-actions",
        title: "Server Actions 留言板",
        category: "rsc-boundary",
        description:
            "'use server' 变更 + <form action> 渐进增强:无 JS 也能提交;action 里 revalidatePath,列表随响应刷新",
        keywords: ["Server Actions", "use server", "渐进增强", "revalidatePath"],
        related: ["/data/forms", "/security/boundaries"],
    },
    {
        path: "/rsc-boundary/check",
        title: "理解检验",
        category: "rsc-boundary",
        description:
            "7 道问答,覆盖 \"use client\" 边界切点、children 槽、Flight 序列化约束、Server Actions 三件套与渐进增强。先用要点自答,再展开对照",
        keywords: ["理解检验", "RSC", "use client", "Server Actions", "Flight"],
    },
    /* ------------------------------ 渲染策略 ------------------------------ */
    {
        path: "/rendering/spectrum",
        title: "渲染光谱梳理",
        category: "rendering",
        description:
            "SSG → ISR → SSR → Streaming → PPR 不是五个开关而是一条光谱:按首字节来源、数据新鲜度与服务器成本定位每格,按路由甚至按组件混用",
        keywords: ["SSG", "ISR", "SSR", "Streaming", "PPR", "渲染策略"],
        related: ["/rendering/ssr", "/rendering/streaming", "/rendering/ppr"],
    },
    {
        path: "/rendering/isr",
        title: "ISR 与静态再生",
        category: "rendering",
        description:
            "\"use cache\" + cacheLife({ revalidate: 60 }) 的增量静态再生:产物预渲染并缓存,过期后后台重建;generateMetadata 与页面共享同一份缓存条目",
        keywords: ["ISR", "use cache", "cacheLife", "revalidate", "React cache"],
        related: ["/data/cache-layers", "/engineering/caching-strategy", "/data/revalidation"],
    },
    {
        path: "/rendering/ssr",
        title: "SSR 请求时整页渲染",
        category: "rendering",
        description:
            "请求时渲染的内容:每次请求都在服务器现算完再补出。刷新本页,时刻和请求号都会变。只有内容必须实时时才落在这一格",
        keywords: ["SSR", "connection", "动态渲染", "Suspense"],
        related: ["/rendering/streaming", "/rendering/ppr", "/rendering/spectrum"],
    },
    {
        path: "/rendering/streaming",
        title: "Streaming SSR 与 Suspense 粒度",
        category: "rendering",
        description:
            "cacheComponents 下的真实流式渲染:静态壳构建期预渲染先行吐出,三个不同时延的异步区块作为动态洞各自包 Suspense 分段到达;边界粒度决定谁阻塞谁",
        keywords: ["Streaming SSR", "Suspense", "TTFB", "cacheComponents"],
        related: ["/rendering/ssr", "/rendering/ppr", "/rendering/spectrum", "/rendering/view-transition"],
    },
    {
        path: "/rendering/ppr",
        title: "PPR 与 Cache Components",
        category: "rendering",
        description:
            "本站已全站开启 cacheComponents:取数默认动态,\"use cache\" 显式标记静态部分;静态壳预渲染进 CDN,动态洞经 Suspense 流式补出 —— 本页即是活演示",
        keywords: ["PPR", "Cache Components", "use cache", "cacheLife", "cacheTag"],
        related: ["/rendering/ssr", "/rendering/streaming", "/rendering/spectrum"],
    },
    {
        path: "/rendering/view-transition",
        title: "页面转场 ViewTransition",
        category: "rendering",
        description:
            "React 19.2 的 <ViewTransition> 经 Next 16 experimental.viewTransition 接进路由导航;本站顶栏与每个专题页已在真实使用方向感知转场 —— 本页把这条已实装的链路讲透",
        keywords: ["ViewTransition", "view-transition", "transitionTypes", "页面转场"],
        related: ["/rendering/streaming"],
    },
    {
        path: "/rendering/check",
        title: "理解检验",
        category: "rendering",
        description:
            "7 道问答,覆盖 SSG/ISR/SSR/Streaming/PPR 选型、cacheComponents 新模型、ISR 的 SWR 语义与构建输出路由表读法。先用要点自答,再展开对照",
        keywords: ["理解检验", "渲染策略", "cacheComponents", "ISR", "PPR"],
    },
    /* ------------------------------ 路由机制 ------------------------------ */
    {
        path: "/router/dynamic-routes",
        title: "动态路由与动态 metadata",
        category: "router",
        description:
            "[id] 动态段保持 Server Component:generateStaticParams 预生成已知 id,generateMetadata 与页面同文件;不存在的 id 走 notFound()",
        keywords: ["动态路由", "generateMetadata", "generateStaticParams", "notFound"],
    },
    {
        path: "/router/conventions",
        title: "约定文件对照",
        category: "router",
        description:
            "page / layout / loading / error / not-found / template / default 各管什么:一张对照表 + 嵌套层级示意;本页自带真实 loading.tsx 演示 Suspense 边界",
        keywords: ["约定文件", "loading", "error", "template", "Suspense"],
        related: ["/router/route-groups"],
    },
    {
        path: "/router/errors",
        title: "错误与未找到",
        category: "router",
        description:
            "error.tsx 接渲染失败,not-found.tsx 接 notFound(),unauthorized/forbidden 接 401/403 认证中断;global-error.tsx 是根布局崩溃时换掉整个文档的最后一道",
        keywords: ["error.tsx", "not-found", "notFound", "unauthorized", "forbidden", "global-error"],
        related: ["/router/parallel"],
    },
    {
        path: "/router/parallel",
        title: "平行路由与拦截",
        category: "router",
        description:
            "同一条 URL,两种渲染:从列表点进去是弹层(列表不卸载),刷新或硬导航是完整页。@modal 负责槽,(.)shot 负责拦截,default.tsx 保证直接打开列表时槽是空的",
        keywords: ["平行路由", "拦截路由", "modal", "default.tsx"],
        related: ["/router/errors"],
    },
    {
        path: "/router/navigation",
        title: "导航与 Router Cache",
        category: "router",
        description:
            "Link 的 prefetch 默认行为、useRouter 的 push/replace/back/refresh,以及「为什么页面不刷新」的排查入口",
        keywords: ["Link", "prefetch", "useRouter", "Router Cache"],
        related: ["/data/cache-layers"],
    },
    {
        path: "/router/route-groups",
        title: "路由组与多根布局",
        category: "router",
        description:
            "(folder) 组织路由却不占 URL 段:组级 layout 按组圈定外壳,多根布局让营销站与应用壳在同一仓库共存;本页附带一个真实路由组活演示",
        keywords: ["路由组", "Route Groups", "layout", "多根布局"],
        related: ["/router/conventions"],
    },
    {
        path: "/router/i18n",
        title: "国际化路由",
        category: "router",
        description:
            "语言放进 URL 第一段:[lang] 动态段 + 字典模块 + generateStaticParams 预生成,非法语言走 notFound();再对照 middleware 重定向与子域名方案,划清「什么时候别自己拼」",
        keywords: ["i18n", "国际化", "[lang]", "generateStaticParams"],
    },
    /* ------------------------------ 数据与缓存 ----------------------------- */
    {
        path: "/data/cache-layers",
        title: "四层缓存对照台",
        category: "data",
        description:
            "Request Memoization / Data Cache / Full Route Cache / Router Cache:四层各管一段生命周期,「时新时不新」先定位是哪一层;四层名称出自旧模型,文末附 cacheComponents 演进备注",
        keywords: ["缓存", "Data Cache", "Full Route Cache", "Router Cache", "revalidate"],
        related: ["/rendering/isr", "/engineering/caching-strategy", "/data/revalidation", "/router/navigation"],
    },
    {
        path: "/data/revalidation",
        title: "按需失效实战",
        category: "data",
        description:
            "cacheTag 打标 + revalidateTag/updateTag 精准唤醒:SWR 与立即过期两种语义在同一份缓存产物上对照,tag 与 path 的失效粒度选择",
        keywords: ["revalidateTag", "updateTag", "revalidatePath", "cacheTag", "按需失效"],
        related: ["/rendering/isr", "/data/cache-layers", "/engineering/caching-strategy"],
    },
    {
        path: "/data/route-handlers",
        title: "Route Handler",
        category: "data",
        description:
            "GET/POST/PUT/DELETE 四方法端点;Route Handler 与页面取数相互独立,各自直连外部服务避免构建期自调用",
        keywords: ["Route Handler", "REST", "NextResponse"],
        related: ["/data/dynamic-apis"],
    },
    {
        path: "/data/forms",
        title: "表单进阶:校验与错误回显",
        category: "data",
        description:
            "zod 在 Server Action 里做权威校验:z.flattenError 拆出字段级错误回显到输入框下方;对照不设校验的 action 会收下什么",
        keywords: ["Server Actions", "zod", "表单校验", "useActionState", "渐进增强"],
        related: ["/rsc-boundary/server-actions"],
    },
    {
        path: "/data/dynamic-apis",
        title: "动态 API 各一格",
        category: "data",
        description:
            "cookies / headers / connection / after 四个请求级 API 的活演示:前三个让所在格退出静态、必须待在 Suspense 洞内,after 在响应返回后收尾",
        keywords: ["cookies", "headers", "connection", "after", "动态渲染"],
        related: ["/data/route-handlers"],
    },
    {
        path: "/data/client-fetching",
        title: "客户端取数与 SWR",
        category: "data",
        description:
            "客户端取数的正确打开方式:能在 Server Component 里 await 就别用 SWR;但会话数据、聚焦重验证、轮询、离线缓存仍是 SWR 的主场",
        keywords: ["SWR", "客户端取数", "revalidateOnFocus", "轮询"],
    },
    {
        path: "/data/check",
        title: "理解检验",
        category: "data",
        description:
            "7 道问答,覆盖四层缓存与模型演进、四个失效/刷新 API 的分工、zod 校验位置、动态 API 与 Suspense 洞、SWR 适用边界。先用要点自答,再展开对照",
        keywords: ["理解检验", "缓存", "revalidateTag", "updateTag", "SWR", "zod"],
    },
    /* ---------------------------- Metadata 与 SEO ---------------------------- */
    {
        path: "/metadata/guide",
        title: "metadata 流水线",
        category: "metadata",
        description:
            "静态 metadata / generateMetadata / 约定文件的合并顺序;本站 title.template 与 getTopicMetadata 的真实例子",
        keywords: ["metadata", "generateMetadata", "title.template", "SEO", "Open Graph"],
    },
    {
        path: "/metadata/crawl",
        title: "爬虫文件与结构化数据",
        category: "metadata",
        description:
            "metadata 对象负责 head 里的标题和描述。sitemap、robots 是给爬虫的文件;JSON-LD 是给搜索结果的结构化数据。三件事不要塞进同一个 export",
        keywords: ["sitemap", "robots", "JSON-LD", "SEO"],
    },
    /* ------------------------------- 工程化 ------------------------------- */
    {
        path: "/engineering/middleware",
        title: "Proxy 与中间件",
        category: "engineering",
        description:
            "Next 16 的 proxy.ts 固定跑在 Node;本站仍用 middleware.ts 做边缘改头演示,页面能读到同一枚请求头。matcher 之外的路由不会经过它",
        keywords: ["middleware", "matcher", "NextResponse", "边缘"],
    },
    {
        path: "/engineering/caching-strategy",
        title: "缓存策略设计",
        category: "engineering",
        description:
            "给一个页面定缓存方案的决策流程:数据归属 → 新鲜度要求 → 变更触发方式,落到 cacheLife / cacheTag / revalidateTag / 默认动态",
        keywords: ["缓存策略", "cacheLife", "cacheTag", "revalidateTag", "use cache"],
        related: ["/rendering/isr", "/data/cache-layers", "/data/revalidation"],
    },
    {
        path: "/engineering/asset-perf",
        title: "Image/Font 与包体治理",
        category: "engineering",
        description:
            "next/image 的尺寸/懒加载/格式协商、next/font 的自托管零 CLS,以及动态 import 与客户端边界下沉的包体治理",
        keywords: ["next/image", "next/font", "CLS", "代码分割", "bundle"],
    },
    {
        path: "/engineering/build-deploy",
        title: "构建、测量与部署",
        category: "engineering",
        description:
            "Turbopack 已是 Next 16 默认打包器;@next/bundle-analyzer 以 --webpack 回退实装(pnpm analyze 可跑,报告在 .next/analyze/);部署侧讲 standalone 自托管、instrumentation + OTel 与 after()",
        keywords: ["Turbopack", "bundle analyzer", "standalone", "instrumentation", "OpenTelemetry", "after"],
    },
    /* -------------------------------- 安全 -------------------------------- */
    {
        path: "/security/headers",
        title: "安全响应头与 CSP",
        category: "security",
        description:
            "next.config.ts 的 headers() 把五个安全头只挂到 /security/*:本页客户端 HEAD 请求读出自己的响应头当活证据;CSP 的演示级 'unsafe-inline' 正是「全站要 nonce」的反面教材",
        keywords: ["CSP", "安全响应头", "nonce", "X-Frame-Options", "Permissions-Policy"],
        related: ["/security/boundaries"],
    },
    {
        path: "/security/boundaries",
        title: "信任边界:环境变量、taint 与 Server Actions",
        category: "security",
        description:
            "三条边界各一格:同两个环境变量在 Server/Client 两侧的对照读数、React taint APIs 的防手滑保险丝、以及「Server Action 是公开 HTTP 端点」的入参校验心智",
        keywords: ["环境变量", "NEXT_PUBLIC", "taint", "Server Actions", "server-only"],
        related: ["/security/headers", "/rsc-boundary/server-actions"],
    },
    /* --------------------------- AI-Native 与 Agent --------------------------- */
    {
        path: "/ai-native/streaming-endpoint",
        title: "AI 流式响应",
        category: "ai-native",
        description:
            "真实 SSE 流式端点:Route Handler 用 ReadableStream 逐 token 推送,前端 getReader() 边收边渲染;TTFT 才是用户感知的「快」,取消即省计费",
        keywords: ["SSE", "ReadableStream", "TTFT", "AbortController", "流式端点"],
        related: ["/ai-native/generative-ui", "/ai-native/agent-page", "/ai-native/ai-sdk"],
    },
    {
        path: "/ai-native/generative-ui",
        title: "Generative UI",
        category: "ai-native",
        description:
            "模型输出结构化工具调用,UI 层做组件映射:天气卡片、股价走势图、待办清单直接渲染成真实 React 组件,与文本气泡混排在同一条消息流",
        keywords: ["Generative UI", "工具调用", "function calling", "组件映射"],
        related: ["/ai-native/streaming-endpoint", "/ai-native/agent-page", "/ai-native/ai-sdk"],
    },
    {
        path: "/ai-native/agent-page",
        title: "Agent 长任务页",
        category: "ai-native",
        description:
            "多步 Agent 任务流的过程可视化:SSE 推送步骤事件,前端渲染 pending/running/done 时间线;串行 vs 并行墙钟对照,取消即省计费",
        keywords: ["Agent", "SSE", "步骤时间线", "并行工具调用", "可取消"],
        related: ["/ai-native/streaming-endpoint", "/ai-native/generative-ui", "/ai-native/ai-sdk"],
    },
    {
        path: "/ai-native/ai-sdk",
        title: "手写 SSE vs Vercel AI SDK",
        category: "ai-native",
        description:
            "同一个聊天场景做两遍:手写 ReadableStream + getReader() 对照 streamText + useChat;SDK 收编了分帧、取消与协议演进,还带来多 provider、tool calling 与 data parts",
        keywords: ["Vercel AI SDK", "useChat", "streamText", "UI Message Stream", "MockLanguageModel"],
        related: ["/ai-native/streaming-endpoint", "/ai-native/generative-ui", "/ai-native/agent-page"],
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

/**
 * 取专题的「相关专题」列表(页尾互链行数据源)。
 * related 里未注册或 planned 的 path 会被静默丢弃。
 */
export const getRelatedTopics = (pathname: string): TopicMeta[] => {
    const topic = getTopicByPath(pathname);
    if (!topic?.related) {return [];}
    return topic.related
        .map((p) => TOPICS.find((t) => t.path === p))
        .filter(
            (t): t is TopicMeta =>
                t !== undefined && (t.status ?? "done") !== "planned",
        );
};

/** 分类的第一个可访问专题(顶栏点击分类时的跳转目标) */
export const getCategoryFirstPath = (key: CategoryKey): string => {
    const first = getTopicsByCategory(key)[0];
    return first ? first.path : getCategoryMeta(key)?.basePath ?? "/";
};
