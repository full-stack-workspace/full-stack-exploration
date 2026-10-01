/**
 * 薄壳:数据与缓存 · 理解检验路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import DataCheckTopic from "@/topics/data/check";

export const metadata = getTopicMetadata("/data/check");

export default function Page() {
    return <DataCheckTopic />;
}
