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

import type { Metadata } from "next";

import type { Post } from "@/data/blog";
import { getPosts } from "@/data/blog";

import ArticleCard from "../../components/ArticleCard";

/**
 * ============================================================================
 * ISR (Incremental Static Regeneration) 配置
 * ============================================================================
 *
 * 页面级 revalidate 控制：60 秒后触发后台重新生成。
 */
export const revalidate = 60;

/**
 * ============================================================================
 * 动态生成 SEO Metadata（记忆化数据请求）
 * ============================================================================
 *
 * generateMetadata 和 BlogPage 都调用 getPosts()。
 * 得益于 React cache() 的记忆化，同一请求周期内只发起一次 HTTP 请求。
 *
 * 这对 SEO 很重要：
 * - 搜索引擎爬虫会读取 <title> 和 <meta name="description">
 * - 动态文章数量让描述更精确
 * - Open Graph 确保社交分享时显示富媒体预览
 */
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPosts();

  return {
    title: "博客",
    description: `浏览最新的技术文章和最新资讯，当前共 ${posts.length} 篇文章。涵盖前端、后端、架构等多个领域。`,
    openGraph: {
      title: "博客 | Next.js Demo",
      description: `浏览 ${posts.length} 篇技术文章，涵盖前端、后端、架构等主题。`,
      type: "website",
    },
  };
}

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
    const posts: Post[] = await getPosts();

    return (
        <div className="flex flex-col min-h-screen">
            {/* =================================================================
             * Header Section - 页面标题区域
             * ================================================================
             */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white py-16 sm:py-24 dark:from-neutral-900 dark:to-neutral-950">
                {/* 背景装饰 - 渐变模糊圆形 */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-100/30 to-transparent rounded-full blur-3xl dark:from-primary-900/20 dark:to-transparent" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* 页面标题 */}
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4 dark:text-neutral-50">
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
