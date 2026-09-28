/**
 * 薄壳:Streaming 专题路由。
 * force-dynamic 是演示成立的前提:阻止构建期整体预渲染,
 * 让每个请求在运行时真实经历「静态壳 → 分段补洞」的流式过程。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import StreamingTopic from "@/topics/rendering/streaming";

/** 强制运行时动态渲染,否则 Suspense 分段在构建期就被拍平成静态 HTML */
export const dynamic = "force-dynamic";

export const metadata = getTopicMetadata("/rendering/streaming");

export default function Page() {
    return <StreamingTopic />;
}
