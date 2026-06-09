/**
 * ============================================================================
 * 根级 ESLint 共享配置 (Flat Config)
 * ============================================================================
 *
 * 为 workspace 内所有 Next.js 包提供统一的 lint 规则。
 * 子包通过 `export { default } from "../../eslint.config.mjs"` 继承，
 * 或 spread 后追加包级规则进行扩展。
 *
 * 规则分层：
 *   1. 框架预设 — eslint-config-next (Core Web Vitals + TypeScript)
 *   2. TypeScript 强化 — 类型导入规范、严格类型检查
 *   3. 导入排序 — simple-import-sort 自动排序
 *   4. 通用最佳实践 — 业界公认的 JS/TS 代码规范
 *
 * @module eslint.config
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import simpleImportSort from "eslint-plugin-simple-import-sort";

/* =================================================================
 * 1. 框架预设 (Framework Presets)
 * ================================================================ */

const frameworkPresets = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
]);

/* =================================================================
 * 2. TypeScript 强化 (TypeScript Strictness)
 * ================================================================ */

const tsStrictness = defineConfig({
  rules: {
    // 强制使用 import type 导入仅用作类型的声明
    // 与 tsconfig isolatedModules + Next.js 打包器对齐，自动修复
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],

    // 确保 import type 不会意外产生运行时副作用
    "@typescript-eslint/no-import-type-side-effects": "error",

    // 未使用变量报错，但允许 _ 前缀参数（惯用的占位符模式）
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],

    // any 降级为 warn：建议用 unknown 或具体类型代替，但不阻塞开发
    "@typescript-eslint/no-explicit-any": "warn",

    // 统一数组类型写法 T[] 而非 Array<T>
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

    // 统一索对象引签名风格 Record<K,V> 而非 { [key: K]: V }
    "@typescript-eslint/consistent-indexed-object-style": ["error", "record"],

    // 类型断言使用 as T 而非 <T>（与 JSX 语法不冲突）
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      { assertionStyle: "as", objectLiteralTypeAssertions: "allow-as-parameter" },
    ],

    // 禁止使用非空断言 !（除非确实安全）
    "@typescript-eslint/no-non-null-asserted-optional-chain": "error",

    // 禁止未使用的表达式（常见错误：忘记赋值）
    "@typescript-eslint/no-unused-expressions": [
      "error",
      { allowShortCircuit: true, allowTernary: true },
    ],
  },
});

/* =================================================================
 * 3. 导入排序 (Import Sorting)
 * ================================================================ */

const importSorting = defineConfig({
  plugins: {
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    // 自动排序所有 import 语句
    // 默认分组：副作用导入 → Node 内建 → 外部依赖 → 其他/别名 → 相对路径
    "simple-import-sort/imports": "error",
    // 同步排序 export 语句
    "simple-import-sort/exports": "error",
  },
});

/* =================================================================
 * 4. 通用最佳实践 (General Best Practices)
 * ================================================================ */

const bestPractices = defineConfig({
  rules: {
    // --- 代码质量 ---
    "no-console": "warn",           // 提醒清理生产 console，开发时宽松
    "no-debugger": "error",         // 禁止 debugger 语句
    "no-alert": "warn",             // 建议用 UI 组件替代原生 alert
    "eqeqeq": ["error", "always"],  // 强制 === 和 !==
    "no-var": "error",              // 禁止 var，用 const/let
    "prefer-const": "error",        // 优先 const，不修改的变量不用 let
    "no-else-return": "warn",       // return 后省略 else 减少嵌套
    "no-useless-return": "error",   // 删除无用的 return
    "no-unneeded-ternary": "error", // 简化 x ? true : false → !!x

    // --- 现代语法 ---
    "object-shorthand": ["error", "always"],   // { a, b } 而非 { a: a, b: b }
    "prefer-template": "error",                // 模板字符串而非 'a' + b
    "prefer-arrow-callback": "error",          // 回调优先箭头函数（注意 this 绑定场景）
    "prefer-spread": "error",                  // ...spread 而非 .apply()
    "prefer-rest-params": "error",             // ...rest 而非 arguments
    "prefer-object-spread": "error",           // { ...obj } 而非 Object.assign
    "arrow-body-style": ["warn", "as-needed"], // 箭头函数体可简写时提示

    // --- 控制流 ---
    "curly": ["error", "all"],       // if/else/for 必须用花括号
    "no-implicit-coercion": "error", // 显式转换：Number(x) 而非 +x

    // --- 变量使用 ---
    "no-shadow": "warn",                                                      // 避免变量名遮蔽外层作用域
    "no-use-before-define": ["error", { functions: false, classes: true }], // 禁止变量/类声明前使用（函数允许，因为 hoisting）

    // --- 最佳实践 ---
    "no-param-reassign": "warn",     // 避免直接修改函数参数
    "prefer-object-has-own": "error",// Object.hasOwn() 而非 .hasOwnProperty()
  },
});

/* =================================================================
 * 全局忽略
 * ================================================================ */

const rootConfig = defineConfig([
  ...frameworkPresets,
  ...importSorting,
  ...tsStrictness,
  ...bestPractices,
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/next-env.d.ts",
    "**/.claude/**",
    "**/.playwright-mcp/**",
  ]),
]);

export default rootConfig;
