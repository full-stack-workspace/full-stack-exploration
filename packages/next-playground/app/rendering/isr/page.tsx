/**
 * 薄壳:ISR 专题路由。
 * cacheComponents 下不再有 export const revalidate;60s 窗口由
 * topics/rendering/isr/cached-posts.ts 里的 "use cache" + cacheLife 声明。
 */

import type { Metadata } from "next";

import { getTopicMetadata } from "@/lib/topic-meta";
import IsrTopic from "@/topics/rendering/isr";
import { getIsrPosts } from "@/topics/rendering/isr/cached-posts";

/**
 * 动态 metadata:与页面组件共享同一份 "use cache" 缓存条目,
 * 跨请求命中同一份 60s 缓存 —— 这正是 topics/rendering/isr 与
 * topics/data/cache-layers 声称的演示,这里让它真实发生。
 */
export async function generateMetadata(): Promise<Metadata> {
    const base = getTopicMetadata("/rendering/isr");
    const { posts } = await getIsrPosts();
    return {
        ...base,
        description: `"use cache" + cacheLife({ revalidate: 60 }) 的增量静态再生,当前数据源共 ${posts.length} 篇文章;generateMetadata 与页面共享同一份缓存条目`,
    };
}

export default function Page() {
    return <IsrTopic />;
}
