/**
 * 薄壳:渲染策略 · 理解检验路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RenderingCheckTopic from "@/topics/rendering/check";

export const metadata = getTopicMetadata("/rendering/check");

export default function Page() {
    return <RenderingCheckTopic />;
}
