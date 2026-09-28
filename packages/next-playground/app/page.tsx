/**
 * ============================================================================
 * Home Page — 首页(注册表驱动的专题导航 Hub)
 * ============================================================================
 *
 * 数据来自 config/topics.tsx:
 * - 英雄区的尺子链到渲染光谱上已有对照页的那几格
 * - 下方目录 = CATEGORIES × getTopicsByCategory,每行仍是标题加完整说明
 *
 * @module page
 */

import Link from "next/link";

import {
    CATEGORIES,
    getTopicsByCategory,
    TOPICS,
} from "@/config/topics";
import { SITE_THESIS } from "@/lib/topic-meta";
import { cn } from "@/lib/utils";

/* =================================================================
 * 渲染尺子
 * ================================================================ */

/**
 * 首页尺子只链到「这一格有独立对照页」的策略。
 * SSG 没有单独一页,它留在光谱梳理里,不在尺子上占一格空链。
 */
const RULER = [
    { key: "ISR", href: "/rendering/isr", hint: "过期再换", bars: 2 },
    { key: "SSR", href: "/rendering/ssr", hint: "请求时整页", bars: 3 },
    { key: "Stream", href: "/rendering/streaming", hint: "分段到达", bars: 4 },
    { key: "PPR", href: "/rendering/ppr", hint: "壳静洞动", bars: 5 },
] as const;

const SpectrumRuler = () => (
    <div className="mt-10 overflow-hidden rounded-lg border border-rule bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="grid grid-cols-2 md:grid-cols-4">
            {RULER.map((stage, index) => (
                <Link
                    key={stage.key}
                    href={stage.href}
                    className={cn(
                        "group flex min-h-36 flex-col justify-between px-4 py-4 transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-copper-500 dark:hover:bg-neutral-950",
                        index > 0 && "md:border-l md:border-rule dark:md:border-neutral-800",
                        index % 2 === 1 && "border-l border-rule md:border-l dark:border-neutral-800",
                        index >= 2 && "border-t border-rule md:border-t-0 dark:border-neutral-800",
                        index === RULER.length - 1 && "bg-paper/80 dark:bg-neutral-950/60",
                    )}
                >
                    <span className="flex h-8 items-end gap-[3px]" aria-hidden="true">
                        {Array.from({ length: stage.bars }, (_, bar) => (
                            <span
                                key={bar}
                                className={cn(
                                    "w-[3px] rounded-[1px]",
                                    bar === stage.bars - 1 && index === RULER.length - 1
                                        ? "bg-copper-500"
                                        : "bg-ink/70 dark:bg-neutral-200/80",
                                )}
                                style={{ height: `${8 + bar * 4}px` }}
                            />
                        ))}
                    </span>
                    <span>
                        <span className="font-display block text-xl font-semibold tracking-[-0.03em] text-ink group-hover:text-copper-600 dark:text-neutral-50 dark:group-hover:text-copper-400">
                            {stage.key}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                            {stage.hint}
                        </span>
                    </span>
                </Link>
            ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-rule px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span>左静,右动。点一格,打开那一格的对照。</span>
            <Link
                href="/rendering/spectrum"
                className="shrink-0 font-medium text-ink underline decoration-copper-500 decoration-1 underline-offset-4 hover:text-copper-600 dark:text-neutral-100 dark:hover:text-copper-400"
            >
                五格放在一起看
            </Link>
        </div>
    </div>
);

/* =================================================================
 * 分类账本
 * ================================================================ */

const CategoryLedger = () => (
    <div className="mt-16 flex flex-col gap-8 pb-12">
        {CATEGORIES.map((category, index) => {
            const topics = getTopicsByCategory(category.key);
            const order = String(index + 1).padStart(2, "0");
            return (
                <section
                    key={category.key}
                    className="overflow-hidden rounded-lg border border-rule bg-white dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <header className="border-b border-rule px-5 py-4 dark:border-neutral-800">
                        <div className="flex items-baseline gap-3">
                            <p className="font-mono text-[11px] tracking-[0.18em] text-copper-600 dark:text-copper-400">
                                {order}
                            </p>
                            <h2 className="text-xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                                {category.title}
                            </h2>
                        </div>
                        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                            {category.subtitle}
                        </p>
                    </header>
                    <ul>
                        {topics.map((topic) => (
                            <li
                                key={topic.path}
                                className="border-t border-rule first:border-t-0 dark:border-neutral-800"
                            >
                                <Link
                                    href={topic.path}
                                    className="group grid gap-1 px-5 py-4 transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-copper-500 md:grid-cols-[minmax(16rem,20rem)_1fr] md:items-start md:gap-10 dark:hover:bg-neutral-950"
                                >
                                    <span className="text-[15px] leading-6 font-medium text-ink group-hover:text-copper-600 dark:text-neutral-100 dark:group-hover:text-copper-400">
                                        {topic.title}
                                    </span>
                                    <span className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                        {topic.description}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            );
        })}
    </div>
);

export default function Home() {
    return (
        <div className="mx-auto w-full max-w-6xl">
            <section className="pt-6 pb-4 sm:pt-10">
                <p className="font-mono text-[11px] tracking-[0.18em] text-copper-600 dark:text-copper-400">
                    {CATEGORIES.length} 个领域 · {TOPICS.length} 个专题
                </p>
                <h1 className="mt-4 max-w-3xl text-4xl leading-[1.15] font-semibold tracking-tight text-ink sm:text-5xl dark:text-neutral-50">
                    先把策略放到同一把尺子上
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {SITE_THESIS}
                </p>
                <SpectrumRuler />
            </section>
            <CategoryLedger />
        </div>
    );
}
