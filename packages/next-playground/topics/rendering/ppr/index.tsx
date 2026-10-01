/**
 * ============================================================================
 * PPR 与 Cache Components — 渲染策略专题(活演示)
 * ============================================================================
 *
 * Next.js 16 里 PPR(Partial Prerendering)并入 Cache Components 模型:
 * `experimental.ppr` 已移除,由 next.config 顶层 `cacheComponents: true` 开启。
 * 本站已全站开启:取数默认动态(请求时渲染),缓存用 "use cache" 指令
 * (配合 cacheLife / cacheTag)显式声明;静态壳预渲染进 CDN,
 * 动态洞经 Suspense 流式补出。
 *
 * 本页即是活演示:左侧静态壳面板带 "use cache"(缓存时刻戳不随刷新变化),
 * 右侧动态洞是 Suspense 边界内未缓存的 async 组件(每请求现算时刻与随机号)。
 *
 * @module topics/rendering/ppr
 */

import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 活演示:静态壳与动态洞(本页真实运行的代码)
 * ================================================================ */

/** 人为延迟 helper:让动态洞的流式补出肉眼可见 */
const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 静态壳面板:"use cache" 显式标记,构建期预渲染并缓存。
 * cachedAt 随缓存产物冻结 —— 刷新页面它不变,正说明命中了缓存。
 */
async function CachedShellPanel() {
    "use cache";
    cacheLife("hours");
    cacheTag("ppr-shell");
    const cachedAt = new Date().toISOString();
    return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                静态壳(&quot;use cache&quot; + cacheLife(&quot;hours&quot;))
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">缓存生成时刻(UTC)</p>
            <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                {cachedAt}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                随构建期预渲染冻结,进 Full Route Cache / CDN;刷新不变。
            </p>
        </div>
    );
}

/**
 * 动态洞:不带 "use cache" 的 async 组件,包在 Suspense 边界里。
 * 每个请求在服务器现渲染:时刻与随机号每次都变。
 */
async function DynamicHole() {
    // 模拟慢取数,让 fallback → 补出的过程可被观察
    await sleep(1200);
    const renderedAt = new Date().toISOString();
    const nonce = crypto.randomUUID();
    return (
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-800/60 dark:bg-rose-950/40">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                动态洞(无缓存声明,Suspense 边界内)
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">本次请求渲染时刻(UTC)</p>
            <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                {renderedAt}
            </p>
            <p className="mt-2 font-mono text-[11px] text-neutral-500">本次请求随机号</p>
            <p className="mt-1 font-mono text-xs break-all text-ink dark:text-neutral-100">
                {nonce}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                每请求现渲染,经 Suspense 流式补出;刷新必变。
            </p>
        </div>
    );
}

/** 动态洞的 fallback:与 DynamicHole 同形的骨架 */
function HoleSkeleton() {
    return (
        <div className="rounded-xl border border-dashed border-neutral-300/80 p-4 dark:border-neutral-700/80">
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                动态洞(等待请求时渲染…)
            </p>
            <div className="mt-3 animate-pulse space-y-2">
                <div className="h-2 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-2 w-4/5 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-2 w-3/5 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
    );
}

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** next.config 开启方式:顶层 cacheComponents,不再是 experimental.ppr */
const CONFIG_SNIPPET = `// next.config.ts —— 本站正在使用的真实配置
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16:experimental.ppr 已移除,
  // PPR 并入 Cache Components 模型
  cacheComponents: true,
};

export default nextConfig;`;

/** 「静态壳 + 动态洞」的页面结构:本页上方演示面板的真实写法 */
const PAGE_SNIPPET = `// topics/rendering/ppr/index.tsx —— 本页演示面板的真实写法(节选)
import { cacheLife, cacheTag } from "next/cache";

// 静态壳:"use cache" 显式标记;cacheLife/cacheTag 声明新鲜度与失效标签
async function CachedShellPanel() {
  "use cache";
  cacheLife("hours");
  cacheTag("ppr-shell");
  const cachedAt = new Date().toISOString();  // 随缓存冻结
  return <ShellPanel cachedAt={cachedAt} />;
}

// 动态洞:不带指令的 async 组件,默认动态,每次请求现渲染
async function DynamicHole() {
  await sleep(1200);                          // 未缓存的异步工作
  return <Hole at={new Date()} nonce={crypto.randomUUID()} />;
}

// 页面组装:洞必须包在 Suspense 里,否则构建报错
// (Uncached data was accessed outside of <Suspense>)
<Suspense fallback={<HoleSkeleton />}>
  <DynamicHole />
</Suspense>`;

