/**
 * 薄壳:四层缓存对照台专题路由。
 * 页面本身保持默认静态渲染 —— 这正是 Full Route Cache 的展示素材。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import CacheLayersTopic from "@/topics/data/cache-layers";

export const metadata = getTopicMetadata("/data/cache-layers");

export default function Page() {
    return <CacheLayersTopic />;
}
