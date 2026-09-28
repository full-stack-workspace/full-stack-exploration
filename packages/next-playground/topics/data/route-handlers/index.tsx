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
            title="Route Handler"
            description="GET/POST/PUT/DELETE 四方法端点;Route Handler 与页面取数相互独立,各自直连外部服务避免构建期自调用"
        >
            <TopicSection
                title="调用 /api/basic"
                note="端点见 app/api/basic/route.ts;点击方法按钮发起真实请求"
            >
                <ApiPlayground />
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
