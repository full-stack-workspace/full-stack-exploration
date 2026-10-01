/**
 * 薄壳:手写 SSE vs Vercel AI SDK 专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import AiSdkTopic from "@/topics/ai-native/ai-sdk";

export const metadata = getTopicMetadata("/ai-native/ai-sdk");

export default function Page() {
    return <AiSdkTopic />;
}
