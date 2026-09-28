/**
 * 薄壳:平行路由专题。本页是 children 槽里的列表。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ParallelTopic from "@/topics/router/parallel";

export const metadata = getTopicMetadata("/router/parallel");

export default function Page() {
    return <ParallelTopic />;
}
