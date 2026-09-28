/**
 * 薄壳:RSC 心智模型专题路由。
 * 纯梳理页,无渲染约定;内容在 topics/rsc-boundary/guide。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RscGuideTopic from "@/topics/rsc-boundary/guide";

export const metadata = getTopicMetadata("/rsc-boundary/guide");

export default function Page() {
    return <RscGuideTopic />;
}
