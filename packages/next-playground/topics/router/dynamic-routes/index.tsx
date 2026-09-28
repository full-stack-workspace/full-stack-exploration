/**
 * ============================================================================
 * 动态路由与动态 metadata — 路由机制专题
 * ============================================================================
 *
 * 从原 /user/[id] 页迁移,演示两个配套机制:
 *
 * 1. 动态段:[id] 目录把 URL 段变成 params;详情页是 Client Component,
 *    用 useParams 取参 + SWR 取数据
 * 2. 动态 metadata:Client 页面无法导出 metadata,
 *    由同级 layout.tsx(Server Component)的 generateMetadata 按 id 生成
 *
 * @module topics/router/dynamic-routes
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import { users } from "@/data/user";

export default function DynamicRoutesTopic() {
    return (
        <TopicPage
            title="动态路由与动态 metadata"
            description="[id] 动态段 + useParams 客户端取参;Client 页面无法导出 metadata 时,用同级 layout 的 generateMetadata 兜底"
        >
            <TopicSection
                title="进入一条动态段详情"
                note="/router/dynamic-routes/[id];详情页为 Client Component(SWR 取文章),metadata 由同级 layout 动态生成"
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {users.map((u) => (
                        <Link
                            key={u.id}
                            href={`/router/dynamic-routes/${u.id}`}
                            className="group flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 transition-all hover:border-primary-200 hover:bg-white hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                                {u.id}
                            </span>
                            <span>
                                <span className="block text-sm font-medium text-neutral-900 group-hover:text-primary-600 dark:text-neutral-50 dark:group-hover:text-primary-400">
                                    {u.name}
                                </span>
                                <span className="block text-xs text-neutral-400">
                                    /router/dynamic-routes/{u.id}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </TopicSection>

            <TopicSection
                title="为什么 metadata 放在 layout 里"
                note="约束决定结构,而不是习惯"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>page.tsx 一旦标记 &quot;use client&quot;,就不能再导出 metadata/generateMetadata——元信息在服务端求值,客户端模块里没有这个机会</li>
                    <li>同级 layout.tsx 始终是 Server Component,且同样能拿到 params,是动态 metadata 的合法落脚点</li>
                    <li>更好的做法是把需要交互的部分下沉为 Client 子组件,让 page 保持 Server——本专题的 [id] 页是「不得不 Client」时的兜底模式</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
