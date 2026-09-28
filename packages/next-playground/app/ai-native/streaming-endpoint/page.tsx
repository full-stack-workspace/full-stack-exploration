/**
 * 薄壳:AI 流式响应专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import StreamingEndpointTopic from "@/topics/ai-native/streaming-endpoint";

export const metadata = getTopicMetadata("/ai-native/streaming-endpoint");

export default function Page() {
    return <StreamingEndpointTopic />;
}
