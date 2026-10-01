/**
 * 薄壳:安全响应头与 CSP 专题(security 分类)。
 * 页面本体是静态的:响应头由配置层附加,活证据在客户端 fetch,
 * 无请求时数据,不需要 connection() 与 Suspense 洞。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import SecurityHeadersTopic from "@/topics/security/headers";

export const metadata = getTopicMetadata("/security/headers");

export default function Page() {
    return <SecurityHeadersTopic />;
}
