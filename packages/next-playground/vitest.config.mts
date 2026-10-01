/**
 * Vitest 配置:注册表契约测试,纯 node 环境,不渲染组件。
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "node",
        include: ["config/**/*.test.ts"],
    },
});
