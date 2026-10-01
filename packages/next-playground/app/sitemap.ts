/**
 * ============================================================================
 * sitemap.xml — 由专题注册表生成
 * ============================================================================
 *
 * 爬虫文件专题的活素材:注册一个专题,这里就多一条 URL。
 * metadata 对象写不出这份文件,它必须是 app/sitemap.ts。
 *
 * @module app/sitemap
 */

import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site";
import { TOPICS } from "@/config/topics";

export default function sitemap(): MetadataRoute.Sitemap {
    const pages = TOPICS.filter((topic) => topic.status !== "planned");
    return [
        { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
        ...pages.map((topic) => ({
            url: `${SITE_URL}${topic.path}`,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
    ];
}
