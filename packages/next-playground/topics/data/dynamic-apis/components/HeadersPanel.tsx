/**
 * ============================================================================
 * HeadersPanel — headers() 读取本次请求头(Server)
 * ============================================================================
 *
 * headers() 读的是本次请求的请求头(这里取 user-agent):
 * 内容按请求不同而不同,cacheComponents 下必须待在 Suspense 洞内,
 * 所在路由的这一格退出静态预渲染。换浏览器/改 UA 重访,值随之变化。
 *
 * @module topics/data/dynamic-apis/components/HeadersPanel
 */

import { headers } from "next/headers";

export async function HeadersPanel() {
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") ?? "(无 user-agent)";

    return (
        <div className="border border-rule px-4 py-3 dark:border-neutral-800">
            <p className="font-mono text-[11px] text-neutral-500">
                headers().get(&quot;user-agent&quot;)
            </p>
            <p className="mt-1 font-mono text-xs break-all text-ink dark:text-neutral-100">
                {userAgent}
            </p>
        </div>
    );
}
