/**
 * 薄壳:构建、测量与部署专题(engineering 分类)。
 * 纯静态讲解页:证据是构建产物(报告文件与输出快照),无请求时数据。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import BuildDeployTopic from "@/topics/engineering/build-deploy";

export const metadata = getTopicMetadata("/engineering/build-deploy");

export default function Page() {
    return <BuildDeployTopic />;
}
