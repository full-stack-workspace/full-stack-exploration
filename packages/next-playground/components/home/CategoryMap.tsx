/**
 * ============================================================================
 * CategoryMap — 首页分类地图
 * ============================================================================
 *
 * 按学习顺序铺八个分类:渲染策略占更宽一格(站点论点从这里出发),
 * 其余按阅读流排。每格内是该分类完整专题 List,不是纯品牌空卡。
 *
 * @module components/home/CategoryMap
 */

import Link from "next/link";

import {
    CATEGORIES,
    type CategoryMeta,
    getTopicsByCategory,
} from "@/config/topics";
import { cn } from "@/lib/utils";

import { Panel } from "../ui/Panel";
import { MiniSpectrum } from "./SpectrumHero";

const STAGGER = [
    "stagger-1",
    "stagger-2",
    "stagger-3",
    "stagger-4",
    "stagger-5",
    "stagger-6",
    "stagger-7",
    "stagger-8",
] as const;

function CategoryTile({
    category,
    featured,
    stagger,
}: {
    category: CategoryMeta;
    featured?: boolean;
    stagger: string;
}) {
    const topics = getTopicsByCategory(category.key);

    return (
        <Panel
            hover
            className={cn(
                "flex h-full flex-col overflow-hidden motion-safe:animate-slide-up",
                featured && "md:col-span-2",
                stagger,
            )}
        >
            <header className="border-b border-mist px-5 py-4 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", category.theme.dot)} />
                    <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                        {category.title}
                    </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {category.subtitle}
                </p>
                {featured ? <MiniSpectrum /> : null}
            </header>
            <ul className="flex flex-1 flex-col">
                {topics.map((topic) => (
                    <li
                        key={topic.path}
                        className="border-t border-mist first:border-t-0 dark:border-neutral-800"
                    >
                        <Link
                            href={topic.path}
                            transitionTypes={["nav-forward"]}
                            className="group grid gap-1 px-5 py-3.5 transition-colors hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-signal md:items-start dark:hover:bg-night"
                        >
                            <span className="text-[15px] leading-6 font-medium text-ink transition-colors group-hover:text-signal-600 dark:text-neutral-100 dark:group-hover:text-signal-400">
                                {topic.title}
                            </span>
                            <span className="line-clamp-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                                {topic.description}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

export function CategoryMap() {
    return (
        <section className="mt-14 pb-12">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-[11px] tracking-[0.18em] text-signal-600 dark:text-signal-400">
                        学习顺序
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                        从尺子走进目录
                    </h2>
                </div>
                <p className="hidden max-w-xs text-right text-sm text-neutral-500 sm:block dark:text-neutral-400">
                    边界 → 渲染 → 路由 → 数据 → Metadata → 工程 → 安全 → AI
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {CATEGORIES.map((category, index) => (
                    <CategoryTile
                        key={category.key}
                        category={category}
                        featured={category.key === "rendering"}
                        stagger={STAGGER[index] ?? "stagger-8"}
                    />
                ))}
            </div>
        </section>
    );
}
