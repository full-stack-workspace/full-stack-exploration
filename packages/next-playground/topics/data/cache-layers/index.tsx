/**
 * ============================================================================
 * 四层缓存对照台 — 数据与缓存专题(核心页)
 * ============================================================================
 *
 * Next.js 的缓存不是「一个开关」,而是四层各自独立、生命周期不同的机制:
 * 1. Request Memoization — 单次渲染内 React cache()/fetch 去重
 * 2. Data Cache — fetch 结果的服务端持久缓存
 * 3. Full Route Cache — 整页静态产物(HTML + RSC 载荷)
 * 4. Router Cache — 客户端导航缓存
 *
 * 模型演进备注:四层名称出自旧模型(Next 15 及以前)。本站已全站开启
 * cacheComponents:② Data Cache 与 ③ Full Route Cache 被 "use cache"
 * 显式缓存模型吸收(缓存什么、活多久都由指令声明,不再有隐式分层);
 * ① Request Memoization 与 ④ Router Cache 在新模型下原样保留。
 * 每层一节:机制一句话 + 生命周期/失效方式 + 代码对照或可运行演示。
 *
 * @module topics/data/cache-layers
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { RouterCacheDemo } from "./components/RouterCacheDemo";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** Request Memoization:指向本仓库 data/blog.ts 的真实例子 */
const MEMOIZATION_CODE = `// data/blog.ts —— 本仓库正在使用的真实例子
import { cache } from "react";

export const getPosts = cache(async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    return res.json();
});

// 同一个渲染周期里:
//   generateMetadata() 调一次 getPosts()   ┐ 参数相同
//   Page 组件再调一次 getPosts()           ┘ → 只发一次 HTTP 请求
// 注意:去重只活在「单次渲染」内,跨请求不保留 —— 跨请求是
// "use cache" 缓存条目(旧模型叫 Data Cache)的职责`;

