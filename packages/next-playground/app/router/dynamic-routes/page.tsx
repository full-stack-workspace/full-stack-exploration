/**
 * 薄壳:动态路由专题首页。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import DynamicRoutesTopic from "@/topics/router/dynamic-routes";

export const metadata = getTopicMetadata("/router/dynamic-routes");

export default function Page() {
    return <DynamicRoutesTopic />;
}
