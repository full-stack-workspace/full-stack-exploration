/**
 * ============================================================================
 * ISR 专题的显式缓存取数(cacheComponents 模型)
 * ============================================================================
 *
 * 旧模型(Next 15 及以前):页面壳上写 `export const revalidate = 60`,
 * 整页进 Full Route Cache,过期后由下一个请求触发后台重建。
 *
 * 本站现行(全站 cacheComponents):route segment config 不再存在,
 * 缓存改用 "use cache" 指令显式声明在取数函数上:
 * - cacheLife({ revalidate: 60 }):60s 内命中缓存;过期后下一个请求
 *   先返回旧值(stale),同时后台重建 —— 与旧 ISR 的 SWR 语义一致
 * - cacheTag("posts"):留出 revalidateTag("posts") 按需失效的口子
 *
 * 为什么不写进 data/blog.ts:getPosts 同时被 /api/blog 使用,
 * 那里必须保持「每请求现取」;缓存声明属于调用方,不属于数据源。
 *
 * @module topics/rendering/isr/cached-posts
 */

import { cacheLife, cacheTag } from "next/cache";

import { getPostsWithStatus, type Post, type PostsSource } from "@/data/blog";

/** ISR 页消费的一份缓存产物 */
export interface IsrPostsData {
    posts: Post[];
    /** 取数来源:live = 外部 API;fallback = 本地兜底 */
    source: PostsSource;
    /** 本份缓存产物的生成时刻;随缓存一起 stale→重建,正是 ISR 的观察点 */
    generatedAt: string;
}

/**
 * 60s 窗口的可缓存取数(替代旧 `export const revalidate = 60`)。
 *
 * generateMetadata 与页面组件都调它:不止单次渲染内去重(React cache()),
 * 跨请求也命中同一份缓存条目 —— 旧模型里「generateMetadata 与页面共享
 * 一次渲染」的结构,在新模型下升级为「共享一份 60s 缓存」。
 */
export async function getIsrPosts(): Promise<IsrPostsData> {
    "use cache";
    cacheLife({ revalidate: 60 });
    cacheTag("posts");
    const { posts, source } = await getPostsWithStatus();
    return { posts, source, generatedAt: new Date().toISOString() };
}
