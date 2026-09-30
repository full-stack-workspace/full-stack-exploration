/**
 * ============================================================================
 * gen-sitemap.mjs — sitemap.xml 生成脚本
 * ============================================================================
 *
 * 从 src/config/topics.tsx 注册表中正则提取 `path: '...'` 条目,
 * 连同首页生成 public/sitemap.xml。挂接在 package.json 的 prebuild:
 * `relay-compiler && node scripts/gen-sitemap.mjs`,每次构建自动刷新。
 *
 * SITE_URL(src/config/site.ts)为空时输出相对路径占位并在文件头注释说明;
 * 部署后填写 SITE_URL 重新构建即可得到绝对 URL 的 sitemap。
 *
 * 用法:node scripts/gen-sitemap.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---- 从注册表提取专题路径 ---- */
const topicsSource = readFileSync(join(pkgRoot, 'src/config/topics.tsx'), 'utf8');
const topicPaths = [...topicsSource.matchAll(/^\s*path:\s*'([^']+)'/gm)].map((m) => m[1]);

if (topicPaths.length === 0) {
    process.stderr.write('[gen-sitemap] 未从 topics.tsx 提取到任何 path,请检查注册表格式\n');
    process.exit(1);
}

/* ---- 从品牌数据源读取 SITE_URL(留空则为相对路径占位) ---- */
const siteSource = readFileSync(join(pkgRoot, 'src/config/site.ts'), 'utf8');
const siteUrlMatch = siteSource.match(/export const SITE_URL = '([^']*)'/);
const siteUrl = (siteUrlMatch?.[1] ?? '').replace(/\/$/, '');

const allPaths = ['/', ...topicPaths];
const buildDate = new Date().toISOString().slice(0, 10);

const urlEntries = allPaths
    .map((p) => {
        const loc = siteUrl ? `${siteUrl}${p}` : p;
        return [
            '  <url>',
            `    <loc>${loc}</loc>`,
            `    <lastmod>${buildDate}</lastmod>`,
            `    <changefreq>${p === '/' ? 'weekly' : 'monthly'}</changefreq>`,
            `    <priority>${p === '/' ? '1.0' : '0.8'}</priority>`,
            '  </url>',
        ].join('\n');
    })
    .join('\n');

const placeholderNote = siteUrl
    ? ''
    : '\n  ⚠️ SITE_URL(src/config/site.ts)为空,以下为相对路径占位;\n  部署后填写线上域名并重新构建,即可生成绝对 URL 的 sitemap。\n';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  本文件由 scripts/gen-sitemap.mjs 自动生成(prebuild),请勿手改。
  路径来源:src/config/topics.tsx 注册表 + 首页。${placeholderNote}-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(join(pkgRoot, 'public/sitemap.xml'), xml);
process.stdout.write(
    `[gen-sitemap] 已生成 public/sitemap.xml,共 ${allPaths.length} 条 URL${siteUrl ? '' : '(SITE_URL 为空,相对路径占位)'}\n`,
);
