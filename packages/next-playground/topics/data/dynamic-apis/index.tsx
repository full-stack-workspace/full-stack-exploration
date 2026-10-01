/**
 * ============================================================================
 * 动态 API 各一格 — 数据与缓存专题
 * ============================================================================
 *
 * cacheComponents 下「取数默认动态」的意思是:不用这些 API 的部分
 * 才能进静态壳,用了的部分必须声明自己是请求时数据。本页把四个
 * 常用动态 API 各摆一格活演示:
 *
 * - cookies()  :读写本次请求的 Cookie(写在 Server Action 里)
 * - headers()  :读本次请求的请求头(user-agent)
 * - connection():不读数据,只声明「等到请求到达再渲染」
 * - after()    :响应返回后的收尾任务通道(日志/指标),不影响渲染
 *
 * 前三个读的是「请求」:缓存的产物是「所有人共享的一份」,
 * 按请求不同的内容必须退出预渲染,所以它们必须待在 Suspense 洞内
 * (裸放顶层会报 blocking-route)。after() 不读请求,不受此限。
 *
 * 本组件是 Server Component:静态壳(标题、说明、四个分区的框架)
 * 可预渲染;三个请求时面板各自包在 Suspense 里成为动态洞,
 * after 演示是纯客户端 fetch,连洞都不需要。
 *
 * @module topics/data/dynamic-apis
 */

import { Suspense } from "react";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { AfterDemo } from "./components/AfterDemo";
import { ConnectionPanel } from "./components/ConnectionPanel";
import { CookiePanel } from "./components/CookiePanel";
import { HeadersPanel } from "./components/HeadersPanel";

/** 动态洞的占位:请求时数据到达前先渲染这个 */
function PanelFallback({ label }: { label: string }) {
    return (
        <div className="border border-dashed border-neutral-300 px-4 py-6 text-center font-mono text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
            {label}(请求时渲染中…)
        </div>
    );
}

export default function DynamicApisTopic() {
    return (
        <TopicPage
            path="/data/dynamic-apis"
            title="动态 API 各一格"
            description="cookies / headers / connection / after 四个请求级 API 的活演示:前三个让所在格退出静态、必须待在 Suspense 洞内,after 在响应返回后收尾"
            references={[
                { label: "Next.js 文档:cookies()", href: "https://nextjs.org/docs/app/api-reference/functions/cookies" },
                { label: "Next.js 文档:headers()", href: "https://nextjs.org/docs/app/api-reference/functions/headers" },
                { label: "Next.js 文档:connection()", href: "https://nextjs.org/docs/app/api-reference/functions/connection" },
                { label: "Next.js 文档:after()", href: "https://nextjs.org/docs/app/api-reference/functions/after" },
                { label: "Next.js 文档:draftMode()", href: "https://nextjs.org/docs/app/api-reference/functions/draftMode" },
            ]}
        >
            <TopicSection
                title="cookies() — 读写本次请求的 Cookie"
                note="它让这一格退出静态:Cookie 按请求不同而不同,缓存的共享产物装不下它;写只能在 Server Action / Route Handler 里"
            >
                <Suspense fallback={<PanelFallback label="cookies()" />}>
                    <CookiePanel />
                </Suspense>
            </TopicSection>

            <TopicSection
                title="headers() — 读取本次请求的请求头"
                note="同理退出静态:UA 按客户端不同而不同。换浏览器或用 curl 改 UA 重访,值随之变化"
            >
                <Suspense fallback={<PanelFallback label="headers()" />}>
                    <HeadersPanel />
                </Suspense>
            </TopicSection>

            <TopicSection
                title="connection() — 声明「等到请求到达再渲染」"
                note="不读任何数据,只是一句声明;它之后取当前时刻、生成随机 ID 才是合法的(渲染期裸 new Date() 会被冻结在构建期)"
            >
                <Suspense fallback={<PanelFallback label="connection()" />}>
                    <ConnectionPanel />
                </Suspense>
            </TopicSection>

            <TopicSection
                title="after() — 响应返回后的收尾任务"
                note="写日志、上报指标这类「不该拖慢响应」的工作;不读请求数据,不受 Suspense 规则约束,也不参与渲染缓存"
            >
                <AfterDemo />
            </TopicSection>

            <TopicSection
                title="为什么前三个必须待在 Suspense 洞内"
                note="cacheComponents 的核心交换:显式声明动态性,换取其余部分的预渲染"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        预渲染的产物是「所有人共享的一份」;cookies()/headers()/connection()
                        读的都是「本次请求」,放进静态产物就会把某个请求的数据发给所有人
                        —— 所以框架强制它们包在 Suspense 里,构建期预渲染到洞口为止,
                        洞的内容留到请求时流式补出(即 PPR 的静态壳 + 动态洞)
                    </li>
                    <li>
                        裸放在页面顶层会在构建期报 blocking-route 错误
                        —— 这不是限制,是框架替你挡住了「千人千面数据被共享缓存」这类事故
                    </li>
                    <li>
                        本页自己就是证据:页头、说明文字、四个分区的框架是静态壳
                        (构建期一次产出),三个面板是洞(每请求现算),
                        刷新时先看到壳和占位,洞随后到达
                    </li>
                    <li>
                        反例:after() 不读请求、不产渲染内容,只是响应后的任务通道,
                        所以它在 Route Handler / Server Action / Server Component 里
                        都能直接用,与 Suspense 无关
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="draftMode():只做了解"
                note="本站不做活演示的原因,本身就是个知识点"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    draftMode() 让特定请求绕过缓存看到草稿内容(CMS 预览场景),
                    本质上是「按 cookie 切换的又一种动态 API」。它必须有真实的
                    「草稿 vs 已发布」两套数据源才有意义,本站的 mock 数据没有
                    这一层,硬做只会演示一个永远开着的开关。需要时直接看
                    <a
                        href="https://nextjs.org/docs/app/api-reference/functions/draftMode"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-1 text-signal-600 underline underline-offset-2 hover:text-signal-500 dark:text-signal-400"
                    >
                        官方文档
                    </a>
                    。
                </p>
            </TopicSection>
        </TopicPage>
    );
}
