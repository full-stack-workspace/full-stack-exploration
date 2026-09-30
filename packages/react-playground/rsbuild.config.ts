import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBabel } from '@rsbuild/plugin-babel';

import {
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_EN,
  SITE_TITLE,
} from './src/config/site';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  // monorepo 内端口分配:3000=next-playground,3001=next-upload,此处使用 3002 避免冲突
  server: {
    port: 3002,
  },
  // Rsbuild 默认 html.title 是 「Rsbuild App」,必须显式覆盖,否则会盖掉 index.html 里的 <title>;
  // 品牌文案统一从 src/config/site.ts 派生,经 templateParameters(lodash 模板语法 <%= %>)注入 index.html
  html: {
    template: './index.html',
    title: SITE_TITLE,
    templateParameters: {
      title: SITE_TITLE,
      siteName: SITE_NAME,
      siteNameEn: SITE_NAME_EN,
      description: SITE_DESCRIPTION,
      ogImage: OG_IMAGE_URL,
    },
  },
  plugins: [
    // 启用 React 插件，自动为当前工程配置 React 支持，包括 JSX/JSX transform、HMR、Fast Refresh 等特性
    pluginReact(),

    // 使用 Babel 插件，对源码进行自定义转换
    pluginBabel({
      babelLoaderOptions: {
        // 配置 Babel Loader 插件
        plugins: [
          [
            // 使用 relay Babel 插件，将 Relay GraphQL 查询编译成 artifacts，提升类型安全与性能
            'relay',
            {
              // 指定编译产物（artifacts）输出到 ./src/__generated__ 目录
              artifactDirectory: './src/__generated__',
            },
          ],
        ],
      },
    }),
  ],
});
