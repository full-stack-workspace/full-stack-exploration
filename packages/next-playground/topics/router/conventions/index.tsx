/**
 * ============================================================================
 * 约定文件对照 — 路由机制专题(梳理页)
 * ============================================================================
 *
 * App Router 的 app/ 目录里有一批「文件名即配置」的约定文件:
 * page / layout / loading / error / not-found / template / default。
 * 本页用一张对照表讲清各自职责与渲染时机,并用嵌套树示意层级关系。
 *
 * 本页自己也是演示素材:同目录的 app/router/conventions/loading.tsx
 * 是一个真实的 loading 约定文件,首次渲染本页时由它兜底。
 *
 * @module topics/router/conventions
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 示意块
 * ================================================================ */

/** 嵌套 layout 层级树 */
const NESTING_TREE = `app/
├── layout.tsx          ← 根布局:全局唯一,<html>/<body> 只能在这写
│   ├── page.tsx        ← 首页(路由 /)
│   └── router/
│       ├── layout.tsx  ← 嵌套布局:包 /router 下所有页(可选,没有就透传)
│       ├── dynamic-routes/
│       │   ├── page.tsx        ← 列表页
│       │   └── [id]/
│       │       └── page.tsx    ← 详情页:Server + generateMetadata
│       ├── errors/
│       │   ├── error.tsx       ← 渲染失败(必须 Client)
│       │   ├── not-found.tsx   ← notFound(),不进 error.tsx
│       │   └── page.tsx
│       └── conventions/
│           ├── loading.tsx     ← 本页的骨架屏(本页的活例子)
│           └── page.tsx        ← 你正在看的页面

渲染时的包裹关系(由内向外套娃):
  RootLayout → RouterLayout → [Id]Layout → Page
每个 layout 保持挂载不卸载,导航时只有 page 段会换`;

/** template vs layout 对照 */
const TEMPLATE_CODE = `// app/template.tsx —— 与 layout 同位置、同形状,但语义不同
export default function Template({ children }: { children: React.ReactNode }) {
    // 每次在本段内导航,template 都会整体重挂载:
    //   - 内部 state 清零
    //   - effect 重新执行
    //   - 每次进入都重新触发一次进入动画
    return <div>{children}</div>;
}

// layout.tsx 则相反:导航时保持挂载,state 保留、effect 不重跑。
// 因此默认用 layout;只有「每次进入都要从头再来」的场景才用 template`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function ConventionsTopic() {
    return (
        <TopicPage
            title="约定文件对照"
            description="page / layout / loading / error / not-found / template / default 各管什么:一张对照表 + 嵌套层级示意;本页自带真实 loading.tsx 演示 Suspense 边界"
        >
            <TopicSection
                title="文件 → 职责 → 渲染时机"
                note="文件名即配置:放在哪一级目录,就管哪一级路由段"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">约定文件</th>
                                <th className="py-2 pr-4 font-semibold">职责</th>
                                <th className="py-2 pr-4 font-semibold">渲染时机</th>
                                <th className="py-2 font-semibold">必须 Client?</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">page.tsx</td>
                                <td className="py-2 pr-4">该路由段的页面主体,export default 即页面</td>
                                <td className="py-2 pr-4">每次访问该路由时</td>
                                <td className="py-2">否(默认 Server)</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">layout.tsx</td>
                                <td className="py-2 pr-4">包裹本段及所有子段的共享外壳</td>
                                <td className="py-2 pr-4">进入该段时挂载,段内导航保持不卸载</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">loading.tsx</td>
                                <td className="py-2 pr-4">给本段 page 自动包一层 Suspense 的 fallback</td>
                                <td className="py-2 pr-4">页面渲染(取数)未完成期间</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">error.tsx</td>
                                <td className="py-2 pr-4">给本段包一层 Error Boundary,接住渲染错误</td>
                                <td className="py-2 pr-4">本段渲染抛错时替换 page</td>
                                <td className="py-2">是</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">not-found.tsx</td>
                                <td className="py-2 pr-4">notFound() 抛出时的兜底 UI</td>
                                <td className="py-2 pr-4">本段调用 notFound() 或访问未匹配路由时</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">template.tsx</td>
                                <td className="py-2 pr-4">与 layout 同位的外壳,但每次导航重挂载</td>
                                <td className="py-2 pr-4">每次进入本段都重新挂载</td>
                                <td className="py-2">否</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">default.tsx</td>
                                <td className="py-2 pr-4">并行路由(@slot)在当前 URL 下无匹配时的兜底</td>
                                <td className="py-2 pr-4">并行路由槽位失配 / 硬刷新恢复时</td>
                                <td className="py-2">否</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="嵌套 layout 的层级(本站真实结构节选)"
                note="layout 是套娃:每多一层目录就多一层可选外壳;导航时只有叶子 page 被替换"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{NESTING_TREE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    详情页没有再套一层只为了标题的 layout:page 保持 Server Component,
                    generateMetadata 与页面写在一起。见
                    <Link
                        href="/router/dynamic-routes"
                        className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                    >
                        动态路由专题
                    </Link>
                    。default.tsx 的活例子在
                    <Link
                        href="/router/parallel"
                        className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                    >
                        平行路由
                    </Link>
                    。
                </p>
            </TopicSection>

            <TopicSection
                title="活演示:本页的 loading.tsx 就是一个真约定文件"
                note="loading.tsx 的本质:Next 自动把本段 page 包进 <Suspense fallback={Loading}>"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        源码见
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            app/router/conventions/loading.tsx
                        </code>
                        —— 一个与 TopicSection 外形对齐的骨架屏,首次渲染本段时由它兜底
                    </li>
                    <li>
                        本页是纯静态内容,渲染几乎瞬间完成,骨架大概率一闪而过;
                        想看明显的 loading 效果,对照
                        <Link
                            href="/rendering/streaming"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            /rendering/streaming
                        </Link>
                        —— 那里手写 Suspense 分段流式,loading.tsx 是它的「段级自动版」
                    </li>
                    <li>
                        推论:loading.tsx 不影响数据加载本身,它只是把「等待」变成可设计的产品状态;
                        边界粒度决定哪个区块先出现,整段共用一个 loading 意味着整段一起等
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用:template vs layout、error 为何必须是 Client"
                note="决策要点:重挂载是特性不是免费;Error Boundary 在服务端没有意义"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TEMPLATE_CODE}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>别拿 template 当默认</strong>:每次导航重挂载意味着 state 清零、
                        effect 重跑、DOM 重建;只有「每次进入都要重置」的场景(进入动画、
                        每页独立埋点初始化)才值得付这个代价,其余一律 layout
                    </li>
                    <li>
                        <strong>error.tsx 必须是 Client Component</strong>:它本质是一个
                        React Error Boundary,需要在渲染失败后用 state 接住错误并提供
                        reset() 重试 —— 这套机制只存在于客户端运行时,服务端渲染流里没有
                        「重试已失败的子树」这回事。因此写 error.tsx 时第一行必然是
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            &quot;use client&quot;
                        </code>
                    </li>
                    <li>
                        <strong>别指望 error.tsx 接住一切</strong>:它只接本段 page 及其子树的渲染错误,
                        接不住同级 layout 自身的错误,也接不住事件回调里的异步异常(那要 try/catch)。
                        按下去看效果:
                        <Link
                            href="/router/errors"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            错误与未找到
                        </Link>
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
