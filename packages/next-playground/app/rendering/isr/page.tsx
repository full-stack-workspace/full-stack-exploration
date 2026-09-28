/**
 * 薄壳:ISR 专题路由。revalidate 是页面级约定,必须留在 app/ 路由文件里。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import IsrTopic from "@/topics/rendering/isr";

/** ISR:60s 后下一个请求触发后台重建 */
export const revalidate = 60;

export const metadata = getTopicMetadata("/rendering/isr");

export default function Page() {
    return <IsrTopic />;
}
