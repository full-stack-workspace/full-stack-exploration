/**
 * 薄壳:信任边界专题(security 分类)。
 * 服务端在请求时读取进程环境变量(env 在进程启动后才确定),
 * connection() 声明依赖请求上下文,Suspense 边界是 cacheComponents
 * 下请求时数据的合法容器;客户端读数由 Client Component 自行完成。
 */

import { connection } from "next/server";
import { Suspense } from "react";

import { getTopicMetadata } from "@/lib/topic-meta";
import SecurityBoundariesTopic from "@/topics/security/boundaries";

export const metadata = getTopicMetadata("/security/boundaries");

/**
 * 动态主体:connection() 声明依赖请求上下文,
 * process.env 在请求时才能读到进程真实环境。
 */
async function BoundariesDynamicBody() {
    await connection();
    return <SecurityBoundariesTopic />;
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <BoundariesDynamicBody />
        </Suspense>
    );
}
