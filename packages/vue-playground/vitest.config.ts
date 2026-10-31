/**
 * ============================================================================
 * vitest.config — 单元测试配置
 * ============================================================================
 *
 * jsdom 环境 + @vitejs/plugin-vue,alias 与 vite.config.ts 保持一致。
 * 注册表契约测试(config/topics.test.ts)也跑在该环境下。
 *
 * @module vitest.config
 */

import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
    },
});
