/**
 * ============================================================================
 * SpectrumHero — 首页英雄区(品牌论点 + 活光谱)
 * ============================================================================
 *
 * 站点签名只在这里放大:五根刻度入场升起,左静右动,磷光标出最右一格。
 * 尺子只链到「这一格有独立对照页」的策略;SSG 留在光谱梳理页。
 *
 * @module components/home/SpectrumHero
 */

import Link from "next/link";

import { SITE_NAME_EN, SITE_SLOGAN, SITE_THESIS } from "@/config/site";
import {
    CATEGORIES,
    getCategoryFirstPath,
    TOPICS,
} from "@/config/topics";
import { cn } from "@/lib/utils";

import { Panel } from "../ui/Panel";

/* =================================================================
 * 渲染尺子
 * ================================================================ */

/**
 * 首页尺子只链到「这一格有独立对照页」的策略。
 * SSG 没有单独一页,它留在光谱梳理里,不在尺子上占一格空链。
 */
export const RULER = [
    { key: "ISR", href: "/rendering/isr", hint: "过期再换", bars: 2 },
    { key: "SSR", href: "/rendering/ssr", hint: "请求时整页", bars: 3 },
    { key: "Stream", href: "/rendering/streaming", hint: "分段到达", bars: 4 },
    { key: "PPR", href: "/rendering/ppr", hint: "壳静洞动", bars: 5 },
] as const;

const STAGGER = [
    "stagger-1",
    "stagger-2",
    "stagger-3",
    "stagger-4",
    "stagger-5",
] as const;

/**
 * 渲染分类地图格里的迷你光谱,把英雄尺子的四格缩进一块面板。
 */
export function MiniSpectrum() {
    return (
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
            {RULER.map((stage, index) => (
                <span
                    key={stage.key}
                    className="flex h-8 flex-1 items-end gap-px rounded-md bg-paper px-1.5 py-1 dark:bg-night"
                >
                    {Array.from({ length: stage.bars }, (_, bar) => (
                        <span
                            key={bar}
                            className={cn(
                                "w-[3px] rounded-[1px] origin-bottom",
                                bar === stage.bars - 1 && index === RULER.length - 1
                                    ? "bg-signal"
                                    : "bg-ink/70 dark:bg-neutral-200/80",
                            )}
                            style={{ height: `${6 + bar * 3}px` }}
                        />
                    ))}
                </span>
            ))}
        </div>
    );
}

const SpectrumRuler = () => (
    <Panel className="mt-10 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4">
            {RULER.map((stage, index) => (
                <Link
                    key={stage.key}
                    href={stage.href}
                    transitionTypes={["nav-forward"]}
                    className={cn(
                        "group flex min-h-40 flex-col justify-between px-5 py-5 transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal dark:hover:bg-night",
                        index > 0 && "md:border-l md:border-mist dark:md:border-neutral-800",
                        index % 2 === 1 && "border-l border-mist md:border-l dark:border-neutral-800",
                        index >= 2 && "border-t border-mist md:border-t-0 dark:border-neutral-800",
                        index === RULER.length - 1 && "bg-paper/70 dark:bg-night/60",
                    )}
                >
                    <span className="flex h-16 items-end gap-1" aria-hidden="true">
                        {Array.from({ length: stage.bars }, (_, bar) => (
                            <span
                                key={bar}
                                className={cn(
                                    "w-1.5 rounded-sm origin-bottom motion-safe:animate-bar-rise",
                                    STAGGER[bar],
                                    bar === stage.bars - 1 && index === RULER.length - 1
                                        ? "bg-signal shadow-[0_0_14px_rgb(30_202_211_/_0.85)]"
                                        : "bg-ink/80 dark:bg-neutral-100",
                                )}
                                style={{ height: `${18 + bar * 8}px` }}
                            />
                        ))}
                    </span>
                    <span>
                        <span className="font-display block text-2xl font-semibold tracking-[-0.04em] text-ink transition-colors group-hover:text-signal-600 dark:text-neutral-50 dark:group-hover:text-signal-400">
                            {stage.key}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                            {stage.hint}
                        </span>
                    </span>
                </Link>
            ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-mist px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span>左静,右动。点一格,打开那一格的对照。</span>
            <Link
                href="/rendering/spectrum"
                transitionTypes={["nav-forward"]}
                className="shrink-0 font-medium text-ink underline decoration-signal decoration-1 underline-offset-4 hover:text-signal-600 dark:text-neutral-100 dark:hover:text-signal-400"
            >
                五格放在一起看
            </Link>
        </div>
    </Panel>
);

export function SpectrumHero() {
    return (
        <section className="relative pt-6 pb-4 sm:pt-12">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 left-1/2 h-64 w-[min(42rem,100%)] -translate-x-1/2 rounded-full bg-signal/20 blur-3xl dark:bg-signal/12"
            />
            {/* 眉题:英文副标 + 站点定位,先回答「这是什么站」 */}
            <p className="relative font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                {SITE_NAME_EN} · Next.js 工程实践的选型对照站
            </p>
            <h1 className="relative mt-4 max-w-3xl font-display text-4xl leading-[1.12] font-semibold tracking-[-0.04em] text-ink sm:text-5xl dark:text-neutral-50">
                {SITE_SLOGAN}
            </h1>
            <p className="relative mt-4 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                {SITE_THESIS} 渲染光谱、RSC 边界、缓存、路由与 AI-Native,按专题展开成可运行的对照。
            </p>
            <p className="relative mt-5 font-mono text-[11px] tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                {CATEGORIES.length} 个领域 · {TOPICS.length} 个专题
            </p>
            <div className="relative">
                <SpectrumRuler />
            </div>
            {/* 七领域速览:从注册表派生,直达各分类首个专题 */}
            <nav aria-label="七个领域速览" className="relative mt-4 flex flex-wrap items-center gap-2">
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.key}
                        href={getCategoryFirstPath(category.key)}
                        transitionTypes={["nav-forward"]}
                        className="inline-flex items-center gap-2 rounded-full border border-mist px-3.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-signal hover:text-signal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-signal dark:hover:text-signal-400"
                    >
                        <span className={cn("h-1.5 w-1.5 rounded-full", category.theme.dot)} aria-hidden="true" />
                        {category.title}
                    </Link>
                ))}
            </nav>
        </section>
    );
}
