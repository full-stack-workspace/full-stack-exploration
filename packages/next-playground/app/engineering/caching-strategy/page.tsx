/**
 * 薄壳:缓存策略设计专题(engineering 分类)。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import CachingStrategyTopic from "@/topics/engineering/caching-strategy";

export const metadata = getTopicMetadata("/engineering/caching-strategy");

export default function Page() {
    return <CachingStrategyTopic />;
}
