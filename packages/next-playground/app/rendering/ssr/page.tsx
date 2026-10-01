/**
 * 薄壳:SSR 专题。
 * cacheComponents 下 route segment config(force-dynamic)已移除;
 * 整页动态 = connection() 声明「等到请求到达再渲染」+ Suspense 边界
 * (新模型下请求时数据不许裸放在边界外,否则构建报 blocking-route)。
 * 渲染时刻与请求号因此每个请求现算。
 */

import { connection } from "next/server";
import { Suspense } from "react";

import { getTopicMetadata } from "@/lib/topic-meta";
import SsrTopic from "@/topics/rendering/ssr";

export const metadata = getTopicMetadata("/rendering/ssr");

/**
 * 动态主体:connection() 声明依赖请求上下文,
 * 退出构建期预渲染,每次请求现渲染。
 */
async function SsrDynamicBody() {
    await connection();
    return (
        <SsrTopic
            renderedAt={new Date().toISOString()}
            requestId={crypto.randomUUID()}
        />
    );
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <SsrDynamicBody />
        </Suspense>
    );
}
