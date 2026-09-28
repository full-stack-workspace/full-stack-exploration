/**
 * ============================================================================
 * SSR 请求时整页渲染 — 渲染策略专题
 * ============================================================================
 *
 * 光谱上 SSR 这一格原先只有说明、没有可刷新的对照。
 * 本页用 force-dynamic 让每次请求都在服务器现算:
 * 刷新后「渲染时刻」和「请求号」都会变。
 *
 * 它故意整页动态。若只有页面的一块数据慢,应改去 Streaming 或 PPR,
 * 不要把壳也拖进这一格。
 *
 * @module topics/rendering/ssr
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

interface SsrTopicProps {
    /** 本次请求在服务器上渲染的时刻 */
    renderedAt: string;
    /** 本次请求的随机号,用来证明响应没有被整页缓存 */
    requestId: string;
}

/**
 * @param props.renderedAt - 路由文件里 `new Date()` 的结果
 * @param props.requestId - 路由文件里 `crypto.randomUUID()` 的结果
 */
export default function SsrTopic({ renderedAt, requestId }: SsrTopicProps) {
    return (
        <TopicPage
            title="SSR 请求时整页渲染"
            description="force-dynamic 的整页:每次请求都在服务器现算完再发出。刷新本页,时刻和请求号都会变。只有整页都必须实时时才落在这一格"
        >
            <TopicSection
                title="刷新一次,这两个值就会变"
                note="薄壳 app/rendering/ssr/page.tsx 导出了 dynamic = force-dynamic,所以下面不是构建期冻住的字符串"
            >
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                        <dt className="font-mono text-[11px] text-neutral-500">渲染时刻</dt>
                        <dd className="mt-1 font-mono text-sm text-ink dark:text-neutral-100">
                            {renderedAt}
                        </dd>
                    </div>
                    <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                        <dt className="font-mono text-[11px] text-neutral-500">请求号</dt>
                        <dd className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                            {requestId}
                        </dd>
                    </div>
                </dl>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    对照
                    <Link href="/rendering/isr" className="mx-1 text-copper-600 underline underline-offset-2 dark:text-copper-400">
                        ISR 页
                    </Link>
                    :那边 60 秒内刷新仍是同一份 HTML。这边每次刷新都是一次新的服务器渲染,TTFB 要等整页算完。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候才整页 SSR"
                note="默认尽量靠左。整页动态是光谱上偏贵的一格"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>页面主体依赖这次请求的 cookie、权限或不可共享的数据,缓存一份 HTML 会串用户</li>
                    <li>数据必须是请求时刻的,而且页面量不大,不值得再设计失效</li>
                    <li>
                        只有一块慢:去
                        <Link href="/rendering/streaming" className="mx-1 text-copper-600 underline underline-offset-2 dark:text-copper-400">
                            Streaming
                        </Link>
                        ,让壳先到
                    </li>
                    <li>
                        壳可以冻结、洞必须实时:去
                        <Link href="/rendering/ppr" className="mx-1 text-copper-600 underline underline-offset-2 dark:text-copper-400">
                            PPR
                        </Link>
                        ,不要把壳也标成动态
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
