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

            {/* 三种策略的对照:差异只在路由段配置的一行 */}
            <TopicSection
                title="SSG / ISR / SSR 一行之差"
                note="三种策略共享同一份组件代码,切换成本是路由段配置里的一行"
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            SSG(不写,或显式声明)
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`// 默认即静态;也可显式锁定
export const dynamic =
  "force-static";`}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            ISR(本页)
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`// 静态缓存 + 60s 后后台重建
export const revalidate = 60;`}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            SSR
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`// 每个请求在服务器现渲染
export const dynamic =
  "force-dynamic";`}
                        </pre>
                    </div>
                </div>

                <table className="mt-4 w-full text-left text-xs leading-relaxed">
                    <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                            <th className="py-2 pr-4 font-semibold">策略</th>
                            <th className="py-2 pr-4 font-semibold">预渲染时机</th>
                            <th className="py-2 pr-4 font-semibold">数据新鲜度</th>
                            <th className="py-2 font-semibold">适用场景</th>
                        </tr>
                    </thead>
                    <tbody className="text-neutral-600 dark:text-neutral-300">
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-2 pr-4 font-semibold">SSG</td>
                            <td className="py-2 pr-4">构建期一次</td>
                            <td className="py-2 pr-4">冻结在构建时刻</td>
                            <td className="py-2">内容稳定、人人一致</td>
                        </tr>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-2 pr-4 font-semibold">ISR</td>
                            <td className="py-2 pr-4">构建期 + 过期后台重建</td>
                            <td className="py-2 pr-4">最长落后一个 revalidate 窗口</td>
                            <td className="py-2">会更新但容忍分钟级延迟</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-semibold">SSR</td>
                            <td className="py-2 pr-4">不预渲染,每请求现算</td>
                            <td className="py-2 pr-4">实时</td>
                            <td className="py-2">强实时 / 千人千面</td>
                        </tr>
                    </tbody>
                </table>
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
