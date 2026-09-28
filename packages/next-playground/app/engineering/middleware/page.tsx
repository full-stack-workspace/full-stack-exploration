/**
 * 薄壳:中间件边界与代价专题(engineering 分类)。
 * 本页同时是 middleware.ts 的实验对象:响应应带 x-playground-middleware 头。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import MiddlewareTopic from "@/topics/engineering/middleware";

export const metadata = getTopicMetadata("/engineering/middleware");

export default function Page() {
    return <MiddlewareTopic />;
}
