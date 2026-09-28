/**
 * ============================================================================
 * 专题 metadata helper
 * ============================================================================
 *
 * 薄壳页(page.tsx)通过 getTopicMetadata 从注册表派生页面 metadata,
 * 保证「首页卡片描述 / 专题页头 / <meta> 标签」三处文案同源。
 *
 * 站点品牌名集中在 SITE_NAME,与根 layout 的 title.template、
 * 顶栏品牌区保持一致。
 *
 * @module lib/topic-meta
 */

import type { Metadata } from "next";

import { getTopicByPath } from "@/config/topics";

/** 站点品牌名 */
export const SITE_NAME = "Next Playground";

/** 顶栏口号:短,能放在标记旁边 */
export const SITE_SLOGAN = "该选哪条";

/**
 * 站点论点。首页主句、页脚与 Open Graph 共用。
 * 文档负责「能做什么」,本站负责「这一页该选哪条」。
 */
export const SITE_THESIS = "文档写能做什么。这里写该选哪条。";

/** 首页 / 兜底标题,与顶栏口号一致 */
export const HOME_TITLE = `${SITE_NAME} · ${SITE_SLOGAN}`;

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
