/**
 * ============================================================================
 * Blog Page (博客列表页面)
 * ============================================================================
 *
 * 展示博客文章列表的页面。
 *
 * 功能特点：
 * - 从 API 获取文章列表数据
 * - 使用 Server Component 进行服务端渲染
 * - 响应式网格布局（1/2/3 列）
 * - 每篇文章使用不同的柔和配色标签
 * - 悬浮效果增强交互体验
 *
 * 页面结构：
 * 1. Header Section - 页面标题和简介
 * 2. Article Grid - 文章卡片网格
 *
 * @module blog/page
 */

import { Metadata } from "next";
import ArticleCard, { Article } from "../../components/ArticleCard";

/**
 * ============================================================================
 * ISR (Incremental Static Regeneration) 配置
 * ============================================================================
 *
 * 设置页面静态生成后的重新验证间隔。
 *
 * 作用：
 * - 页面最初以静态 HTML 形式被预渲染和缓存
 * - 在 revalidate 秒后，下次请求会触发后台重新生成
 * - 用户会先看到缓存的旧页面，同时后台更新数据
 *
 * 与 getStaticProps + revalidate 等效（Pages Router 时代的功能）
 *
 * @see https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
 */
export const revalidate = 60;

/**
 * 页面 Metadata 配置
 * 定义页面的标题和描述，用于 SEO
 */
export const metadata: Metadata = {
    title: "博客 - Blog",
    description: "浏览最新的技术文章和最新资讯",
};

/**
 * ============================================================================
 * 博客页面组件
 * ============================================================================
 *
 * 设计细节：
 * - 使用 async/await 获取服务端数据
 * - 最多显示 12 篇文章
 * - 每张卡片都是可点击的链接
 *
 * 数据获取：
 * - 直接从外部 API (jsonplaceholder) 获取数据
 * - 不依赖本地 /api/blog route，避免构建时 ECONNREFUSED 错误
 * - ISR (revalidate=60) 实现增量静态再生
 *   - 页面被预渲染为静态 HTML 并缓存
 *   - 60 秒后下次请求触发后台重新生成
 *   - 用户始终快速加载，同时数据保持相对新鲜
 *
 * 性能优化：
 * - 文章卡片已使用 React.memo 包装，避免不必要的重渲染
 * - 服务端渲染减少客户端 JavaScript 体积
 */
export default async function BlogPage() {
    /**
     * 直接从外部 API 获取文章数据
     *
     * 为什么不使用本地 /api/blog？
     * - 构建时预渲染需要请求 API，但此时没有开发服务器运行
     * - 会导致 ECONNREFUSED 错误：fetch failed at 127.0.0.1:3000
     * - 直接调用外部 API 可以确保构建时也能正常获取数据
     */
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
        next: { revalidate: 60 },
    });
    const posts: Article[] = await res.json();

    return (
        <div className="flex flex-col min-h-screen">
            {/* =================================================================
             * Header Section - 页面标题区域
             * ================================================================
             */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white py-16 sm:py-24">
                {/* 背景装饰 - 渐变模糊圆形 */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-100/30 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* 页面标题 */}
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4">
                            博客文章
                        </h1>
                        {/* 页面描述 */}
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            探索最新的技术见解、设计灵感和产品思考
                        </p>
                    </div>
                </div>
            </section>

            {/* =================================================================
             * Article Grid Section - 文章网格区域
             * ================================================================
             */}
            <section className="bg-white py-12 dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* 响应式网格：移动端 1 列，平板 2 列，桌面 3 列 */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.slice(0, 12).map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                href={`/user/${article.id}`}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
