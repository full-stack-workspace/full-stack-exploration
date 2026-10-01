/**
 * ============================================================================
 * 平行路由与拦截 — 路由机制专题
 * ============================================================================
 *
 * 列表在 children 槽,弹层在 @modal 槽。
 * 从本页用 Link 进入 /shot/[id] 时,(.)shot 把详情拦截进弹层;
 * 同一 URL 直接打开则渲染 shot/[id]/page.tsx 的完整页。
 *
 * @module topics/router/parallel
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { SHOTS } from "./shots";

export default function ParallelTopic() {
    return (
        <TopicPage
            path="/router/parallel"
            title="平行路由与拦截"
            description="同一条 URL,两种渲染:从列表点进去是弹层(列表不卸载),刷新或硬导航是完整页。@modal 负责槽,(.)shot 负责拦截,default.tsx 保证直接打开列表时槽是空的"
            references={[
                { label: "Next.js 文档:Parallel Routes(file conventions)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes" },
                { label: "Next.js 文档:Intercepting Routes(file conventions)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes" },
            ]}
        >
            <TopicSection
                title="从列表点进去"
                note="这些链接走客户端导航,会被 @modal/(.)shot 拦截。看完按 Esc 或点遮罩回来"
            >
                <ul className="grid gap-3 sm:grid-cols-3">
                    {SHOTS.map((shot) => (
                        <li key={shot.id}>
                            <Link
                                href={`/router/parallel/shot/${shot.id}`}
                                className="flex h-full flex-col justify-between border border-rule px-4 py-4 transition-colors hover:border-signal-500 dark:border-neutral-700"
                            >
                                <span className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                                    {shot.label}
                                </span>
                                <span className="mt-3 font-mono text-[11px] text-neutral-500">
                                    /shot/{shot.id}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候用拦截,什么时候不用"
                note="拦截保存的是列表的挂载,不是一份第二套数据"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>详情盖在列表上、关掉后滚动和筛选还在:用平行槽 + 拦截。URL 可复制,刷新仍是完整页</li>
                    <li>详情就是这次访问的主体(文章、设置页):不要拦截,直接渲染完整页</li>
                    <li>
                        <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">default.tsx</code>
                        不能省。没有它,软导航回到列表时 @modal 没有匹配,槽会 404
                    </li>
                    <li>拦截只发生在客户端导航。本页弹层里的「硬导航」用的是普通 a 标签,就是为了绕过它</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
