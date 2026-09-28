/**
 * 薄壳:Image/Font 与包体治理专题(engineering 分类)。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import AssetPerfTopic from "@/topics/engineering/asset-perf";

export const metadata = getTopicMetadata("/engineering/asset-perf");

export default function Page() {
    return <AssetPerfTopic />;
}
