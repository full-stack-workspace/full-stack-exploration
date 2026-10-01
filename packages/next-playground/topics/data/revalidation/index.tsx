/**
 * ============================================================================
 * 按需失效实战 — 数据与缓存专题(本分类核心页)
 * ============================================================================
 *
 * ISR 专题回答「时间驱动的缓存怎么再生」,本页回答另一个问题:
 * 数据在源站变了,怎么精准地把缓存里的对应条目唤醒 —— 按需失效。
 *
 * 活演示链路:getTaggedPosts()("use cache" + cacheLife("max") +
 * cacheTag)产出一份几乎不随时间过期的缓存,页面展示其生成时刻;
 * 两个按钮分别触发 revalidateTag(SWR)与 updateTag(立即过期),
 * 刷新后时间戳是否变化、第几次刷新才变化,就是两种语义的直接证据。
 *
 * 本组件是 Server Component:缓存取数在顶层 await(缓存内容本来就能
 * 预渲染,不需要 Suspense 洞),交互只有失效按钮一个 Client 叶子。
 *
 * @module topics/data/revalidation
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { getTaggedPosts, REVALIDATION_TAG } from "./cached-posts";
import { InvalidateButtons } from "./components/InvalidateButtons";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** tag vs path 的粒度对照 */
const TAG_VS_PATH_CODE = `// 按标签失效:精准命中「这类数据」,波及面由打标决定
async function getPosts() {
    "use cache";
    cacheTag("posts");              // 这份产物贴上 posts 标签
    return db.posts.findMany();
}
// 任意 action 里:只失效贴了 "posts" 的条目,别的缓存不动
updateTag("posts");

// 按路径失效:命中「这条路渲染时用到的所有缓存」,波及面由路由决定
revalidatePath("/data/revalidation");
// 该路径渲染涉及的缓存条目全部失效 —— 粗,但不需要你记得打过什么标

// 选择依据:
//   知道「哪类数据变了」→ tag(变更发生在数据源,如 CMS webhook)
//   只知道「这个页面该重渲了」→ path(变更发生在本页表单,如留言板)`;

