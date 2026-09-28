/**
 * 薄壳:Route Handler 专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RouteHandlersTopic from "@/topics/data/route-handlers";

export const metadata = getTopicMetadata("/data/route-handlers");

export default function Page() {
    return <RouteHandlersTopic />;
}
