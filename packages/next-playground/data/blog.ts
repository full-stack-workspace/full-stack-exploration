/**
 * ============================================================================
 * 博客数据获取层
 * ============================================================================
 *
 * 使用 React cache() 实现记忆化数据请求。
 *
 * 核心概念 — 记忆化 (Memoization)：
 * - React 的 cache() 会在单次渲染过程中缓存函数结果
 * - 当 generateMetadata 和 Page 组件都调用 getPosts() 时
 * - 实际只会发起一次 HTTP 请求（请求去重）
 * - 避免相同数据被重复获取，提升性能
 *
 * 容错策略：
 * - jsonplaceholder 是全站唯一的构建期外部依赖,故障/限流会让 next build 直接挂
 * - fetch 失败时回退到模块级本地种子数据,保证构建与 ISR 再生永远有内容
 * - 需要区分「活数据/兜底数据」的调用方用 getPostsWithStatus()
 *
 * @module data/blog
 */

import { cache } from "react";

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/** 取数来源:live = 外部 API 实时数据;fallback = 本地种子兜底 */
export type PostsSource = "live" | "fallback";

export interface PostsResult {
  posts: Post[];
  source: PostsSource;
}

/* =================================================================
 * 本地兜底数据(仅在外部 API 不可用时使用)
 * ================================================================ */

/** 外部 API 故障时的兜底文章,保证构建期与 ISR 再生不中断 */
const FALLBACK_POSTS: Post[] = [
  {
    userId: 1,
    id: 1,
    title: "本地兜底:为什么要有 fallback",
    body: "外部 API 故障或限流时,构建与 ISR 再生不该因此中断。这份种子数据保证页面永远有内容可渲染。",
  },
  {
    userId: 1,
    id: 2,
    title: "本地兜底:ISR 的再生不依赖单次请求成功",
    body: "revalidate 到期后的后台重建如果打到故障的源站,没有兜底就会直接抛错;有了它,最多是内容暂时不新鲜。",
  },
  {
    userId: 1,
    id: 3,
    title: "本地兜底:cache() 只去重,不负责容错",
    body: "React cache() 解决的是单次渲染内的重复请求,网络层是否成功是另一回事,两件事都要处理。",
  },
];

/* =================================================================
 * 数据获取(cache() 记忆化)
 * ================================================================ */

/**
 * 获取博客文章列表及来源标记(记忆化)
 *
 * 同一渲染周期内多次调用只请求一次;失败时返回本地兜底数据,
 * source 为 "fallback",调用方可据此渲染提示条。
 */
export const getPostsWithStatus = cache(async (): Promise<PostsResult> => {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!res.ok) {
      throw new Error(`jsonplaceholder responded ${res.status}`);
    }
    const posts = (await res.json()) as Post[];
    return { posts, source: "live" };
  } catch {
    // 外部 API 故障/限流:回退本地种子数据,不让构建期与再生期因此失败
    return { posts: FALLBACK_POSTS, source: "fallback" };
  }
});

/**
 * 获取博客文章列表(记忆化)
 *
 * React cache() 确保同一渲染周期内多次调用只请求一次数据。
 * 与 ISR 配合：页面级 revalidate 控制缓存刷新频率。
 * 与 getPostsWithStatus 共享同一次底层请求。
 */
export const getPosts = cache(async (): Promise<Post[]> => {
  const { posts } = await getPostsWithStatus();
  return posts;
});
