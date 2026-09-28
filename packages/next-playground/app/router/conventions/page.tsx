/**
 * 薄壳:约定文件对照专题。
 * 本目录下的 loading.tsx 是本专题的活素材:首次导航到本页时
 * 由它渲染 Suspense 兜底骨架。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ConventionsTopic from "@/topics/router/conventions";

export const metadata = getTopicMetadata("/router/conventions");

export default function Page() {
    return <ConventionsTopic />;
}
