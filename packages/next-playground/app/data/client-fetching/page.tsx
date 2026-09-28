/**
 * 薄壳:客户端取数与 SWR 专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ClientFetchingTopic from "@/topics/data/client-fetching";

export const metadata = getTopicMetadata("/data/client-fetching");

export default function Page() {
    return <ClientFetchingTopic />;
}
