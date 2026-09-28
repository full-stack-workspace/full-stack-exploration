/**
 * ============================================================================
 * Middleware — 站点中间件(engineering 专题的活演示)
 * ============================================================================
 *
 * 无害演示:对 /engineering/middleware 路径的请求,
 * 在响应头上追加自定义头 x-playground-middleware: demo,
 * 让「中间件专题」页面本身成为可 curl 验证的实验对象。
 *
 * 验证方式(生产构建后):
 *   curl -I http://localhost:3000/engineering/middleware   # 带自定义头
 *   curl -I http://localhost:3000/                         # 不带
 *
 * 设计约束:
 * - matcher 收敛到单一路径,避免每个请求都过中间件
 * - 只做改头这件小事;不读 body、不查库(运行时受限,见专题页)
 *
 * @module middleware
 */

import { NextResponse } from "next/server";

/** 自定义响应头名,专题页文档与 curl 验证共用这个字面量 */
export const DEMO_HEADER = "x-playground-middleware";

export function middleware() {
    // NextResponse.next() = 不改写、不重定向,放行原请求,
    // 但返回的响应对象允许改写头部 —— 这是「只加头」的标准姿势
    const response = NextResponse.next();
    response.headers.set(DEMO_HEADER, "demo");
    return response;
}

/**
 * matcher:只有命中的路径才会执行 middleware。
 * 收敛到专题页本身,其余路由零开销。
 */
export const config = {
    matcher: ["/engineering/middleware"],
};
