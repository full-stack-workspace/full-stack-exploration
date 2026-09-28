/**
 * ============================================================================
 * 渲染光谱梳理 — 渲染策略专题(guide 页)
 * ============================================================================
 *
 * 把 SSG / ISR / SSR / Streaming / PPR 摆到同一条光谱上做一页决策梳理:
 * 横向光谱图标注每格的「首字节来源 / 数据新鲜度 / 服务器成本」,
 * 再逐格给出「什么时候用它」,最后落到「渲染是光谱不是开关」的混用心智。
 *
 * 纯 Server Component,无交互;以结构化卡片承载决策信息。
 *
 * @module topics/rendering/spectrum
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import { cn } from "@/lib/utils";

/* =================================================================
 * 光谱数据(单一数据源,卡片与「什么时候用它」共用配色)
 * ================================================================ */

interface SpectrumStage {
    /** 策略名,如 "SSG" */
    name: string;
    /** 一句话机制,如 "构建期一次渲染" */
    tagline: string;
    /** 首字节 TTFB 来源 */
    ttfb: string;
    /** 数据新鲜度 */
    freshness: string;
    /** 服务器成本 */
    cost: string;
    /** 卡片配色(完整字面量,供构建期扫描) */
    theme: {
        card: string;
        badge: string;
    };
    /** 「什么时候用它」要点 */
    when: string[];
}

/**
 * 光谱从左到右:静态程度递减、实时性与服务器成本递增。
 * 配色随之由 emerald(最「省」)过渡到 rose(最「贵」)。
 */
