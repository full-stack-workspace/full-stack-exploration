/**
 * 薄壳:Server/Client 边界专题路由。
 * cacheComponents 下不再需要 force-dynamic:专题页那只活的 Promise
 * 是 Suspense 边界内未缓存的请求时数据,自动成为动态洞 ——
 * 「每次请求新建一份、刷新后重新等 700ms」的声称依然成立。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import PropsBoundaryTopic from "@/topics/rsc-boundary/props-boundary";

export const metadata = getTopicMetadata("/rsc-boundary/props-boundary");

export default function Page() {
    return <PropsBoundaryTopic />;
}
