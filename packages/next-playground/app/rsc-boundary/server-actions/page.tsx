/**
 * 薄壳:Server Actions 专题路由。
 * 留言列表来自模块级内存数组,必须每次请求现读;
 * cacheComponents 下用 connection() 声明「等到请求到达再渲染」,
 * 替代旧 force-dynamic —— 否则列表会被构建期预渲染拍平成静态 HTML。
 * Suspense 边界是新模型下请求时数据的合法容器。
 */

import { connection } from "next/server";
import { Suspense } from "react";

import { getTopicMetadata } from "@/lib/topic-meta";
import ServerActionsTopic from "@/topics/rsc-boundary/server-actions";

export const metadata = getTopicMetadata("/rsc-boundary/server-actions");

/**
 * 动态主体:connection() 声明依赖请求上下文,
 * 退出构建期预渲染,保证读到最新内存留言。
 */
async function ServerActionsDynamicBody() {
    await connection();
    return <ServerActionsTopic />;
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ServerActionsDynamicBody />
        </Suspense>
    );
}
