/**
 * ============================================================================
 * Route Handler — 数据与缓存专题
 * ============================================================================
 *
 * 从原 /api/basic 端点延伸成专题页:端点本身保留在 app/api/basic/route.ts,
 * 本页用 ApiPlayground 逐一调用四个方法,并讲清 Route Handler 的存在理由。
 *
 * @module topics/data/route-handlers
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { ApiPlayground } from "./components/ApiPlayground";

export default function RouteHandlersTopic() {
    return (
        <TopicPage
            path="/data/route-handlers"
            title="Route Handler"
            description="GET/POST/PUT/DELETE 四方法端点;Route Handler 与页面取数相互独立,各自直连外部服务避免构建期自调用"
            references={[
                { label: "Next.js 文档:Route Handler(file conventions/route)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/route" },
            ]}
        >
            <TopicSection
                title="调用 /api/basic"
                note="端点见 app/api/basic/route.ts;点击方法按钮发起真实请求"
            >
                <ApiPlayground />
            </TopicSection>

            <TopicSection
                title="三条取数通道怎么选"
                note="先问调用方是不是浏览器里的这个页面"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm leading-relaxed">
                        <thead>
                            <tr className="border-b border-rule text-xs text-neutral-500 dark:border-neutral-700">
                                <th className="py-2 pr-4 font-medium">调用方</th>
                                <th className="py-2 pr-4 font-medium">用什么</th>
                                <th className="py-2 font-medium">不要用什么</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">本站页面,渲染时就要数据</td>
                                <td className="py-2 pr-4">Server Component 里直接取</td>
                                <td className="py-2">再 fetch 自己的 /api。构建期会连不上自己</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">表单修改服务端数据</td>
                                <td className="py-2 pr-4">Server Action</td>
                                <td className="py-2">为了页面自己再手写一个 POST</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">别的客户端、webhook、要流式字节</td>
                                <td className="py-2 pr-4">Route Handler</td>
                                <td className="py-2">Server Action。它不是公开的 HTTP 契约</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">水合之后才变的会话数据</td>
                                <td className="py-2 pr-4">SWR,见客户端取数专题</td>
                                <td className="py-2">把整页改成 Client 再自己 fetch</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="Route Handler 什么时候该存在"
                note="它是「对外的 HTTP 界面」,不是页面取数的必经层"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>给第三方/移动端/webhook 提供 HTTP API → 必须 Route Handler</li>
                    <li>页面自己的数据 → Server Component 里直接取,不要再绕一圈 fetch 自己的 API(构建期还会 ECONNREFUSED)</li>
                    <li>需要流式响应(SSE/逐 token)→ Route Handler 返回 ReadableStream,见 AI-Native 分类</li>
                    <li>改变服务端数据 → 优先评估 Server Actions,而不是手写 POST 端点</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
