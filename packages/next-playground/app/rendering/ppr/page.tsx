/**
 * 薄壳:PPR 专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import PprTopic from "@/topics/rendering/ppr";

export const metadata = getTopicMetadata("/rendering/ppr");

export default function Page() {
    return <PprTopic />;
}
