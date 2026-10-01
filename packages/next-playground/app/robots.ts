/**
 * ============================================================================
 * robots.txt — 允许抓取,并指向注册表生成的 sitemap
 * ============================================================================
 *
 * @module app/robots
 */

import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
