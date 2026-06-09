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

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/basic
 *
 * 处理 GET 请求
 *
 * @param req - Next.js 封装的请求对象
 * @returns {NextResponse} JSON 格式的响应
 */
export async function GET(req: NextRequest) {
    console.log('req', req);
    return NextResponse.json({ message: 'GET request' });
}

/**
 * POST /api/basic
 *
 * 处理 POST 请求
 *
 * @param req - Next.js 封装的请求对象
 * @returns {NextResponse} JSON 格式的响应
 */
export async function POST(req: NextRequest) {
    console.log('req', req);
    return NextResponse.json({ message: 'POST request' });
}

/**
 * PUT /api/basic
 *
 * 处理 PUT 请求（通常用于更新资源）
 *
 * @param req - Next.js 封装的请求对象
 * @returns {NextResponse} JSON 格式的响应
 */
export async function PUT(req: NextRequest) {
    console.log('req', req);
    return NextResponse.json({ message: 'PUT request' });
}

/**
 * DELETE /api/basic
 *
 * 处理 DELETE 请求（通常用于删除资源）
 *
 * @param req - Next.js 封装的请求对象
 * @returns {NextResponse} JSON 格式的响应
 */
export async function DELETE(req: NextRequest) {
    console.log('req', req);
    return NextResponse.json({ message: 'DELETE request' });
}
