/**
 * 薄壳:表单进阶专题路由。
 * 页面无请求时数据,整体可预渲染;
 * 校验与提交全部走 topics/data/forms/actions.ts 的 Server Actions。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import FormsTopic from "@/topics/data/forms";

export const metadata = getTopicMetadata("/data/forms");

export default function Page() {
    return <FormsTopic />;
}
