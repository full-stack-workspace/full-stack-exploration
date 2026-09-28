/**
 * 薄壳:爬虫文件专题。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import CrawlTopic from "@/topics/metadata/crawl";

export const metadata = getTopicMetadata("/metadata/crawl");

export default function Page() {
    return <CrawlTopic />;
}
