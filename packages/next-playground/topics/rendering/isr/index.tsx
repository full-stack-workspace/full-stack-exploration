/**
 * ============================================================================
 * ISR 与静态再生 — 渲染策略专题(ISR 的旧模型与新模型)
 * ============================================================================
 *
 * 从原 /blog 页迁移:async Server Component 直连外部 API(jsonplaceholder)。
 *
 * 旧模型(Next 15 及以前):薄壳导出 `export const revalidate = 60`,
 * 整页进 Full Route Cache,过期后由下一个请求触发后台重建。
 *
 * 本站现行(全站 cacheComponents):取数函数 getIsrPosts() 上用
 * "use cache" + cacheLife({ revalidate: 60 }) + cacheTag("posts")
 * 显式声明缓存;generateMetadata 与页面共享同一份缓存条目。
 * 页面渲染的「生成时刻」来自缓存产物本身:60s 内刷新不变,
 * 过期后第一次拿旧值(触发后台重建)、第二次拿新值。
 *
 * @module topics/rendering/isr
 */

import ArticleCard from "@/components/ArticleCard";
import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { getIsrPosts } from "./cached-posts";

/* =================================================================
 * 代码对照块(旧模型 vs 本站现行)
 * ================================================================ */

/** 旧模型:route segment config(Next 15 及以前;本站已不再使用) */
const OLD_MODEL_CODE = `// app/rendering/isr/page.tsx —— 旧模型(Next 15 及以前)
// route segment config:整页一把开关,页内任何取数都被卷进同一个窗口
export const revalidate = 60;   // 60s 后下一个请求触发后台重建

export default async function Page() {
    const posts = await getPosts();   // 取数代码本身没有任何缓存标记
    return <PostList posts={posts} />;
}`;

/** 本站现行:"use cache" 显式声明在取数函数上(cacheComponents) */
const NEW_MODEL_CODE = `// topics/rendering/isr/cached-posts.ts —— 本站正在运行的真实代码
import { cacheLife, cacheTag } from "next/cache";

export async function getIsrPosts() {
    "use cache";                       // 显式声明:这份产物可缓存
    cacheLife({ revalidate: 60 });     // 60s 窗口,语义对齐旧 revalidate = 60
    cacheTag("posts");                 // revalidateTag("posts") 可按需失效
    const { posts, source } = await getPostsWithStatus();
    return { posts, source, generatedAt: new Date().toISOString() };
}

// 缓存声明从「页面壳上的一行配置」下沉到「取数函数上的一条指令」:
// 粒度从整页细化到函数,同一页里不同数据可以各有各的窗口`;

/**
 * ISR 演示主体(Server Component)。
 * 缓存窗口由 ./cached-posts.ts 的 getIsrPosts() 声明,不在路由壳上。
 */
