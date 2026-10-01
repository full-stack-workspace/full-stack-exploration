/**
 * ============================================================================
 * 专题 metadata helper
 * ============================================================================
 *
 * 薄壳页(page.tsx)通过 getTopicMetadata 从注册表派生页面 metadata,
 * 保证「首页卡片描述 / 专题页头 / <meta> 标签」三处文案同源。
 *
 * 站点品牌常量(SITE_NAME / SITE_SLOGAN / SITE_THESIS / HOME_TITLE 等)
 * 已收敛到 @/config/site 单一数据源,这里只做 re-export 兼容存量 import,
 * 新增代码请直接从 @/config/site 导入。
 *
 * @module lib/topic-meta
 */

import type { Metadata } from "next";

import { SITE_NAME } from "@/config/site";
import { getTopicByPath } from "@/config/topics";

export {
    HOME_TITLE,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_NAME_EN,
    SITE_SLOGAN,
    SITE_THESIS,
    SITE_URL,
} from "@/config/site";

/**
 * 由注册表生成专题页 metadata。
 *
 * @param path - 专题注册路径,如 "/rendering/isr"
 * @returns Metadata;未注册的路径返回兜底标题(此时应检查注册表)
 *
 * @example
 * // app/rendering/isr/page.tsx
 * export const metadata = getTopicMetadata("/rendering/isr");
 */
export function getTopicMetadata(path: string): Metadata {
    const topic = getTopicByPath(path);
    if (!topic) {
        return { title: SITE_NAME };
    }
    return {
        title: topic.title,
        description: topic.description,
        keywords: topic.keywords,
        openGraph: {
            title: `${topic.title} | ${SITE_NAME}`,
            description: topic.description,
        },
    };
}
