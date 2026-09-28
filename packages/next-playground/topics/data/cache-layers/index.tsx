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
// 注意:去重只活在「单次渲染」内,跨请求不保留 —— 跨请求是 Data Cache 的职责`;

/** Data Cache:默认不缓存 vs 显式缓存 */
const DATA_CACHE_CODE = `// Next 15 起,fetch 默认不缓存:每次服务端渲染都打到源站
const res = await fetch("https://api.example.com/posts");

// 显式进入 Data Cache:结果持久化在服务端,
// 60s 内任何请求(不止本次渲染)都直接命中缓存
const cached = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60, tags: ["posts"] },
});

// 失效方式:
//   - 时间到:60s 后下一个请求触发后台重取(陈旧-回源-再验证)
//   - 主动:revalidateTag("posts") 按标签精准失效
//          revalidatePath("/data/cache-layers") 连带该路径的 Data Cache 一起失效`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function CacheLayersTopic() {
    return (
        <TopicPage
            title="四层缓存对照台"
            description="Request Memoization / Data Cache / Full Route Cache / Router Cache:四层各管一段生命周期,「时新时不新」先定位是哪一层"
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
                                <td className="py-2 pr-4">服务端,跨请求、跨部署前持久</td>
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
                note="机制:fetch 响应体落服务端缓存,跨请求共享;生命周期:直到 revalidate 到期或被主动失效"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{DATA_CACHE_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="③ Full Route Cache — 整页静态产物"
                note="机制:构建期把整页渲染成 HTML + RSC 载荷存起来;生命周期:直到 revalidate 再生或重新部署"
            >
                {/* dev 下观察不到的显著警告 */}
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                    <strong>注意:Full Route Cache 只在生产构建(next build + next start)下生效。</strong>
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
                        —— revalidate=60,构建产物 60s 后由下一个请求触发后台再生
                    </li>
                    <li>
                        不进入该缓存的样子:
                        <Link
                            href="/rendering/streaming"
                            className="mx-1 text-emerald-600 underline underline-offset-2 hover:text-emerald-500 dark:text-emerald-400"
                        >
                            /rendering/streaming
                        </Link>
                        —— force-dynamic,每次请求运行时重渲,与 Full Route Cache 无关
                    </li>
                    <li>
                        本页自己也是素材:无动态 API、无 revalidate,生产构建后被整体缓存;
                        build 输出里 ○(静态)标记即代表进入了 Full Route Cache
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
                        用 cookies()/headers() 让路由自动退出 Full Route Cache,或下沉为客户端取数(SWR)
                    </li>
                    <li>
                        <strong>强实时数据别缓存</strong>:行情、库存、计数器,缓存带来的省钱抵不上脏数据的代价
                    </li>
                    <li>
                        <strong>「时新时不新」排查顺序</strong>:① 先退 Router Cache(硬刷新绕过客户端缓存)——
                        好了就是客户端层;② 再看 Full Route Cache(路由是否被静态化,build 输出是 ○ 还是 ƒ)——
                        静态页改 force-dynamic 验证;③ 最后查 Data Cache(fetch 是否带了 revalidate/tags,
                        源站其实早就变了)—— 一层一层往下剥,而不是全局禁用缓存
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
