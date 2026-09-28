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
        <section className="relative overflow-hidden py-20 sm:py-24">
            {/* 背景:点阵网格 + 蓝紫双层辉光,营造「工程图纸」质感 */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.neutral.200)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)] dark:bg-[radial-gradient(circle_at_1px_1px,theme(colors.neutral.800)_1px,transparent_0)]" />
                <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary-400/25 blur-3xl dark:bg-primary-600/20" />
                <div className="absolute top-10 right-1/5 h-72 w-72 rounded-full bg-secondary-400/25 blur-3xl dark:bg-secondary-600/20" />
            </div>

            {/* 徽章:技术栈 + 脉冲点 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-primary-700 backdrop-blur dark:border-primary-800/60 dark:bg-neutral-900/70 dark:text-primary-300">
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                </span>
                Next.js 16 · React 19 · App Router
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.15] font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
                把生产里的 Next.js 判断,
                <br />
                写成
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400">
                    可运行的对照
                </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
                渲染光谱上选哪一格、Server/Client 边界画在哪、四层缓存谁说了算、
                AI 流式体验怎么落地——每个专题都是可点的对照实验,而不是一页说明书。
            </p>

            {/* 统计:大号数字 + 分隔线 */}
            <div className="mt-10 flex items-center gap-8">
                {stats.map((s, i) => (
                    <div key={s.label} className={cn("flex items-baseline gap-2", i > 0 && "border-l border-neutral-200 pl-8 dark:border-neutral-800")}>
                        <span className="bg-gradient-to-br from-primary-600 to-secondary-500 bg-clip-text text-3xl font-extrabold text-transparent dark:from-primary-400 dark:to-secondary-400">
                            {s.value}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* 分类快捷入口 */}
            <div className="mt-8 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                    <Link
                        key={c.key}
                        href={getCategoryFirstPath(c.key)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400",
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
