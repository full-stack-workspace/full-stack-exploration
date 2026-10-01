/**
 * ============================================================================
 * 安全响应头与 CSP — security 分类专题
 * ============================================================================
 *
 * next.config.ts 的 headers() 把一组安全头只挂到 /security/:path*,
 * 本页用客户端 HEAD 请求把自己的响应头读出来当活证据,
 * 并讲清「为什么全站 CSP 必须走 proxy.ts 的 per-request nonce」。
 *
 * 本页是静态的:响应头由 Next 在配置层附加,与渲染动静无关;
 * 活证据在客户端 fetch,不占渲染管线。
 *
 * @module topics/security/headers
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import { SECURITY_HEADERS } from "@/lib/security-headers";

import { LiveHeaders } from "./LiveHeaders";

/* =================================================================
 * 讲解数据与代码块
 * ================================================================ */

/** 每个头防什么(一行一个);值从单一数据源 SECURITY_HEADERS 取,不另抄一份 */
const HEADER_PURPOSES: Record<string, string> = {
    "X-Content-Type-Options":
        "禁止浏览器 MIME 嗅探:把「伪装成图片的脚本」当脚本执行的通道被关掉",
    "X-Frame-Options":
        "DENY 禁止本页被任何 <iframe> 嵌入,防点击劫持;现代等价物是 CSP 的 frame-ancestors(本页两者都发)",
    "Referrer-Policy":
        "strict-origin-when-cross-origin:跨源跳转时 Referer 只带源不带路径,URL 里的 token/ID 不泄漏给第三方",
    "Permissions-Policy":
        "按源关掉用不到的浏览器能力(摄像头/麦克风/定位),缩小 XSS 得手后的可利用面",
    "Content-Security-Policy":
        "资源加载白名单:脚本/样式/图片/连接各自圈定来源,注入的站外脚本直接不加载",
};

/** curl 验证命令 */
const CURL_CODE = `# 安全头只出现在 /security/* 路径:
curl -I http://localhost:3000/security/headers
# HTTP/1.1 200 OK
# content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
# x-content-type-options: nosniff
# x-frame-options: DENY
# referrer-policy: strict-origin-when-cross-origin
# permissions-policy: camera=(), microphone=(), geolocation=()

# 对照组:其他路径没有这组头(刻意收敛,原因见「为什么不是全站 CSP」)
curl -I http://localhost:3000/
# HTTP/1.1 200 OK
# (没有上面五个头)`;

/** next.config.ts 的 headers() 配置(与本站真实配置一致) */
const CONFIG_CODE = `// next.config.ts
import { SECURITY_HEADERS } from "./lib/security-headers";

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                // 只挂 /security/*:全站 CSP 需要 nonce,静态配置给不了
                source: "/security/:path*",
                headers: SECURITY_HEADERS,
            },
        ];
    },
};`;

