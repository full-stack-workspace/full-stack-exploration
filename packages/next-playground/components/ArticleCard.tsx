/**
 * ============================================================================
 * Article Card Component (文章卡片组件)
 * ============================================================================
 *
 * 展示单篇文章的卡片组件。
 *
 * 设计特点：
 * - 左侧彩色指示条（悬浮时显示）
 * - 文章编号使用 #001 格式
 * - 渐变头像装饰
 * - 底部作者信息和阅读链接
 *
 * 性能优化：
 * - 使用 React.memo 避免不必要的重渲染
 * - 组件保持纯展示性质，无内部状态
 * - 链接使用 Next.js Link 组件实现客户端导航
 *
 * @module components/ArticleCard
 */

import Link from "next/link";
import { memo } from "react";

import { cn } from "@/lib/utils";

/**
 * 文章数据结构接口
 */
export interface Article {
    id: number;
    title: string;
    body: string;
    userId?: number;
}

/**
 * 分类配色配置
 *
 * 根据文章 ID 分配不同的柔和配色，使页面更生动但不杂乱
 */
const getCategoryColor = (id: number) => {
    const colors = [
        { bg: "bg-blue-50", text: "text-blue-600", darkBg: "dark:bg-blue-900/30", darkText: "dark:text-blue-400" },
        { bg: "bg-violet-50", text: "text-violet-600", darkBg: "dark:bg-violet-900/30", darkText: "dark:text-violet-400" },
        { bg: "bg-emerald-50", text: "text-emerald-600", darkBg: "dark:bg-emerald-900/30", darkText: "dark:text-emerald-400" },
        { bg: "bg-amber-50", text: "text-amber-600", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-400" },
        { bg: "bg-rose-50", text: "text-rose-600", darkBg: "dark:bg-rose-900/30", darkText: "dark:text-rose-400" },
        { bg: "bg-cyan-50", text: "text-cyan-600", darkBg: "dark:bg-cyan-900/30", darkText: "dark:text-cyan-400" },
    ];
    return colors[id % colors.length];
};

/**
 * ArticleCard Props 接口
 */
interface ArticleCardProps {
    article: Article;
    href?: string;
}

/**
 * ============================================================================
 * 文章卡片组件
 * ============================================================================
 *
 * @param props.article - 文章数据
 * @param props.href - 跳转链接，默认值为 /user/${article.id}
 */
const ArticleCard = memo(({
    article,
    href
}: ArticleCardProps) => {
    const category = getCategoryColor(article.id);
    const linkHref = href || `/user/${article.id}`;

    return (
        <Link
            key={article.id}
            href={linkHref}
            className="group relative flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 transition-all duration-300 hover:border-neutral-300 hover:shadow-xl dark:border-neutral-800/80 dark:bg-neutral-900 dark:hover:border-neutral-700"
        >
            {/* 左侧彩色指示条 - 悬浮时显示 */}
            <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* 文章标签和编号 */}
            <div className="mb-4 flex items-center justify-between">
                <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", category.bg, category.text, category.darkBg, category.darkText)}>
                    文章
                </span>
                <time className="text-xs text-neutral-400 dark:text-neutral-500">
                    #{article.id.toString().padStart(3, "0")}
                </time>
            </div>

            {/* 文章标题 - 最多显示 2 行 */}
            <h2 className="mb-3 text-lg font-semibold leading-snug text-neutral-900 line-clamp-2 transition-colors duration-200 group-hover:text-primary-600 dark:text-neutral-50 dark:group-hover:text-primary-400">
                {article.title || "无标题文章"}
            </h2>

            {/* 文章摘要 - 最多显示 3 行 */}
            <p className="mb-6 flex-1 text-sm leading-relaxed text-neutral-500 line-clamp-3 dark:text-neutral-400">
                {article.body || "暂无内容摘要..."}
            </p>

            {/* 底部信息栏 - 作者和阅读链接 */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                {/* 作者信息 */}
                <div className="flex items-center gap-2">
                    {/* 渐变头像装饰 */}
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        作者 {article.userId || 1}
                    </span>
                </div>
                {/* 阅读链接 - 带箭头动画 */}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 transition-all duration-200 group-hover:gap-2 dark:text-primary-400">
                    阅读
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </span>
            </div>
        </Link>
    );
});
ArticleCard.displayName = "ArticleCard";

export default ArticleCard;
