/**
 * 薄壳:渲染光谱专题路由。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import SpectrumTopic from "@/topics/rendering/spectrum";

export const metadata = getTopicMetadata("/rendering/spectrum");

export default function Page() {
    return <SpectrumTopic />;
}
