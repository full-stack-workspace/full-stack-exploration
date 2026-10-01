/**
 * ============================================================================
 * Basic API Route (基础 API 接口示例)
 * ============================================================================
 *
 * 展示 Next.js App Router 中 API 路由的基本用法。
 *
 * 接口信息：
 * - 支持 GET, POST, PUT, DELETE 四种 HTTP 方法
 * - 用于演示 API 路由的标准模式
 *
 * 注意：
 * - 实际生产环境中应实现具体的业务逻辑
 * - 应添加适当的错误处理和验证
 *
 * @module api/basic/route
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/basic
 *
 * 处理 GET 请求
 *
 * @returns {NextResponse} JSON 格式的响应
 */
export async function GET() {
    return NextResponse.json({ message: 'GET request' });
}

/**
 * POST /api/basic
 *
 * 处理 POST 请求
 *
 * @returns {NextResponse} JSON 格式的响应
 */
export async function POST() {
    return NextResponse.json({ message: 'POST request' });
}

/**
 * PUT /api/basic
 *
 * 处理 PUT 请求（通常用于更新资源）
 *
 * @returns {NextResponse} JSON 格式的响应
 */
export async function PUT() {
    return NextResponse.json({ message: 'PUT request' });
}

/**
 * DELETE /api/basic
 *
 * 处理 DELETE 请求（通常用于删除资源）
 *
 * @returns {NextResponse} JSON 格式的响应
 */
export async function DELETE() {
    return NextResponse.json({ message: 'DELETE request' });
}
