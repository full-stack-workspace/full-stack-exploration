/**
 * 薄壳:Streaming 专题路由。
 * cacheComponents 下不再需要 force-dynamic:三个慢区块是 Suspense 边界内
 * 未缓存的 async 组件,自动成为请求时渲染的动态洞;静态壳在构建期预渲染,
 * 「壳先行 → 分段补洞」的流式过程因此每个请求真实发生。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import StreamingTopic from "@/topics/rendering/streaming";

export const metadata = getTopicMetadata("/rendering/streaming");

export default function Page() {
    return <StreamingTopic />;
}