/** Data Cache:旧模型的 fetch 缓存 vs 本站现行的 "use cache" */
const DATA_CACHE_CODE = `// 旧模型(Next 15 及以前):fetch 默认不缓存,
// 显式进入 Data Cache 靠 fetch 选项
const cached = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60, tags: ["posts"] },
});

// 本站现行(cacheComponents):取数默认动态,
// 缓存用 "use cache" 声明在函数/组件上,粒度不再绑死 fetch
async function getPosts() {
    "use cache";
    cacheLife({ revalidate: 60 });   // 对齐旧 next.revalidate
    cacheTag("posts");               // 对齐旧 next.tags
    const res = await fetch("https://api.example.com/posts");
    return res.json();
}

// 失效方式(两模型一致):
//   - 时间到:60s 后下一个请求触发后台重取(陈旧-回源-再验证)
//   - 主动:revalidateTag("posts") 按标签精准失效
//          revalidatePath("/data/cache-layers") 连带该路径的缓存产物一起失效`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function CacheLayersTopic() {
    return (
        <TopicPage
            path="/data/cache-layers"
            title="四层缓存对照台"
            description="Request Memoization / Data Cache / Full Route Cache / Router Cache:四层各管一段生命周期,「时新时不新」先定位是哪一层;四层名称出自旧模型,文末附 cacheComponents 演进备注"
            references={[
                { label: "Next.js 文档:Caching(Cache Components 默认模型)", href: "https://nextjs.org/docs/app/getting-started/caching" },
                { label: "Next.js 文档:&quot;use cache&quot; 指令", href: "https://nextjs.org/docs/app/api-reference/directives/use-cache" },
                { label: "Next.js 文档:staleTimes 配置(Router Cache)", href: "https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes" },
                { label: "React 文档:cache()", href: "https://react.dev/reference/react/cache" },
            ]}
        >
            <TopicSection
                title="总览:四层各管一段生命周期"
                note="从短到长排列;任何「数据没更新」的问题,答案都藏在其中一层"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">层</th>
                                <th className="py-2 pr-4 font-semibold">缓存什么</th>
                                <th className="py-2 pr-4 font-semibold">存活在哪</th>
                                <th className="py-2 font-semibold">怎么失效</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">Request Memoization</td>
                                <td className="py-2 pr-4">fetch / cache() 返回值</td>
                                <td className="py-2 pr-4">单次服务端渲染,渲染完即销毁</td>
                                <td className="py-2">无需失效:活不过一个请求</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">Data Cache</td>
                                <td className="py-2 pr-4">fetch 响应体</td>
                                <td className="py-2 pr-4">服务端,跨请求、跨部署持久</td>
                                <td className="py-2">revalidate 到期 / revalidateTag / revalidatePath</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">Full Route Cache</td>
                                <td className="py-2 pr-4">整页 HTML + RSC 载荷</td>
                                <td className="py-2 pr-4">服务端,构建期/再生时产出</td>
                                <td className="py-2">revalidate 到期 / revalidatePath / 重新部署</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">Router Cache</td>
                                <td className="py-2 pr-4">访问过的路由 RSC 载荷</td>
                                <td className="py-2 pr-4">浏览器内存,随会话</td>
                                <td className="py-2">staleTimes 到期 / router.refresh() / Server Action 后自动失效</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    <strong>模型演进:</strong>四层名称出自旧模型(Next 15 及以前,route segment config 时代)。
                    本站已全站开启 cacheComponents:② 与 ③ 被
                    <code className="mx-1 rounded bg-neutral-100 px-0.5 dark:bg-neutral-800">&quot;use cache&quot;</code>
                    显式缓存模型吸收 —— 缓存什么、活多久、按什么标签失效,都声明在函数/组件上,
                    不再有「fetch 结果一层、整页产物一层」的隐式分层;
                    ① Request Memoization(React cache())与 ④ Router Cache 在新模型下原样保留。
                    旧模型的完整四层文档见
                    <a
                        href="https://nextjs.org/docs/app/guides/caching-without-cache-components"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-1 text-signal-600 underline underline-offset-2 hover:text-signal-500 dark:text-signal-400"
                    >
                        Caching without Cache Components
                    </a>
                    。
                </p>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    「staleTimes 到期」指 Router Cache 里每份载荷的保质期:Next 15 起 page 段默认
                    0s(前进式导航每次都重取),布局段与预取载荷默认 30s;前进/后退还原历史页不受此限。
                    可用 next.config.ts 的 experimental.staleTimes 调整,语义详解见
                    <Link
                        href="/router/navigation"
                        className="mx-1 text-signal-600 underline underline-offset-2 hover:text-signal-500 dark:text-signal-400"
                    >
                        导航与 Router Cache
                    </Link>
                    的 staleTimes 一节。
                </p>
            </TopicSection>

            <TopicSection
                title="① Request Memoization — 单次渲染内的请求去重"
                note="机制:同一渲染周期内,相同 fetch/cache() 调用只执行一次;生命周期:一个请求,渲染完即销毁"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{MEMOIZATION_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    本仓库的 /rendering/isr 页正在使用它:generateMetadata 与页面组件各调一次
                    getPosts(),实际只发一次请求 —— 源码见 data/blog.ts。
                </p>
            </TopicSection>

            <TopicSection
                title="② Data Cache — fetch 结果的服务端持久缓存"
                note="旧模型的隐式层;本站现行(cacheComponents)下由 &quot;use cache&quot; 显式声明吸收,语义对应关系见代码对照"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{DATA_CACHE_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="③ Full Route Cache — 整页静态产物"
                note="旧模型的隐式层;本站现行(cacheComponents)下由预渲染 + &quot;use cache&quot; 产物承接,○/◐ 标记即其形态"
            >
                {/* dev 下观察不到的显著警告 */}
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                    <strong>注意:整页静态产物只在生产构建(next build + next start)下生效。</strong>
                    next dev 里每个请求都重新渲染,观察不到这一层;
                    而下面第 ④ 层 Router Cache 在 dev / prod 行为一致,可以直接在 dev 里演示。
                </div>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        进入该缓存的样子:
                        <Link
                            href="/rendering/isr"
                            className="mx-1 text-emerald-600 underline underline-offset-2 hover:text-emerald-500 dark:text-emerald-400"
                        >
                            /rendering/isr
                        </Link>
                        —— 取数标 &quot;use cache&quot; + cacheLife({"{"} revalidate: 60 {"}"}),
                        产物 60s 后由下一个请求触发后台再生(build 输出 ○,Revalidate 列 1m)
                    </li>
                    <li>
                        壳进缓存、洞不进的样子:
                        <Link
                            href="/rendering/streaming"
                            className="mx-1 text-emerald-600 underline underline-offset-2 hover:text-emerald-500 dark:text-emerald-400"
                        >
                            /rendering/streaming
                        </Link>
                        —— ◐(Partial Prerender):静态壳预渲染,Suspense 洞每次请求运行时重渲
                    </li>
                    <li>
                        本页自己也是素材:无动态 API、无请求时数据,生产构建后被整体预渲染;
                        build 输出里 ○(静态)标记即代表产物可被长期缓存
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="④ Router Cache — 客户端导航缓存(可运行)"
                note="机制:访问过的路由 RSC 载荷存在浏览器内存;生命周期:会话内,过期或手动 refresh"
            >
                <RouterCacheDemo />
            </TopicSection>

            <TopicSection
                title="什么时候别缓存 & 排查入口"
                note="缓存省的是重复,花的是新鲜度;先想清楚数据变脏了谁受影响"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>会话相关数据别进共享缓存</strong>:购物车、个人中心这类按人不同的数据,
                        用 cookies()/headers() 让内容在请求时渲染(自动成为动态洞),或下沉为客户端取数(SWR)
                    </li>
                    <li>
                        <strong>强实时数据别缓存</strong>:行情、库存、计数器,缓存带来的省钱抵不上脏数据的代价
                    </li>
                    <li>
                        <strong>「时新时不新」排查顺序</strong>:① 先退 Router Cache(硬刷新绕过客户端缓存)——
                        好了就是客户端层;② 再看整页产物(路由是否被预渲染,build 输出是 ○ / ◐ 还是 ƒ)——
                        静态页摘掉 &quot;use cache&quot; 或改 connection() 验证;③ 最后查取数层(缓存条目的
                        cacheLife/cacheTag 是否如预期,源站其实早就变了)—— 一层一层往下剥,而不是全局禁用缓存
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
