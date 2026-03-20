import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  // 配置基础路径，避免在生产环境下访问时路径错误
  // 用于设置编译后的文件路径，默认值为 '/'
  // base: '/xxx-prefix',
  // 配置项目根目录，默认值为当前目录
  // root: './',
  // 配置静态资源目录，默认值为 'public'
  // publicDir: './src/assets',
  resolve: {
    // 配置别名，用于在代码中引用项目根目录下的文件
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173
  }
})