const STAGES: SpectrumStage[] = [
    {
        name: "SSG",
        tagline: "构建期一次渲染,永久静态",
        ttfb: "CDN 上的静态 HTML 文件",
        freshness: "冻结在构建时刻",
        cost: "几乎为零(只有托管)",
        theme: {
            card: "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/40",
            badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        },
        when: [
            "内容对所有访客一致,且更新以「天/周」计:文档、营销页、博客正文",
            "流量越大越划算:渲染成本与请求量彻底脱钩",
            "需要最强 SEO 与最稳 TTFB 的落地页",
        ],
    },
    {
        name: "ISR",
        tagline: "静态缓存 + 过期后台重建",
        ttfb: "CDN 缓存(stale 也先返回旧版)",
        freshness: "最长落后一个 revalidate 窗口",
        cost: "极低(仅偶发重建)",
        theme: {
            card: "border-sky-200 bg-sky-50/60 dark:border-sky-800/60 dark:bg-sky-950/40",
            badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
        },
        when: [
            "内容会更新但能容忍分钟级延迟:文章列表、商品目录、榜单",
            "想要 SSG 的成本,又不想每次改内容都重新部署",
            "配合 revalidateTag 可按事件精确失效,逼近实时",
        ],
    },
    {
        name: "SSR",
        tagline: "每个请求在服务器现渲染",
        ttfb: "服务器渲染完才发出",
        freshness: "实时(请求时刻的数据)",
        cost: "每请求一次渲染,随流量线性增长",
        theme: {
            card: "border-amber-200 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/40",
            badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        },
        when: [
            "数据必须实时:库存、价格、仪表盘",
            "内容依赖 cookie/会话,千人千面(缓存无法共享)",
            "页面量少而实时性要求高,不值得为它设计缓存失效",
        ],
    },
    {
        name: "Streaming",
        tagline: "SSR 的分段形态,壳先到",
        ttfb: "静态壳立即吐出,慢数据分段补",
        freshness: "实时(同 SSR)",
        cost: "同 SSR,连接占用更久",
        theme: {
            card: "border-violet-200 bg-violet-50/60 dark:border-violet-800/60 dark:bg-violet-950/40",
            badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
        },
        when: [
            "页面必须动态,但内部数据有快有慢:慢的包进 Suspense,不拖整页",
            "首屏可以先给框架与快数据,让用户尽早看到「活的页面」",
            "AI 生成、搜索聚合等天然分段产出的场景",
        ],
    },
    {
        name: "PPR",
        tagline: "静态壳预渲染 + 动态洞流式补",
        ttfb: "CDN 静态壳 + 洞的流式分段",
        freshness: "壳冻结 / 洞实时,按组件各取所需",
        cost: "壳零成本,洞按请求计",
        theme: {
            card: "border-rose-200 bg-rose-50/60 dark:border-rose-800/60 dark:bg-rose-950/40",
            badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
        },
        when: [
            "一页之内动静悬殊:商品页(描述静态 + 推荐/库存动态)是教科书场景",
            "想把「按路由选策略」细化到「按组件选策略」",
            "Next 16 起经 cacheComponents 开启,详见 PPR 专题",
        ],
    },
];

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function SpectrumTopic() {
    return (
        <TopicPage
            title="渲染光谱梳理"
            description="SSG → ISR → SSR → Streaming → PPR 不是五个开关而是一条光谱:按首字节来源、数据新鲜度与服务器成本定位每格,按路由甚至按组件混用"
        >
            {/* 光谱总览:五格色块横向排列,移动端纵向堆叠 */}
            <TopicSection
                title="一条光谱,五种落点"
                note="从左到右:静态程度递减、实时性与服务器成本递增"
            >
                <div className="flex flex-col gap-3 lg:flex-row">
                    {STAGES.map((stage) => (
                        <div
                            key={stage.name}
                            className={cn(
                                "flex-1 rounded-xl border p-4",
                                stage.theme.card,
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block rounded-md px-2 py-0.5 text-sm font-bold",
                                    stage.theme.badge,
                                )}
                            >
                                {stage.name}
                            </span>
                            <p className="mt-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {stage.tagline}
                            </p>
                            <dl className="mt-3 space-y-2 text-xs leading-relaxed">
                                <div>
                                    <dt className="font-semibold text-neutral-500 dark:text-neutral-400">
                                        首字节来源
                                    </dt>
                                    <dd className="text-neutral-600 dark:text-neutral-300">
                                        {stage.ttfb}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-neutral-500 dark:text-neutral-400">
                                        数据新鲜度
                                    </dt>
                                    <dd className="text-neutral-600 dark:text-neutral-300">
                                        {stage.freshness}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-neutral-500 dark:text-neutral-400">
                                        服务器成本
                                    </dt>
                                    <dd className="text-neutral-600 dark:text-neutral-300">
                                        {stage.cost}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    ))}
                </div>
            </TopicSection>

            {/* 逐格决策:什么时候用它 */}
            <TopicSection
                title="每格什么时候用它"
                note="决策要点,而非 API 背诵"
            >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {STAGES.map((stage) => (
                        <div
                            key={stage.name}
                            className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60"
                        >
                            <span
                                className={cn(
                                    "inline-block rounded-md px-2 py-0.5 text-xs font-bold",
                                    stage.theme.badge,
                                )}
                            >
                                {stage.name}
                            </span>
                            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                {stage.when.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </TopicSection>

            {/* 心智模型:光谱不是开关 */}
            <TopicSection
                title="渲染是光谱,不是开关"
                note="同一应用按路由混用;Next 16 起 PPR 甚至可按组件混用"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        策略的粒度是<strong>路由段</strong>:每个 page/layout 用
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">dynamic</code>
                        /
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">revalidate</code>
                        各自声明,一个站点同时存在 SSG 文档页、ISR 列表页、SSR 仪表盘是常态
                    </li>
                    <li>
                        不要问「这个项目用 SSR 还是 SSG」,要问「这个路由的数据,变化频率 × 个性化程度 × SEO 要求,落在光谱哪一格」
                    </li>
                    <li>
                        Next 16 的 Cache Components(PPR)把粒度进一步细化到<strong>组件</strong>:静态壳与动态洞同页共存,见 PPR 专题
                    </li>
                    <li>
                        选型的默认方向是「尽量靠左」:能用静态就不要动态,动态部分用 Suspense 隔离成洞,而不是把整页拖下水
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
