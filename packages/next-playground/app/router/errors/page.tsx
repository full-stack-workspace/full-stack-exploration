/**
 * 薄壳:错误与未找到专题。
 * 同目录的 error.tsx / not-found.tsx 是本页的活素材。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ErrorsTopic from "@/topics/router/errors";

export const metadata = getTopicMetadata("/router/errors");

export default function Page() {
    return <ErrorsTopic />;
}
