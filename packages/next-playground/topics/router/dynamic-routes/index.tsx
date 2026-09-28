/**
 * ============================================================================
 * 动态路由与动态 metadata — 路由机制专题
 * ============================================================================
 *
 * [id] 把 URL 段变成 params。详情页保持 Server Component:
 * generateStaticParams 预生成已知用户,generateMetadata 与 page 同文件。
 * 不存在的 id 调用 notFound(),而不是在客户端分支里画空状态。
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
            description="[id] 动态段保持 Server Component:generateStaticParams 预生成已知 id,generateMetadata 与页面同文件;不存在的 id 走 notFound()"
        >
            <TopicSection
                title="进入一条动态段详情"
                note="点进去看标签标题。详情页是 Server Component,标题由同文件的 generateMetadata 生成"
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
                title="动态段不等于整页动态"
                note="已知 id 在构建期就生成好了"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>generateStaticParams 列出这 6 个用户。他们的详情在构建期生成,不是每次请求现查一遍本地数组</li>
                    <li>generateMetadata 与 page 写在同一个 Server 文件里。只有 page 不得不标成 &quot;use client&quot; 时,才把标题挪到同级 layout</li>
                    <li>名单之外的 id 仍会进这个页面(dynamicParams 默认开启),getUserById 找不到就 notFound(),而不是返回一份空白资料卡</li>
                    <li>水合之后才需要变的数据(聚焦重验证、轮询)去客户端取数专题,不要为了它把整条详情改成 Client</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
