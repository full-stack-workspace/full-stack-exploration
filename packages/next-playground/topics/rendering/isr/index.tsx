/**
 * ============================================================================
 * ISR 与静态再生 — 渲染策略专题
 * ============================================================================
 *
 * 从原 /blog 页迁移:async Server Component 直连外部 API(jsonplaceholder),
 * 配合页面级 revalidate=60 实现增量静态再生。
 *
 * 关键机制:
 * - 页面在构建期预渲染为静态 HTML 并进入 Full Route Cache
 * - 60s 过期后,下一个请求仍先返回旧缓存(stale),后台触发重建
 * - generateMetadata 与页面共享 cache() 包裹的 getPosts(),单次渲染只请求一次
 *
 * @module topics/rendering/isr
 */

import ArticleCard from "@/components/ArticleCard";
import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import type { Post } from "@/data/blog";
import { getPosts } from "@/data/blog";

/**
 * ISR 演示主体(Server Component)。
 * 页面级 revalidate 由薄壳 app/rendering/isr/page.tsx 导出。
 */
export default async function IsrTopic() {
    const posts: Post[] = await getPosts();

    return (
        <TopicPage
            title="ISR 与静态再生"
            description="revalidate=60 的增量静态再生:页面预渲染为静态 HTML,过期后后台重建;generateMetadata 与页面共享 cache() 记忆化请求"
        >
            <TopicSection
                title="ISR 文章列表(来自 jsonplaceholder)"
                note="构建期预渲染 + 60s 后台重建;卡片点击进入动态路由专题的详情演示"
            >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {posts.slice(0, 12).map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            href={`/router/dynamic-routes/${article.id}`}
                        />
                    ))}
                </div>
            </TopicSection>

            <TopicSection
                title="什么时候别用 ISR"
                note="决策要点,而非 API 背诵"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>数据必须实时(库存、仪表盘)→ 用动态渲染(force-dynamic)或客户端取数,ISR 的 stale 窗口不可接受</li>
                    <li>内容千人千面(依赖 cookie/会话)→ ISR 缓存的是「所有人共享的一份」,个性化内容会被错误复用</li>
                    <li>更新频率远高于 revalidate 周期 → 缓存永远过期,退化为 SSR,不如直接用 SSR 或按需 revalidateTag</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
