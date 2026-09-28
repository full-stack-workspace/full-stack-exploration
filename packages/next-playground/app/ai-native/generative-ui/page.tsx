/**
 * 薄壳:Generative UI 专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import GenerativeUiTopic from "@/topics/ai-native/generative-ui";

export const metadata = getTopicMetadata("/ai-native/generative-ui");

export default function Page() {
    return <GenerativeUiTopic />;
}
