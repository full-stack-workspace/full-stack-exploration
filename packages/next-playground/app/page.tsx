/**
 * ============================================================================
 * Home Page — 首页(注册表驱动的专题导航 Hub)
 * ============================================================================
 *
 * 数据 100% 来自 config/topics.tsx 注册表:
 * - Hero 统计 = CATEGORIES / TOPICS 数量
 * - 分类快捷入口 = 各类第一个专题
 * - 分组区 = CATEGORIES × getTopicsByCategory 的卡片网格
 *
 * 新专题注册后首页自动出现,本文件零改动。
 *
 * @module page
 */

import Link from "next/link";

import {
    CATEGORIES,
    getCategoryFirstPath,
    getTopicsByCategory,
    TOPICS,
} from "@/config/topics";
import { cn } from "@/lib/utils";

/* =================================================================
 * Hero 区
 * ================================================================ */

const Hero = () => {
    const stats = [
        { value: CATEGORIES.length, label: "知识领域" },
        { value: TOPICS.length, label: "工程专题" },
    ];

    return (
        <section className="relative overflow-hidden py-16 sm:py-20">
            {/* 背景装饰 - 渐变模糊圆形 */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-100/40 to-transparent blur-3xl dark:from-primary-900/20" />
            </div>

            <p className="text-xs font-semibold tracking-[0.2em] text-primary-500 uppercase">
                Next Playground
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl leading-tight font-bold text-neutral-900 sm:text-4xl dark:text-neutral-50">
                把生产里的 Next.js 判断,写成
                <span className="bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">
                    可运行的对照
                </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                Next.js 文档告诉你 API 能做什么;这里练的是另一件事:渲染光谱上选哪一格、
                Server/Client 边界画在哪、四层缓存谁说了算、AI 流式体验怎么落地——每个专题都是
                可点的对照实验,而不是一页说明书。
            </p>

            {/* 统计 + 快捷入口 */}
            <div className="mt-8 flex flex-wrap items-center gap-8">
                {stats.map((s) => (
                    <div key={s.label}>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                            {s.value}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <Link
                        key={c.key}
                        href={getCategoryFirstPath(c.key)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400",
                            c.theme.hoverBorder,
                        )}
                    >
                        <span className={cn("h-1.5 w-1.5 rounded-full", c.theme.dot)} />
                        {c.title}
                    </Link>
                ))}
            </div>
        </section>
    );
};

/* =================================================================
 * 分类分组区
 * ================================================================ */

const CategoryGroups = () => (
    <div className="space-y-12 pb-16">
        {CATEGORIES.map((c) => {
            const topics = getTopicsByCategory(c.key);
            return (
                <section key={c.key}>
                    {/* 组头:色点 + 分类名 + 副标题 + 数量徽标 */}
                    <div className="mb-4 flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full", c.theme.dot)} />
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                            {c.title}
                        </h2>
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                c.theme.chip,
                            )}
                        >
                            {topics.length}
                        </span>
                    </div>
                    <p className="mb-5 text-sm text-neutral-500 dark:text-neutral-400">
                        {c.subtitle}
                    </p>

                    {/* 专题卡片网格 */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {topics.map((t) => (
                            <Link
                                key={t.path}
                                href={t.path}
                                className={cn(
                                    "group rounded-2xl border border-neutral-200/60 bg-white p-5 transition-all duration-200 hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900",
                                    c.theme.hoverBorder,
                                )}
                            >
                                <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-neutral-50 dark:group-hover:text-primary-400">
                                    {t.title}
                                </h3>
                                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                                    {t.description}
                                </p>
                                <span
                                    className={cn(
                                        "mt-4 inline-flex items-center gap-1 text-xs font-medium transition-transform duration-200 group-hover:gap-2",
                                        c.theme.text,
                                    )}
                                >
                                    进入专题
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            );
        })}
    </div>
);

export default function Home() {
    return (
        <div className="mx-auto w-full max-w-7xl">
            <Hero />
            <CategoryGroups />
        </div>
    );
}