export default async function RevalidationTopic() {
    // 缓存产物在顶层 await:可缓存内容不需要 Suspense 洞,
    // 页面的静态部分(含这块)可被整体预渲染
    const { posts, source, generatedAt } = await getTaggedPosts();

    return (
        <TopicPage
            path="/data/revalidation"
            title="按需失效实战"
            description="cacheTag 打标 + revalidateTag/updateTag 精准唤醒:SWR 与立即过期两种语义在同一份缓存产物上对照,tag 与 path 的失效粒度选择"
            references={[
                { label: "Next.js 文档:revalidateTag", href: "https://nextjs.org/docs/app/api-reference/functions/revalidateTag" },
                { label: "Next.js 文档:updateTag", href: "https://nextjs.org/docs/app/api-reference/functions/updateTag" },
                { label: "Next.js 文档:revalidatePath", href: "https://nextjs.org/docs/app/api-reference/functions/revalidatePath" },
                { label: "Next.js 文档:cacheTag", href: "https://nextjs.org/docs/app/api-reference/functions/cacheTag" },
            ]}
        >
            <TopicSection
                title="活演示:同一份缓存,两种失效语义"
                note="这份产物用 cacheLife(&quot;max&quot;) 冻结了时间窗口 —— 时间戳不变是特性;它只认 cacheTag,点击按钮后再刷新观察"
            >
                <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                    <p className="font-mono text-[11px] text-neutral-500">
                        缓存产物生成时刻(UTC)· 标签 {REVALIDATION_TAG}
                    </p>
                    <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                        {generatedAt}
                    </p>
                    {source === "fallback" && (
                        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            外部数据不可用,当前为本地兜底(data/blog.ts 的 FALLBACK_POSTS)
                        </p>
                    )}
                </div>
                <ul className="mt-3 space-y-1.5">
                    {posts.map((p) => (
                        <li
                            key={p.id}
                            className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400"
                        >
                            <span className="font-mono text-neutral-400 dark:text-neutral-500">
                                #{p.id}
                            </span>{" "}
                            {p.title}
                        </li>
                    ))}
                </ul>
                <div className="mt-4">
                    <InvalidateButtons />
                </div>
                <p className="mt-4 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    预期观察:左按钮点击后本页立即重取,时间戳<strong>不变</strong>
                    (旧值先回、后台重建),再刷新一次才变;右按钮点击后时间戳
                    <strong>当场就变</strong>(读取方等重建完成)。
                    同一个标签、同一份产物,差异全部来自失效 API 的语义。
                </p>
            </TopicSection>

            <TopicSection
                title="四个失效/刷新 API 的分工"
                note="不是四个可互换的开关:调在哪、影响哪一层、读取方等不等,各不相同"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">API</th>
                                <th className="py-2 pr-4 font-semibold">调用位置</th>
                                <th className="py-2 pr-4 font-semibold">语义</th>
                                <th className="py-2 font-semibold">典型场景</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-mono text-[11px] text-neutral-800 dark:text-neutral-100">updateTag(tag)</td>
                                <td className="py-2 pr-4">仅 Server Action</td>
                                <td className="py-2 pr-4">立即过期;下一次读取等新值(read-your-own-writes)</td>
                                <td className="py-2">本页表单改了数据,响应里就要带新值</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-mono text-[11px] text-neutral-800 dark:text-neutral-100">revalidateTag(tag, profile)</td>
                                <td className="py-2 pr-4">Server Action / Route Handler</td>
                                <td className="py-2 pr-4">标过期;下次读取先回旧值、后台重建(SWR)</td>
                                <td className="py-2">CMS webhook、定时任务 —— 读者晚几秒看到无所谓</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-mono text-[11px] text-neutral-800 dark:text-neutral-100">revalidatePath(path)</td>
                                <td className="py-2 pr-4">Server Action / Route Handler</td>
                                <td className="py-2 pr-4">按路径失效:该路由渲染涉及的缓存条目全部作废旧值(SWR)</td>
                                <td className="py-2">留言板式变更:只知道「这页该重渲」,不记得打过什么标</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-mono text-[11px] text-neutral-800 dark:text-neutral-100">refresh()</td>
                                <td className="py-2 pr-4">仅 Server Action</td>
                                <td className="py-2 pr-4">不动服务端缓存;让客户端路由重取当前页(清客户端侧缓存)</td>
                                <td className="py-2">改了 cookie/会话等「不进缓存标签」的请求时数据,要立刻回读</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    cacheComponents 下的一个变化:Server Action 执行完不再自动重渲当前路由
                    —— 想让用户立刻看到变更,action 里要显式 revalidatePath / refresh
                    (本页两个 action 末尾的 refresh() 就是这个作用)。
                </p>
            </TopicSection>

            <TopicSection
                title="tag vs path:失效粒度怎么选"
                note="tag 的波及面由打标决定,path 的波及面由路由决定;选错了要么漏失效,要么误伤"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TAG_VS_PATH_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    本页的标签刻意独立命名为
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">{REVALIDATION_TAG}</code>
                    而不是复用 /rendering/isr 的
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">&quot;posts&quot;</code>
                    :cacheTag 是全局命名空间,共用标签意味着共用失效 ——
                    这里的按钮会把 ISR 页的缓存一起打掉。标签设计就是失效波及面设计。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别用 tags & 继续深入"
                note="按需失效的前提是「变更有人通知你」;没有这个前提,标签只是摆设"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>低频且没人通知变更的数据,直接别缓存</strong>:tags 适合
                        「源站变更能触发回调(webhook、后台任务)」的数据;如果变更只有你
                        自己知道,一个简单的 cacheLife 时间窗口比维护标签体系省心得多
                    </li>
                    <li>
                        <strong>高变更频率数据别用 tag 失效硬撑</strong>:失效重建也是成本,
                        每分钟都在变的数据,缓存命中率趋近于零,回到默认动态渲染
                    </li>
                    <li>
                        <strong>按人不同的数据进不了这套体系</strong>:tags 失效的是
                        「所有人共享的一份」,会话相关数据用 cookies() 在请求时渲染,
                        或下沉为客户端取数
                    </li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        href="/data/cache-layers"
                        className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                        四层缓存对照台 →
                    </Link>
                    <Link
                        href="/engineering/caching-strategy"
                        className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                        缓存策略决策树 →
                    </Link>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    按需失效在缓存全景里的位置(它失效的是哪一层、客户端那层怎么办)见四层缓存对照台;
                    「一个页面该选时间窗口还是标签失效」的完整决策流程见缓存策略专题。
                </p>
            </TopicSection>
        </TopicPage>
    );
}
