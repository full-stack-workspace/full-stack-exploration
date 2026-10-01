/**
 * 薄壳:中间件边界与代价专题(engineering 分类)。
 * 本页同时是 middleware.ts 的实验对象:响应应带 x-playground-middleware 头。
 * 专题页用 headers() 读请求头(请求时数据):connection() 声明本页每请求渲染,
 * Suspense 边界是 cacheComponents 下请求时数据的合法容器 ——
 * 保留「读 headers() 即动态渲染」的教学声称。
 */

import { connection } from "next/server";
import { Suspense } from "react";

import { getTopicMetadata } from "@/lib/topic-meta";
import MiddlewareTopic from "@/topics/engineering/middleware";

export const metadata = getTopicMetadata("/engineering/middleware");

/**
 * 动态主体:connection() 声明依赖请求上下文,
 * headers() 在请求时才能读到真实请求头。
 */
async function MiddlewareDynamicBody() {
    await connection();
    return <MiddlewareTopic />;
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <MiddlewareDynamicBody />
        </Suspense>
    );
}
