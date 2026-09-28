/**
 * 薄壳:metadata 流水线专题(metadata 分类入口页)。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import MetadataGuideTopic from "@/topics/metadata/guide";

export const metadata = getTopicMetadata("/metadata/guide");

export default function Page() {
    return <MetadataGuideTopic />;
}
