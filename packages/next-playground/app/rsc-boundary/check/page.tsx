/**
 * 薄壳:Server/Client 边界 · 理解检验路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RscBoundaryCheckTopic from "@/topics/rsc-boundary/check";

export const metadata = getTopicMetadata("/rsc-boundary/check");

export default function Page() {
    return <RscBoundaryCheckTopic />;
}
