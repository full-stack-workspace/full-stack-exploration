/**
 * ============================================================================
 * Commitlint 配置 — Conventional Commits 格式校验
 * ============================================================================
 *
 * 通过 husky commit-msg hook 自动校验每条提交信息。
 * 规则对齐 Conventional Commits 1.0.0 标准。
 *
 * 格式：type(scope): subject
 *
 * 允许的类型（与已有提交历史对齐）：
 *   feat     新功能
 *   fix      修 bug
 *   docs     文档变更
 *   style    格式调整（不影响逻辑）
 *   refactor 代码重构
 *   test     测试相关
 *   chore    构建/工具/依赖
 *   perf     性能优化
 *   ci       CI/CD 配置
 *   build    构建系统变更
 *
 * scope 可选 —— 既支持 "chore: xxx" 也支持 "feat(next-upload): xxx"
 *
 * @module commitlint.config
 */

const config = {
  extends: ["@commitlint/config-conventional"],
};

export default config;
