/**
 * ============================================================================
 * 错误与未找到 — 路由机制专题
 * ============================================================================
 *
 * 约定文件对照表里写了 error / not-found,但原先没有可以按下去的页。
 * 本页四件事都能当场看到:
 * - 渲染期抛错 → 本段 error.tsx(壳层保留)
 * - notFound() → 本段 not-found.tsx,而且不会被 error.tsx 接住
 * - unauthorized() / forbidden() → 本段 unauthorized.tsx / forbidden.tsx(401/403)
 * - 根布局崩溃 → app/global-error.tsx(本站真实存在,用源码讲,不做触发实验)
 *
 * @module topics/router/errors
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { TriggerError } from "./TriggerError";

export default function ErrorsTopic() {
    return (
        <TopicPage
            path="/router/errors"
            title="错误与未找到"
            description="error.tsx 接渲染失败,not-found.tsx 接 notFound(),unauthorized/forbidden 接 401/403 认证中断;global-error.tsx 是根布局崩溃时换掉整个文档的最后一道"
            references={[
                { label: "Next.js 文档:Error Handling", href: "https://nextjs.org/docs/app/getting-started/error-handling" },
                { label: "Next.js 文档:notFound()", href: "https://nextjs.org/docs/app/api-reference/functions/not-found" },
                { label: "Next.js 文档:unauthorized()", href: "https://nextjs.org/docs/app/api-reference/functions/unauthorized" },
                { label: "Next.js 文档:forbidden()", href: "https://nextjs.org/docs/app/api-reference/functions/forbidden" },
            ]}
        >
            <TopicSection
                title="按下去,看本段 error.tsx"
                note="抛错发生在渲染阶段。按钮的 onClick 本身不会被 Error Boundary 接住,所以用一次 state 更新把异常留到下一次渲染"
            >
                <TriggerError />
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    触发后,这个专题页会被
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        app/router/errors/error.tsx
                    </code>
                    换掉。顶栏还在,因为错误边界包的是这一段,不是根布局。
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        global-error.tsx
                    </code>
                    才会换掉根布局 —— 本站现在有真实的
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        app/global-error.tsx
                    </code>
                    了(见下方专节),但不拿线上壳层做触发实验。
                </p>
            </TopicSection>

            <TopicSection
                title="打开一条不存在的地址"
                note="notFound() 不是异常。error.tsx 接不住它"
            >
                <Link
                    href="/router/errors/missing"
                    className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                >
                    打开 /router/errors/missing
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    那个路由的 page 直接调用 notFound(),由同段的 not-found.tsx 渲染。
                    预期中的空(用户被删了、id 不存在)走这条;渲染崩溃走 error.tsx。
                </p>
            </TopicSection>

            <TopicSection
                title="五份文件各管什么"
                note="先问这是失败,还是本来就没有;认证中断与 404 一样是「中断」,不是异常"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm leading-relaxed">
                        <thead>
                            <tr className="border-b border-rule text-xs text-neutral-500 dark:border-neutral-700">
                                <th className="py-2 pr-4 font-medium">文件</th>
                                <th className="py-2 pr-4 font-medium">什么时候出现</th>
                                <th className="py-2 font-medium">必须是 Client?</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">error.tsx</td>
                                <td className="py-2 pr-4">本段渲染抛错</td>
                                <td className="py-2">是。它要提供 reset()</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">not-found.tsx</td>
                                <td className="py-2 pr-4">调用了 notFound(),或没有匹配的页面</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">unauthorized.tsx</td>
                                <td className="py-2 pr-4">调用了 unauthorized()(HTTP 401,未认证)</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">forbidden.tsx</td>
                                <td className="py-2 pr-4">调用了 forbidden()(HTTP 403,已认证但没权限)</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">global-error.tsx</td>
                                <td className="py-2 pr-4">根布局自己坏了</td>
                                <td className="py-2">是,并且要自己写 html 和 body</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="按下去,看 401 与 403"
                note="unauthorized() / forbidden() 与 notFound() 同族:抛出即中断渲染,交给最近的同名约定文件,不进 error.tsx"
            >
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/router/errors/locked"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/errors/locked(触发 unauthorized)
                    </Link>
                    <Link
                        href="/router/errors/admin"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/errors/admin(触发 forbidden)
                    </Link>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>语义分工</strong>:401 回答「你是谁」(未登录、会话过期,
                        登录入口该出现在 unauthorized.tsx 里);403 回答「我知道你是谁,
                        但你没权限」(角色不足,引导换账号/申请权限)
                    </li>
                    <li>
                        两个演示页的闸门都先
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            await connection()
                        </code>
                        再抛 —— 权限是请求时决策,不能出现在预渲染阶段
                        (cacheComponents 约束),所以闸门包在 Suspense 里
                    </li>
                    <li>
                        真实项目里闸门的位置是「读 session → 分支」;本站没有登录体系,
                        固定演示两个失败分支。与
                        <Link
                            href="/router/dynamic-routes"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            notFound()
                        </Link>
                        一样,它们抛出的不是 Error,error.tsx 接不住也不该接
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="global-error.tsx:根布局崩溃时的最后一道"
                note="本站真的有这份文件了 —— app/global-error.tsx,这里直接引用它的源码事实"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>边界</strong>:error.tsx 只能接「本段 page 及子树」的错误,
                        接不住根 layout 自己的崩溃;根布局坏了时,
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            app/global-error.tsx
                        </code>
                        替换的是<strong>整个文档</strong>,顶栏侧边栏全军覆没
                    </li>
                    <li>
                        <strong>必须自带 &lt;html&gt;/&lt;body&gt;</strong>:根布局被换掉了,
                        文档骨架没人提供 —— 这是全站唯一一个自己渲染 html/body 的非根布局文件
                    </li>
                    <li>
                        <strong>必须是 Client Component</strong>:与 error.tsx 同理,
                        reset() 依赖客户端 Error Boundary;本站的实现第一行就是
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            &quot;use client&quot;
                        </code>
                    </li>
                    <li>
                        <strong>全内联样式,零外部依赖</strong>:根布局崩溃意味着 globals.css、
                        字体变量都可能不可用,本站的 global-error 只用内联样式 +
                        品牌底色 + signal 磷光,连 Tailwind 类都不写
                    </li>
                    <li>
                        <strong>为什么不做活演示</strong>:触发它得让根布局真的抛错,
                        那会把全站(包括导航回专题页的能力)一起打挂;读
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            app/global-error.tsx
                        </code>
                        源码就是本站选择的演示方式
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
