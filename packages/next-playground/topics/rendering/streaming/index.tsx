/**
 * ============================================================================
 * Streaming SSR 与 Suspense 粒度 — 渲染策略专题
 * ============================================================================
 *
 * 真实流式渲染演示:三个异步 Server Component 区块各自 await 不同时长
 * 的人为延迟(0.5s / 1.5s / 3s,本地 sleep,不请求外部 API),
 * 各自包在独立的 <Suspense> 边界里,静态壳先行吐出,慢区块分段补出。
 *
 * 关键前提:薄壳 app/rendering/streaming/page.tsx 导出
 * `export const dynamic = "force-dynamic"`,否则页面在构建期整体预渲染,
 * 运行时看到的是一次性返回的静态 HTML,观察不到分段到达。
 *
 * @module topics/rendering/streaming
 */

import { Suspense } from "react";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 演示组件
 * ================================================================ */

/** 人为延迟 helper:模拟慢查询,不依赖外部服务 */
const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

/** UTC 时分秒,用于标注每个区块「实际渲染完成的时刻」 */
const nowUTC = () => new Date().toISOString().slice(11, 19);

interface SlowBlockProps {
    /** 模拟的数据延迟(毫秒) */
    ms: number;
    /** 区块标题,如 "快数据(0.5s)" */
    title: string;
}

/**
 * 慢数据区块(async Server Component)。
 * await 期间整个区块挂在 Suspense 边界上,壳与其余区块不受影响。
 */
async function SlowBlock({ ms, title }: SlowBlockProps) {
    await sleep(ms);
    return (
        <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {title}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                数据已到达,本区块于 {nowUTC()} UTC 渲染完成并流式补出
            </p>
            <div className="mt-3 space-y-2">
                <div className="h-2 w-full rounded bg-emerald-200/70 dark:bg-emerald-800/50" />
                <div className="h-2 w-4/5 rounded bg-emerald-200/70 dark:bg-emerald-800/50" />
                <div className="h-2 w-3/5 rounded bg-emerald-200/70 dark:bg-emerald-800/50" />
            </div>
        </div>
    );
}

/** Suspense fallback:与 SlowBlock 同形的骨架,灰块脉冲占位 */
function BlockSkeleton({ title }: { title: string }) {
    return (
        <div className="rounded-xl border border-dashed border-neutral-300/80 p-4 dark:border-neutral-700/80">
            <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                {title}
            </p>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                等待数据中…
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
 * 专题主体
 * ================================================================ */

/**
 * Streaming 演示主体。
 * 本组件自身不 await 任何数据:静态壳(页头、分区标题、骨架)
 * 可以立刻流出去,三个慢区块各自在边界内分段到达。
 */
export default function StreamingTopic() {
    const blocks: SlowBlockProps[] = [
        { ms: 500, title: "快数据(0.5s)" },
        { ms: 1500, title: "中速数据(1.5s)" },
        { ms: 3000, title: "慢数据(3s)" },
    ];

    return (
        <TopicPage
            title="Streaming SSR 与 Suspense 粒度"
            description="force-dynamic 下的真实流式渲染:静态壳先行吐出,三个不同时延的异步区块各自包 Suspense 分段到达;边界粒度决定谁阻塞谁"
        >
            <TopicSection
                title="分段到达的三个区块"
                note="刷新页面观察:页头与骨架立即出现,三个区块按 0.5s / 1.5s / 3s 依次补出"
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {blocks.map((block) => (
                        <Suspense
                            key={block.ms}
                            fallback={<BlockSkeleton title={block.title} />}
                        >
                            <SlowBlock {...block} />
                        </Suspense>
                    ))}
                </div>
            </TopicSection>

            <TopicSection
                title="谁阻塞谁"
                note="Suspense 边界的粒度,决定了慢数据的爆炸半径"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        没有 Suspense 时:页面里<strong>最慢的那个 await 决定整页 TTFB</strong>,3s
                        的慢查询会让 0.5s 的快数据一起白屏等待
                    </li>
                    <li>
                        有了边界:静态壳(标题、导航、骨架)先流出去,浏览器立刻可渲染;
                        每个慢区块在自己的边界内独立 resolve,分段补出、互不相干
                    </li>
                    <li>
                        本页薄壳导出
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            dynamic = &quot;force-dynamic&quot;
                        </code>
                        :否则构建期整体预渲染,运行时拿到的是一次性静态 HTML,看不到流式效果
                    </li>
                    <li>
                        dev 下观察方式:刷新页面看内容分段出现;或用
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            curl -N
                        </code>
                        抓响应体,能看到 HTML 分 chunk 到达、尾部带着补洞的
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">$RC</code>
                        脚本
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用 Streaming"
                note="决策要点,而非 API 背诵"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        SEO 关键内容不要放进 Suspense 洞:爬虫对分段补出的内容收录不稳定,正文/标题必须随壳一起吐出
                    </li>
                    <li>
                        所有数据都很快(几十毫秒内)时,边界是多余的复杂度:壳与洞几乎同时到达,反而多一次渲染调度
                    </li>
                    <li>
                        数据间有强依赖(后一个查询要等前一个的结果)时,边界解决不了瀑布,先消依赖再谈分段
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
