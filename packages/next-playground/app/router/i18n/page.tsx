/**
 * 薄壳:国际化路由专题(讲机制的教学页)。
 * 双语活演示在同级 [lang]/ 子路由下。
 */

import { getTopicMetadata } from "@/lib/topic-meta";
import I18nTopic from "@/topics/router/i18n";

export const metadata = getTopicMetadata("/router/i18n");

export default function Page() {
    return <I18nTopic />;
}
