/**
 * 薄壳:SSR 专题。dynamic 是页面级约定,必须留在路由文件里。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import SsrTopic from "@/topics/rendering/ssr";

/** 每次请求都现渲染,不进 Full Route Cache */
export const dynamic = "force-dynamic";

export const metadata = getTopicMetadata("/rendering/ssr");

export default function Page() {
    return (
        <SsrTopic
            renderedAt={new Date().toISOString()}
            requestId={crypto.randomUUID()}
        />
    );
}
