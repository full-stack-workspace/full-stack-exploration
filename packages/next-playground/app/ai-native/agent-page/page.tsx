/**
 * 薄壳:Agent 长任务页专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import AgentPageTopic from "@/topics/ai-native/agent-page";

export const metadata = getTopicMetadata("/ai-native/agent-page");

export default function Page() {
    return <AgentPageTopic />;
}
