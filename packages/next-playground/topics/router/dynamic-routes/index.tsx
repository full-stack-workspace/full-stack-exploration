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
            path="/router/dynamic-routes"
            title="动态路由与动态 metadata"
            description="[id] 动态段保持 Server Component:generateStaticParams 预生成已知 id,generateMetadata 与页面同文件;不存在的 id 走 notFound()"
            references={[
                { label: "Next.js 文档:Dynamic Routes(file conventions)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes" },
                { label: "Next.js 文档:generateStaticParams", href: "https://nextjs.org/docs/app/api-reference/functions/generate-static-params" },
                { label: "Next.js 文档:generateMetadata", href: "https://nextjs.org/docs/app/api-reference/functions/generate-metadata" },
            ]}
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
                            className="group flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 transition-all hover:border-signal-400/50 hover:bg-white hover:shadow-md dark:border-neutral-800/60 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-500/10 text-sm font-bold text-signal-600 dark:bg-signal-500/15 dark:text-signal-400">
                                {u.id}
                            </span>
                            <span>
                                <span className="block text-sm font-medium text-neutral-900 group-hover:text-signal-600 dark:text-neutral-50 dark:group-hover:text-signal-400">
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
                title="详情页的真实代码(本站 app/router/dynamic-routes/[id]/page.tsx)"
                note="三个导出各管一件事:预生成哪些 id、每个 id 的标题、找不到怎么办"
            >
                <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    ① generateStaticParams:已知 id 构建期生成
                </p>
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`export function generateStaticParams() {
    // 列出 data/user.ts 里的 6 个用户;
    // 他们的详情在构建期就渲染成静态产物,不是每次请求现查
    return users.map((user) => ({ id: String(user.id) }));
}

// dynamicParams 不写,默认 true:名单之外的 id 仍会进 Page,
// 由下面的 notFound() 兜底;改成 false 则名单外直接整段 404`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    ② generateMetadata:与 page 同文件,async 里 await params
                </p>
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;   // Next 15 起 params 是 Promise
}): Promise<Metadata> {
    const { id } = await params;
    const user = getUserById(Number(id));
    if (!user) {
        // 404 页也给出标题,并禁止索引 —— 页面级 robots 的活例子
        return { title: "用户未找到", robots: { index: false, follow: true } };
    }
    return {
        title: \`\${user.name} - \${user.role}\`,
        description: user.bio,
        openGraph: { title: \`\${user.name} - \${user.role} | \${SITE_NAME}\`, type: "profile" },
    };
}`}
                </pre>
                <p className="mb-2 mt-4 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    ③ Page:notFound() 处理「没有这条」,而不是画空状态
                </p>
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{`export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = getUserById(Number(id));
    if (!user) {
        notFound(); // 交给本段 not-found.tsx,不进 error.tsx
    }
    return <UserDetail user={user} />;
}`}
                </pre>
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
