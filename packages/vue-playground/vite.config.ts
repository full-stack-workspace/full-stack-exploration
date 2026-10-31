/**
 * ============================================================================
 * vite.config — vue-playground 构建配置
 * ============================================================================
 *
 * Vite 8 + @vitejs/plugin-vue + Tailwind CSS v4(@tailwindcss/vite)。
 * 经 transformIndexHtml 把 config/site.ts 的品牌信息注入 index.html,
 * 保持「站点品牌单一数据源」约定(对齐 react-playground 的 templateParameters)。
 *
 * @module vite.config
 */

import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import { SITE_DESCRIPTION, SITE_TITLE } from './src/config/site.ts';

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        {
            name: 'inject-site-meta',
            // 品牌占位符替换:%SITE_TITLE% / %SITE_DESCRIPTION%
            transformIndexHtml(html) {
                return html
                    .replaceAll('%SITE_TITLE%', SITE_TITLE)
                    .replaceAll('%SITE_DESCRIPTION%', SITE_DESCRIPTION);
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        // 5173-5175 已被 vite-* 占用,3000-3002 被 next-*/react-playground 占用
        port: 5176,
    },
});
