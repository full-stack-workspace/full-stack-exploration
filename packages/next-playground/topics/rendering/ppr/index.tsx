/**
 * ============================================================================
 * PPR 与 Cache Components — 渲染策略专题(讲解 + 代码对照)
 * ============================================================================
 *
 * Next.js 16 里 PPR(Partial Prerendering)并入 Cache Components 模型:
 * `experimental.ppr` 已移除,改由 next.config 顶层 `cacheComponents: true` 开启。
 * 开启后缓存默认行为反转:取数默认动态(请求时渲染),用 "use cache" 指令
 * (配合 cacheLife / cacheTag)显式标记可缓存的组件与函数;
 * 静态壳预渲染进 CDN,动态洞经 Suspense 流式补出。
 *
 * 本站不开全局 flag(原因见页内说明),本页只做结构讲解与代码对照。
 *
 * @module topics/rendering/ppr
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照样例(仅展示,不在本站运行)
 * ================================================================ */

/** next.config 开启方式:顶层 cacheComponents,不再是 experimental.ppr */
const CONFIG_SNIPPET = `// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16:experimental.ppr 已移除,
  // PPR 并入 Cache Components 模型
  cacheComponents: true,
};

export default nextConfig;`;

/** 「静态壳 + 动态洞」的页面结构:缓存与否由 "use cache" 指令逐组件声明 */
const PAGE_SNIPPET = `// app/product/[id]/page.tsx
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

export default function Page() {
  return (
    <>
      {/* 静态壳:构建期预渲染,进 CDN */}
      <ProductShell />
      {/* 动态洞:未标记缓存,请求时经 Suspense 流式补出 */}
      <Suspense fallback={<RecommendSkeleton />}>
        <PersonalizedRecommend />
      </Suspense>
    </>
  );
}

// "use cache" 显式标记可缓存;cacheLife/cacheTag 声明新鲜度与失效标签
async function ProductShell() {
  "use cache";
  cacheLife("hours");
  cacheTag("product");
  const product = await getProduct();
  return <ProductDetail product={product} />;
}

// 不带指令的 async 组件:默认动态,每次请求现渲染
async function PersonalizedRecommend() {
  const recs = await getRecommendForCurrentUser();
  return <RecommendList recs={recs} />;
}`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function PprTopic() {
    return (
        <TopicPage
            title="PPR 与 Cache Components"
            description="Next 16 起 PPR 并入 Cache Components:取数默认动态,&quot;use cache&quot; 显式标记静态部分;静态壳预渲染进 CDN,动态洞经 Suspense 流式补出"
        >
            <TopicSection
                title="PPR 在 Next 16 里变成了 Cache Components"
                note="experimental.ppr 已移除,开关移到 next.config 顶层"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        PPR(Partial Prerendering)的目标:同一页面里静态壳走 CDN 预渲染,动态洞在请求时流式补出,兼得 SSG 的 TTFB 与 SSR 的实时性
                    </li>
                    <li>
                        Next 16 起它不再是一个独立实验开关,而是并入 <strong>Cache Components</strong> 模型:PPR 成为「缓存声明 + Suspense 边界」的自然结果
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CONFIG_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="模型反转:默认动态,显式缓存"
                note="与传统「默认静态、force-dynamic 退出」的心智正好相反"
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
                        构建期渲染到第一个 Suspense 边界为止:边界之外是静态壳(进 CDN),边界之内是动态洞(请求时流式补出)
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{PAGE_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="本站为什么没有开启"
                note="教学仓库的口径一致性优先于演示单个特性"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        cacheComponents 是<strong>项目级开关</strong>,不是路由级:一开全站生效,无法只对单个专题页启用
                    </li>
                    <li>
                        它会反转全站缓存默认行为:ISR 专题的
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">revalidate = 60</code>
                        语义、缓存对照实验的教学口径都会随之分裂,同一仓库里两套心智并存
                    </li>
                    <li>
                        因此本页只做结构讲解与代码对照;要亲手体验,建议开独立 sandbox 项目打开该 flag
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
                        整页都静态(文档、营销页):SSG/ISR 本来就够快,动态洞是多余的复杂度
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
