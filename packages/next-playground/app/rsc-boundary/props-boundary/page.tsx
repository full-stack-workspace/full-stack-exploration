/**
 * 薄壳:Server/Client 边界专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import PropsBoundaryTopic from "@/topics/rsc-boundary/props-boundary";

export const metadata = getTopicMetadata("/rsc-boundary/props-boundary");

export default function Page() {
    return <PropsBoundaryTopic />;
}
