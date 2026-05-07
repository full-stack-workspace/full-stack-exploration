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
 * @module data/blog
 */

import { cache } from "react";

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

/**
 * 获取博客文章列表（记忆化）
 *
 * React cache() 确保同一渲染周期内多次调用只请求一次数据。
 * 与 ISR 配合：页面级 revalidate 控制缓存刷新频率。
 */
export const getPosts = cache(async (): Promise<Post[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
});
