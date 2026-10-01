/**
 * 薄壳:按需失效实战专题路由。
 * 缓存窗口由 topics/data/revalidation/cached-posts.ts 的
 * getTaggedPosts()("use cache" + cacheTag)声明,页面本体可预渲染;
 * 失效动作走 Server Action,与路由壳无关。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import RevalidationTopic from "@/topics/data/revalidation";

export const metadata = getTopicMetadata("/data/revalidation");

export default function Page() {
    return <RevalidationTopic />;
}
