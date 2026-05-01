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
 * - 使用 JSONPlaceholder API 作为模拟数据源
 * - 返回文章的基本信息（id, title, body, userId）
 *
 * @module api/blog/route
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/blog
 *
 * 获取博客文章列表
 *
 * @returns {Promise<NextResponse>} JSON 格式的文章列表
 *
 * @example
 * // 请求
 * GET /api/blog
 *
 * // 响应
 * [
 *   {
 *     "userId": 1,
 *     "id": 1,
 *     "title": "sunt aut facere repellat provident",
 *     "body": "quia et suscipit..."
 *   },
 *   ...
 * ]
 */
export async function GET(request: Request) {
    // 从外部 API 获取文章数据
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");

    // 解析响应为 JSON
    const data = await res.json();

    // 返回 JSON 响应
    return NextResponse.json(data);
}