/** 旧 route segment config → 新模型的对应关系 */
const MIGRATION_SNIPPET = `// 旧模型(Next 15 及以前,route segment config)  →  本站现行(cacheComponents)
export const revalidate = 60;                 →  "use cache" + cacheLife({ revalidate: 60 })
export const dynamic = "force-dynamic";       →  什么都不写(默认动态);整页都动态可用 connection()
export const dynamic = "force-static";        →  "use cache"(显式声明可缓存)
export const fetchCache = "...";              →  删除:fetch 缓存由 "use cache" 的作用域决定
revalidateTag("posts")                        →  不变,标签改由 cacheTag("posts") 打在缓存条目上`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function PprTopic() {
    return (
        <TopicPage
            path="/rendering/ppr"
            title="PPR 与 Cache Components"
            description="本站已全站开启 cacheComponents:取数默认动态,&quot;use cache&quot; 显式标记静态部分;静态壳预渲染进 CDN,动态洞经 Suspense 流式补出 —— 本页即是活演示"
            references={[
                { label: "Next.js 文档:Caching(Cache Components 默认模型)", href: "https://nextjs.org/docs/app/getting-started/caching" },
                { label: "Next.js 文档:&quot;use cache&quot; 指令", href: "https://nextjs.org/docs/app/api-reference/directives/use-cache" },
                { label: "Next.js 文档:cacheLife / cacheTag", href: "https://nextjs.org/docs/app/api-reference/functions/cacheLife" },
            ]}
        >
            <TopicSection
                title="活演示:同一页里的壳与洞"
                note="刷新本页:左边(壳)时刻不变,右边(洞)时刻与随机号每次都变 —— 壳静洞动,一眼可验"
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <CachedShellPanel />
                    <Suspense fallback={<HoleSkeleton />}>
                        <DynamicHole />
                    </Suspense>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    构建期渲染到第一个 Suspense 边界为止:边界之外(页头、本说明、左侧面板)是静态壳,
                    预渲染后可直接由 CDN 吐出;边界之内(右侧面板)是动态洞,每个请求在服务器现渲染后流式补出。
                    洞的 1.2s 人为延迟让你能在慢网节流下看清 fallback 被替换的瞬间。
                </p>
            </TopicSection>

            <TopicSection
                title="PPR 在 Next 16 里变成了 Cache Components"
                note="experimental.ppr 已移除,开关移到 next.config 顶层;本站已全站开启"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        PPR(Partial Prerendering)的目标:同一页面里静态壳走 CDN 预渲染,动态洞在请求时流式补出,兼得 SSG 的 TTFB 与 SSR 的实时性
                    </li>
                    <li>
                        Next 16 起它不再是一个独立实验开关,而是并入 <strong>Cache Components</strong> 模型:PPR 成为「缓存声明 + Suspense 边界」的自然结果
                    </li>
                    <li>
                        它是<strong>项目级开关</strong>:一开全站生效,无法只对单个专题页启用 —— 这正是本站把全站迁完才把它做成活演示的原因
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CONFIG_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="模型反转:默认动态,显式缓存"
                note="与旧模型「默认静态、force-dynamic 退出」的心智正好相反"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        开启 cacheComponents 后,所有取数<strong>默认动态</strong>(请求时渲染),不再有「忘记加 no-store 就被缓存」的隐式行为
                    </li>
                    <li>
                        想缓存的组件/函数用
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&quot;use cache&quot;</code>
                        指令显式标记,配合
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">cacheLife</code>
                        声明新鲜度、
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">cacheTag</code>
                        声明失效标签
                    </li>
                    <li>
                        未缓存的请求时数据必须包在 Suspense 边界里,否则构建期直接报错 —— 边界不是可选项,而是编译契约
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{PAGE_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="从 route segment config 迁移过来"
                note="旧配置一行 vs 新模型写法的逐条对应;本站所有路由已按此迁移"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{MIGRATION_SNIPPET}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        构建输出的路由表是验收工具:○ 为完全静态(含「壳 + 缓存数据」),
                        ◐ 为 Partial Prerender(壳预渲染 + 动态洞请求时流式补出),
                        ƒ 为每请求动态;Revalidate / Expire 两列直接展示各路由的缓存窗口
                    </li>
                    <li>
                        对照本站 build 输出:本页、/rendering/streaming、/rendering/ssr 都是 ◐
                        (壳静态、内容经 Suspense 洞每请求补出);
                        /rendering/isr 是 ○ 且 Revalidate 列为 1m(数据整份进了 &quot;use cache&quot;);
                        ƒ 只剩 /api/* 的 Route Handler
                    </li>
                    <li>
                        旧模型的 ISR 语义由 cacheLife 完整承接:60s 窗口、stale-while-revalidate、
                        后台重建,在 /rendering/isr 可逐点对照观察
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用 PPR"
                note="决策要点,而非 API 背诵"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        整页都动态(个性化信息流、实时仪表盘):没有静态壳可抽,PPR 退化为普通 Streaming SSR,白添缓存声明成本
                    </li>
                    <li>
                        整页都静态(文档、营销页):SSG/&quot;use cache&quot; 本来就够快,动态洞是多余的复杂度
                    </li>
                    <li>
                        团队还没有统一的缓存失效纪律:显式缓存意味着每个
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&quot;use cache&quot;</code>
                        都要想清 cacheLife 与 cacheTag,粗放使用会积累 stale 事故
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
