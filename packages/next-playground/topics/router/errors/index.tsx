/**
 * ============================================================================
 * 错误与未找到 — 路由机制专题
 * ============================================================================
 *
 * 约定文件对照表里写了 error / not-found,但原先没有可以按下去的页。
 * 本页两件事都能当场看到:
 * - 渲染期抛错 → 本段 error.tsx(壳层保留)
 * - notFound() → 本段 not-found.tsx,而且不会被 error.tsx 接住
 *
 * @module topics/router/errors
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { TriggerError } from "./TriggerError";

export default function ErrorsTopic() {
    return (
        <TopicPage
            title="错误与未找到"
            description="error.tsx 接渲染失败,not-found.tsx 接 notFound()。两套边界互不接管:预期里的「没有这条」不要抛错,失败了的渲染不要装成 404"
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
                    才会换掉根布局,本站不拿线上壳层做那个实验。
                </p>
            </TopicSection>

            <TopicSection
                title="打开一条不存在的地址"
                note="notFound() 不是异常。error.tsx 接不住它"
            >
                <Link
                    href="/router/errors/missing"
                    className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-copper-500 dark:border-neutral-700 dark:text-neutral-100"
                >
                    打开 /router/errors/missing
                </Link>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    那个路由的 page 直接调用 notFound(),由同段的 not-found.tsx 渲染。
                    预期中的空(用户被删了、id 不存在)走这条;渲染崩溃走 error.tsx。
                </p>
            </TopicSection>

            <TopicSection
                title="三份文件各管什么"
                note="先问这是失败,还是本来就没有"
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
                            <tr>
                                <td className="py-2 pr-4 font-medium text-ink dark:text-neutral-100">global-error.tsx</td>
                                <td className="py-2 pr-4">根布局自己坏了</td>
                                <td className="py-2">是,并且要自己写 html 和 body</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>
        </TopicPage>
    );
}
