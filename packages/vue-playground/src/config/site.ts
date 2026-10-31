/**
 * ============================================================================
 * site — 站点品牌单一数据源(Single Source of Truth)
 * ============================================================================
 *
 * 站点品牌信息集中在此:站点名、英文副标、slogan、定位文案与线上域名。
 * index.html(经 vite.config.ts 的 transformIndexHtml 注入)、顶栏品牌区、
 * 路由 afterEach 的 document.title、首页 Hero、README 等品牌表述全部从这里派生,
 * 品牌调整只改这一个文件。
 *
 * 功能特点:
 * - 品牌文案与代码解耦,避免多处硬编码漂移
 * - SITE_URL 留空时,og / sitemap 等绝对 URL 场景输出占位
 *
 * @module config/site
 */

/** 站点中文名:顶栏品牌大字、og:site_name、document.title 后缀 */
export const SITE_NAME = 'Vue 权衡录';

/** 站点英文副标:首页 Hero 眉题、og 图等场景使用 */
export const SITE_NAME_EN = 'Vue Tradeoffs';

/** 站点 slogan:首页主标、document.title 首页后缀 */
export const SITE_SLOGAN = '把生产里的判断,写成可运行的对照';

/**
 * 站点定位文案:meta description / og:description。
 * 与 README 首段品牌表述保持同一口径。
 */
export const SITE_DESCRIPTION =
    'Vue 文档告诉你 API 能做什么,这个站点练的是另一件事:生产里该选哪条路,以及为什么不选另外几条。响应式、组合式函数、Pinia、组件通信与性能治理,按专题展开成可运行的对照实验。';

/** 标签页标题:专题页以外的首页/兜底标题 */
export const SITE_TITLE = `${SITE_NAME} · ${SITE_SLOGAN}`;

/**
 * 站点线上域名(如 'https://vue-tradeoffs.example.com')。
 * ⚠️ 部署后填写线上域名:og:image、sitemap.xml 等绝对 URL 依赖它。
 */
export const SITE_URL = '';
