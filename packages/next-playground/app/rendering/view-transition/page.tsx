/**
 * 薄壳:页面转场专题。
 * 活演示在同目录 scenes/ 下:scenes/layout.tsx 用 <ViewTransition>
 * 包住两个可互跳的场景页,enter/exit 按 transitionTypes 取方向。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ViewTransitionTopic from "@/topics/rendering/view-transition";

export const metadata = getTopicMetadata("/rendering/view-transition");

export default function Page() {
    return <ViewTransitionTopic />;
}
