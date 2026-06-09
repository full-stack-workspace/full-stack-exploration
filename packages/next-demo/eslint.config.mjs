/**
 * next-demo ESLint 配置 — 继承根级共享配置
 *
 * 如需包级规则扩展（如放宽特定规则、追加自定义 ignore），
 * 使用以下模式：
 *
 *   import rootConfig from "../../eslint.config.mjs";
 *   import { defineConfig } from "eslint/config";
 *   export default defineConfig([
 *     ...rootConfig,
 *     { rules: { "no-console": "off" } }  // 举例
 *   ]);
 */
export { default } from "../../eslint.config.mjs";
