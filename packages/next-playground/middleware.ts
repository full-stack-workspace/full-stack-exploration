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

import { type NextRequest, NextResponse } from "next/server";

import { DEMO_HEADER } from "@/lib/demo-header";

export function middleware(request: NextRequest) {
    // 响应头给 curl -I 看;请求头给页面里的 headers() 看。
    // 它们不是同一个对象,只改响应的话,Server Component 读不到。
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(DEMO_HEADER, "demo");
    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
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
