/**
 * 薄壳:Server Actions 专题路由。
 * force-dynamic 是演示成立的前提:留言列表来自模块级内存数组,
 * 若允许构建期预渲染,列表会被拍平成静态 HTML,新增留言后看不到更新。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import ServerActionsTopic from "@/topics/rsc-boundary/server-actions";

/** 每次请求都在运行时渲染,保证读到最新的内存留言 */
export const dynamic = "force-dynamic";

export const metadata = getTopicMetadata("/rsc-boundary/server-actions");

export default function Page() {
    return <ServerActionsTopic />;
}
