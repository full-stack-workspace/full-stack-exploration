/**
 * ============================================================================
 * 安全响应头 — next.config.ts 与专题页的单一数据源
 * ============================================================================
 *
 * next.config.ts 的 headers() 把 SECURITY_HEADERS 只挂到 /security/:path*,
 * /security/headers 专题页再把同一份清单渲染成讲解表格 ——
 * 配置与教学文案不会各自漂移。
 *
 * CSP 只作用于 /security/* 是刻意的:
 * 全站 CSP 需要 proxy.ts(middleware)逐请求生成 nonce 配合,
 * 否则根 layout 的内联防闪烁脚本与 App Router 的内联 RSC 载荷脚本
 * (self.__next_f)都会被拦掉。静态 headers() 拿不到 per-request nonce,
 * 这正是专题页要讲的核心知识点。
 *
 * @module lib/security-headers
 */

/** Next headers() 配置要求的头形状 */
export interface SecurityHeader {
    key: string;
    value: string;
}

/**
 * 构造演示级 CSP。
 *
 * 两处刻意的放宽(专题页逐条讲解):
 * - script-src 带 'unsafe-inline':App Router 的水合与 RSC 载荷依赖内联
 *   <script>(self.__next_f.push),根 layout 还有防闪烁内联脚本;
 *   静态配置无法给它们逐一发 nonce,生产上应改走 proxy.ts 逐请求注入
 * - dev 追加 'unsafe-eval' 与 ws::Turbopack HMR 依赖 eval 与 WebSocket,
 *   CSP 必须按环境区分,否则开发服务器直接瘫痪
 *
 * @returns 拼接好的 Content-Security-Policy 头值
 */
export function buildDemoCsp(): string {
    const isDev = process.env.NODE_ENV !== "production";
    return [
        "default-src 'self'",
        // 静态 CSP 给不了 nonce,'unsafe-inline' 是本站演示的妥协项
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
        // React 内联 style 属性与 Next 注入的 <style> 需要
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://images.unsplash.com",
        "font-src 'self'",
        // dev 下 HMR 走 WebSocket,connect-src 不含 ws: 会被整条拦掉
        `connect-src 'self'${isDev ? " ws:" : ""}`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ].join("; ");
}

/**
 * 挂到 /security/:path* 的安全响应头清单。
 * 改动这里会同时影响 curl 可见的响应头与专题页的讲解表格。
 */
export const SECURITY_HEADERS: SecurityHeader[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: buildDemoCsp() },
];
