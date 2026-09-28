/**
 * 薄壳:导航与 Router Cache 专题。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import NavigationTopic from "@/topics/router/navigation";

export const metadata = getTopicMetadata("/router/navigation");

export default function Page() {
    return <NavigationTopic />;
}
