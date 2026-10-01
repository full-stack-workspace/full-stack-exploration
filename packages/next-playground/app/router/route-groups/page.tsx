/**
 * 薄壳:路由组与多根布局专题。
 * 同目录的 (demo)/ 组是本专题的活素材:组名不进 URL,组级 layout 只包组内页面。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RouteGroupsTopic from "@/topics/router/route-groups";

export const metadata = getTopicMetadata("/router/route-groups");

export default function Page() {
    return <RouteGroupsTopic />;
}
