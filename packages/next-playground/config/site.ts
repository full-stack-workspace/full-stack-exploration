/**
 * ============================================================================
 * site — 站点品牌单一数据源(Single Source of Truth)
 * ============================================================================
 *
 * 站点品牌信息集中在此:站点名、英文副标、slogan、论点、定位文案与线上域名。
 * 根 layout metadata、顶栏/页脚品牌区、首页 Hero、OG 图、sitemap/robots
 * 全部从这里派生,品牌调整只改这一个文件。
 *
 * 与同 monorepo 的 react-playground(React 权衡录 / React Tradeoffs)
 * 构成站群,两站共用同一套品牌结构与命名口径。
 *
 * 功能特点:
 * - 品牌文案与代码解耦,避免多处硬编码漂移
 * - SITE_URL 部署到 Vercel 后自动取 VERCEL_URL,本地兜底 localhost
 *
 * @module config/site
 */

/** 站点中文名:顶栏品牌字、og:site_name、title.template 后缀 */
export const SITE_NAME = "Next 权衡录";

/** 站点英文副标:首页 Hero 眉题、OG 图等场景使用 */
export const SITE_NAME_EN = "Next Tradeoffs";

/** 站点 slogan:字标旁短句、首页主标 */
export const SITE_SLOGAN = "把选型放到同一把尺子上";

/**
 * 站点论点。首页副句、页脚与 Open Graph 共用。
 * 文档负责「能做什么」,本站负责「这一页该选哪条」。
 */
export const SITE_THESIS = "文档写能做什么。这里写该选哪条。";

/**
 * 站点定位文案:meta description / og:description / twitter:description。
 * 与 react-playground 的 SITE_DESCRIPTION 保持同一口径。
 */
export const SITE_DESCRIPTION =
    "Next.js 文档告诉你 API 能做什么，这个站点练的是另一件事：这一页该选哪条，以及为什么不选另外几条。渲染光谱、RSC 边界、缓存、路由与 AI-Native，按专题展开成可运行的对照。";

/** 首页 / 兜底标题(title.default) */
export const HOME_TITLE = `${SITE_NAME} · ${SITE_SLOGAN}`;

/**
 * 站点线上域名。
 * 部署到 Vercel 时 VERCEL_URL 由平台注入,metadataBase / sitemap / robots
 * 自动指向正确域名;本地开发兜底 http://localhost:3000。
 * 自托管平台可用 NEXT_PUBLIC_SITE_URL 显式指定。
 */
export const SITE_URL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
