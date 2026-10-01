/**
 * ============================================================================
 * Blog API Route (博客文章接口)
 * ============================================================================
 *
 * 提供博客文章列表的 API 接口。
 *
 * 接口信息：
 * - Method: GET
 * - Path: /api/blog
 * - Description: 获取所有博客文章列表
 *
 * 数据来源：
 * - 复用 @/data/blog 的 getPostsWithStatus()(jsonplaceholder + 本地兜底),
 *   不再重复一段 fetch 逻辑;响应带 source 字段标记本次是活数据还是兜底
 *
 * @module api/blog/route
 */

import { NextResponse } from 'next/server';

import { getPostsWithStatus } from "@/data/blog";

/**
 * GET /api/blog
 *
 * 获取博客文章列表
 *
 * @returns {Promise<NextResponse>} JSON: { posts: Post[], source: "live" | "fallback" }
 *
 * @example
 * // 请求
 * GET /api/blog
 *
 * // 响应
 * {
 *   "posts": [
 *     { "userId": 1, "id": 1, "title": "sunt aut facere...", "body": "quia et suscipit..." },
 *     ...
 *   ],
 *   "source": "live"
 * }
 */
export async function GET() {
    // getPostsWithStatus 内部:外部 API 故障/限流时回退本地种子数据,
    // source 让调用方能区分「活数据」与「兜底数据」
    const { posts, source } = await getPostsWithStatus();

    return NextResponse.json({ posts, source });
}