/** proxy.ts 逐请求 nonce 的标准做法(Next 16 官方推荐路径) */
const NONCE_CODE = `// proxy.ts —— Next 16 的中间件新约定,固定 Node 运行时
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    // 每个请求一枚随机数,写进 CSP 头,也经请求头传给渲染层
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = \`default-src 'self'; script-src 'self' 'nonce-\${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'self'\`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);          // 给 layout 里的 <Script nonce> 用
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp); // 给浏览器
    return response;
}

// layout.tsx 里:const nonce = (await headers()).get("x-nonce");
// <Script src="..." nonce={nonce} /> —— 带 nonce 的内联/外链脚本才被放行`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function SecurityHeadersTopic() {
    return (
        <TopicPage
            path="/security/headers"
            title="安全响应头与 CSP"
            description="next.config.ts 的 headers() 把五个安全头只挂到 /security/*:本页客户端 HEAD 请求读出自己的响应头当活证据;CSP 的演示级 'unsafe-inline' 正是「全站要 nonce」的反面教材"
            references={[
                { label: "Next.js 文档:headers(next.config.ts)", href: "https://nextjs.org/docs/app/api-reference/config/next-config-js/headers" },
                { label: "Next.js 文档:Content-Security-Policy(nonce + proxy.ts 完整指南)", href: "https://nextjs.org/docs/app/guides/content-security-policy" },
                { label: "MDN:CSP 指令参考", href: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Security-Policy" },
            ]}
        >
            <TopicSection
                title="活证据:本页自己的响应头"
                note="客户端对本页发 HEAD 请求读回来的真实值;Server Component 的 headers() 读的是请求头,看不到响应头"
            >
                <LiveHeaders />
            </TopicSection>

            <TopicSection
                title="curl 验证指引"
                note="dev 与生产构建都生效;响应头由配置层附加,与页面是静态还是动态无关"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CURL_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="每个头防什么"
                note="值直接渲染自 lib/security-headers.ts 的单一数据源,改配置即改本表"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">响应头</th>
                                <th className="py-2 pr-4 font-semibold">本站值</th>
                                <th className="py-2 font-semibold">防什么</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            {SECURITY_HEADERS.map((h) => (
                                <tr
                                    key={h.key}
                                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                                >
                                    <td className="py-2 pr-4 font-mono font-medium whitespace-nowrap text-neutral-800 dark:text-neutral-100">
                                        {h.key}
                                    </td>
                                    <td className="max-w-72 py-2 pr-4 font-mono break-all">
                                        {h.value}
                                    </td>
                                    <td className="py-2">{HEADER_PURPOSES[h.key]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CONFIG_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="为什么不是全站 CSP:nonce vs hash vs 'unsafe-inline'"
                note="本页 CSP 里 script-src 带 'unsafe-inline' 是刻意的反面教材"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>{"'unsafe-inline'"}(本站演示)</strong>:任何内联
                        {" <script> "}都能跑 —— XSS 注入的脚本也能跑,
                        script-src 防线形同虚设。它能进演示,是因为 App Router 的
                        RSC 载荷(self.__next_f.push)和根 layout 的防闪烁脚本都是内联的,
                        静态 headers() 配置无法给它们逐枚授权
                    </li>
                    <li>
                        <strong>hash(sha256-...)</strong>:按内容哈希放行固定脚本,
                        适合「内容永远不变」的内联块;但 RSC 载荷每页每请求都不同,
                        哈希列不完 —— 对 App Router 不可行
                    </li>
                    <li>
                        <strong>nonce(正解)</strong>:每请求生成一枚随机数,
                        同时写进 CSP 头和每个受信 {"<script>"} 标签;
                        攻击者猜不到本次请求的 nonce,注入脚本全部不执行。
                        配合 {"'strict-dynamic'"},受信脚本动态加载的依赖脚本也被信任
                    </li>
                    <li>
                        <strong>为什么推荐 proxy.ts 做这件事</strong>:nonce 必须逐请求生成,
                        next.config.ts 的 headers() 是启动时算死的静态配置,给不了;
                        proxy.ts(原 middleware,Next 16 起固定 Node 运行时)在请求管线上,
                        是唯一能在「响应头发出去之前」注入逐请求值的位置
                    </li>
                    <li>
                        <strong>代价要知道</strong>:走 proxy.ts 注入 nonce 的页面必须动态渲染
                        (nonce 是请求级数据),与静态预渲染/Full Route Cache 互斥 ——
                        这也是本站只给 /security/* 挂演示 CSP 的另一层原因
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{NONCE_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="落地顺序建议"
                note="演示站只覆盖前两步;生产项目走到第三步"
            >
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>低风险头全站挂</strong>:X-Content-Type-Options、
                        Referrer-Policy、Permissions-Policy 没有副作用,直接在
                        headers() 里全站下发(本站为教学对照刻意只挂 /security/*)
                    </li>
                    <li>
                        <strong>frame-ancestors / X-Frame-Options 全站挂</strong>:
                        除非产品明确要被第三方 iframe 嵌入
                    </li>
                    <li>
                        <strong>CSP 先 Report-Only 再强制</strong>:先挂
                        Content-Security-Policy-Report-Only 收集违例报告,
                        确认白名单无遗漏后,用 proxy.ts + nonce 切到强制模式
                    </li>
                </ol>
            </TopicSection>
        </TopicPage>
    );
}
