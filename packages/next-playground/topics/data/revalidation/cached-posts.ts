/**
 * ============================================================================
 * 按需失效专题的带标签缓存取数(cacheComponents 模型)
 * ============================================================================
 *
 * 与 /rendering/isr 的 cached-posts.ts 结构同源,但缓存策略刻意不同:
 * - ISR 专题用 cacheLife({ revalidate: 60 }):时间驱动的窗口,到期后台重建
 * - 本专题用 cacheLife("max") + cacheTag:几乎不设时间窗口,产物「冻结」
 *   在缓存里,只有 revalidateTag / updateTag 能把它唤醒 —— 这正是
 *   按需失效的观察对象:时间戳长期不变是特性,不是 bug
 *
 * 标签独立命名为 "revalidation-posts" 而不是复用 "posts":
 * cacheTag 是全局命名空间,与 /rendering/isr 共用标签会让本页的失效按钮
 * 把 ISR 页的缓存也一起打掉 —— 标签即失效的波及范围,设计时要想清楚。
 *
 * 数据源 data/blog.ts 的 getPostsWithStatus 本身不带 "use cache"
 * (它还要服务 /api/blog 的每请求现取),缓存声明留在调用方。
 *
 * @module topics/data/revalidation/cached-posts
 */

import { cacheLife, cacheTag } from "next/cache";

import { getPostsWithStatus, type Post, type PostsSource } from "@/data/blog";

/**
 * 本专题的失效标签。
 * 全局命名空间:任何 revalidateTag/updateTag("revalidation-posts")
 * 都会命中这份产物,无论调用发生在哪个 action 里。
 */
export const REVALIDATION_TAG = "revalidation-posts";

/** 按需失效演示消费的一份缓存产物 */
export interface TaggedPostsData {
    posts: Post[];
    /** 取数来源:live = 外部 API;fallback = 本地兜底 */
    source: PostsSource;
    /** 本份缓存产物的生成时刻;只有失效后重建才会变化 —— 演示的观察点 */
    generatedAt: string;
}

/**
 * 只按标签失效的缓存取数。
 *
 * cacheLife("max") 让时间窗口长到天级别(revalidate 30 天),把「时间」
 * 这个变量从演示里剔除:页面上 generatedAt 的任何变化,
 * 都可以归因于某个显式的失效调用。
 */
export async function getTaggedPosts(): Promise<TaggedPostsData> {
    "use cache";
    cacheLife("max");
    cacheTag(REVALIDATION_TAG);
    const { posts, source } = await getPostsWithStatus();
    return { posts: posts.slice(0, 3), source, generatedAt: new Date().toISOString() };
}