export default async function IsrTopic() {
    const { posts, source, generatedAt } = await getIsrPosts();

    return (
        <TopicPage
            path="/rendering/isr"
            title="ISR 与静态再生"
            description="&quot;use cache&quot; + cacheLife({ revalidate: 60 }) 的增量静态再生:产物预渲染并缓存,过期后后台重建;generateMetadata 与页面共享同一份缓存条目"
            references={[
                { label: "Next.js 文档:&quot;use cache&quot; 指令", href: "https://nextjs.org/docs/app/api-reference/directives/use-cache" },
                { label: "Next.js 文档:cacheLife(缓存新鲜度)", href: "https://nextjs.org/docs/app/api-reference/functions/cacheLife" },
                { label: "Next.js 文档:revalidateTag(按标签按需失效)", href: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag" },
            ]}
        >
            <TopicSection
                title="这一页是什么时候生成的"
                note="generatedAt 在缓存产物生成时取值并随之缓存 —— 它不变,正说明命中了缓存"
            >
                <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                    <p className="font-mono text-[11px] text-neutral-500">生成时刻(UTC)</p>
                    <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                        {generatedAt}
                    </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    60s 内刷新,此刻不变;60s 后第一次刷新拿到的仍是旧值(同时触发后台重建),第二次刷新才会看到新时刻
                    —— 与旧 revalidate=60 的 stale-while-revalidate 语义逐点一致。
                </p>
            </TopicSection>

            <TopicSection
                title="ISR 的旧模型与新模型"
                note="语义没变,变的是声明位置:从页面壳上的配置,下沉到取数函数上的指令"
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            旧模型(Next 15 及以前,本站已不再使用)
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{OLD_MODEL_CODE}
                        </pre>
                    </div>
                    <div>
                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                            本站现行(cacheComponents)
                        </p>
                        <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{NEW_MODEL_CODE}
                        </pre>
                    </div>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        对应关系:
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">export const revalidate = 60</code>
                        →
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">cacheLife({"{"} revalidate: 60 {"}"})</code>
                        ;按需失效从「fetch 带 tag」变为
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">cacheTag</code>
                        +
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">revalidateTag</code>
                    </li>
                    <li>
                        generateMetadata 与页面调的是同一个
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">getIsrPosts()</code>
                        :React cache() 管单次渲染内去重,&quot;use cache&quot; 管跨请求共享 —— 两层都在真实生效
                    </li>
                    <li>
                        一个容易踩的坑:数据源
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">data/blog.ts</code>
                        的 getPosts 同时被 /api/blog 使用,缓存声明必须留在调用方(本站的做法),
                        写进数据源会把 API 路由也拖进缓存
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="ISR 文章列表(来自 jsonplaceholder)"
                note="构建期预渲染 + 60s 后台重建;卡片点击进入动态路由专题的详情演示"
            >
                {source === "fallback" && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                        外部数据不可用,当前展示本地兜底数据(data/blog.ts 的 FALLBACK_POSTS),恢复后下一次再生会换回活数据。
                    </div>
                )}
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
                title="SSG / ISR / SSR 的语义对照"
                note="三种策略的语义不随模型变;变的只是声明方式(旧配置 → 新指令)"
            >
                <table className="w-full text-left text-xs leading-relaxed">
                    <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                            <th className="py-2 pr-4 font-semibold">策略</th>
                            <th className="py-2 pr-4 font-semibold">预渲染时机</th>
                            <th className="py-2 pr-4 font-semibold">数据新鲜度</th>
                            <th className="py-2 pr-4 font-semibold">本站实现</th>
                            <th className="py-2 font-semibold">适用场景</th>
                        </tr>
                    </thead>
                    <tbody className="text-neutral-600 dark:text-neutral-300">
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-2 pr-4 font-semibold">SSG</td>
                            <td className="py-2 pr-4">构建期一次</td>
                            <td className="py-2 pr-4">冻结在构建时刻</td>
                            <td className="py-2 pr-4">无取数 / 取数标 &quot;use cache&quot; 不设时限</td>
                            <td className="py-2">内容稳定、人人一致</td>
                        </tr>
                        <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-2 pr-4 font-semibold">ISR</td>
                            <td className="py-2 pr-4">构建期 + 过期后台重建</td>
                            <td className="py-2 pr-4">最长落后一个 revalidate 窗口</td>
                            <td className="py-2 pr-4">本页:cacheLife({"{"} revalidate: 60 {"}"})</td>
                            <td className="py-2">会更新但容忍分钟级延迟</td>
                        </tr>
                        <tr>
                            <td className="py-2 pr-4 font-semibold">SSR</td>
                            <td className="py-2 pr-4">不预渲染,每请求现算</td>
                            <td className="py-2 pr-4">实时</td>
                            <td className="py-2 pr-4">默认动态;或 connection() 显式声明</td>
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
                    <li>数据必须实时(库存、仪表盘)→ 保持默认动态(或客户端取数),ISR 的 stale 窗口不可接受</li>
                    <li>内容千人千面(依赖 cookie/会话)→ ISR 缓存的是「所有人共享的一份」,个性化内容会被错误复用</li>
                    <li>更新频率远高于 revalidate 周期 → 缓存永远过期,退化为每请求重建,不如直接用动态渲染或按需 revalidateTag</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
