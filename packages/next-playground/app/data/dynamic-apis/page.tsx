/**
 * 薄壳:动态 API 各一格专题路由。
 * 页面壳可预渲染;cookies()/headers()/connection() 三个请求时面板
 * 在专题组件内部各自包在 Suspense 洞里(裸放顶层会报 blocking-route),
 * 薄壳不需要任何额外声明。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import DynamicApisTopic from "@/topics/data/dynamic-apis";

export const metadata = getTopicMetadata("/data/dynamic-apis");

export default function Page() {
    return <DynamicApisTopic />;
}
