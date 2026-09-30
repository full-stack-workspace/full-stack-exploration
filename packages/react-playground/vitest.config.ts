// 注意：devDependencies 中的 vite ^5 仅为 vitest 2 所需（vitest 2 依赖 vite 5）；
// 本包构建实际使用 Rsbuild(Rspack)，请勿随根目录 vite 版本升级，否则会破坏测试。
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境：使用 jsdom 模拟浏览器环境
    environment: 'jsdom',

    // 全局测试文件匹配模式
    globals: true,

    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', '**/__generated__/**'],

    // 测试环境设置文件（全局设置）
    setupFiles: ['./src/test/setupTests.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/config/**',
        '**/__generated__/**',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        'dist/',
      ],
      // 覆盖率阈值配置（可根据项目需求调整）
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // 超时设置（毫秒）
    testTimeout: 10000,

    // 当文件变化时重新运行测试
    watch: false,

    // 使用线程池运行测试，提升性能
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
