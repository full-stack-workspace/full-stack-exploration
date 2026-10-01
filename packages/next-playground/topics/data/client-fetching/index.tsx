/**
 * ============================================================================
 * 客户端取数与 SWR — 数据与缓存专题
 * ============================================================================
 *
 * 把「客户端取数」从 router/dynamic-routes 详情页里的顺手一用,
 * 提升为一次正式的通道选择:服务端 await 是默认答案,
 * SWR 只在四类场景里仍然是正确答案。
 *
 * @module topics/data/client-fetching
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { SwrPlayground } from "./components/SwrPlayground";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** 对照:同一份数据的两条取数通道 */
const CHANNEL_COMPARE = `// 默认答案:Server Component 里直接 await
// 无 loading 态、无瀑布、随页面一起流式到达、可进 Data Cache
export default async function Page() {
    const post = await fetch("https://api.example.com/posts/1").then(r => r.json());
    return <article>{post.title}</article>;
}

// SWR 答案:数据天然属于浏览器会话时才用它
"use client";
const { data } = useSWR("/api/cart", fetcher, {
    revalidateOnFocus: true,   // 用户切回标签页自动刷新
    refreshInterval: 5000,     // 准实时轮询
});`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function ClientFetchingTopic() {
    return (
        <TopicPage
            path="/data/client-fetching"
            title="客户端取数与 SWR"
            description="客户端取数的正确打开方式:能在 Server Component 里 await 就别用 SWR;但会话数据、聚焦重验证、轮询、离线缓存仍是 SWR 的主场"
            references={[
                { label: "Next.js 文档:Fetching Data", href: "https://nextjs.org/docs/app/getting-started/fetching-data" },
                { label: "SWR 官方文档", href: "https://swr.vercel.app" },
            ]}
        >
            <TopicSection
                title="两条通道先对照"
                note="选择依据不是「顺手」,而是「这份数据属于服务端渲染还是属于浏览器会话」"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CHANNEL_COMPARE}
                </pre>
            </TopicSection>

            <TopicSection
                title="SWR 演练(可运行)"
                note="请求 jsonplaceholder 的 /posts/1;两个开关分别对应 SWR 的杀手特性"
            >
                <SwrPlayground />
            </TopicSection>

            <TopicSection
                title="SWR 仍然正确的四类场景"
                note="共同点:数据的生命周期绑在浏览器会话上,而不是绑在页面上"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>用户会话数据</strong>:购物车、通知、未读数 —— 按人不同且随操作变化,
                        本就不该进服务端共享缓存;SWR 的 key 缓存让同页多处引用只发一次请求
                    </li>
                    <li>
                        <strong>聚焦重验证</strong>:用户切回标签页时自动后台重取,
                        首屏用缓存秒开、随后无缝换新 —— stale-while-revalidate 的名字来源
                    </li>
                    <li>
                        <strong>轮询/准实时</strong>:refreshInterval 一行开启,
                        比分发 setInterval + 手动 setState 少一整类清理 bug
                    </li>
                    <li>
                        <strong>离线/弱网韧性</strong>:内存 + 可配置的持久缓存,
                        断网时先给旧数据、恢复后自动重验证
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用 SWR"
                note="客户端取数的代价:多一次网络往返、多一个 loading 态、多一段客户端 JS"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>首屏关键数据</strong>:首屏必需的数据走客户端 = 白屏等 JS 下载完再发请求;
                        在 Server Component 里 await,随 HTML 一起到达
                    </li>
                    <li>
                        <strong>SEO 内容</strong>:爬虫对水合后才出现的正文收录不稳定,
                        标题/正文/列表这类被索引的内容必须服务端渲染
                    </li>
                    <li>
                        <strong>可在服务端并行的瀑布</strong>:A 接口的结果决定 B 接口的参数时,
                        客户端 SWR 只能串行(等 A 到浏览器再发 B);
                        服务端可以在同一数据中心里并行/消依赖,把瀑布掐灭在机房内网
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
