import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  // 基础 JavaScript 推荐规则
  js.configs.recommended,

  // 全局配置
  {
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },

  // TypeScript 文件配置
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    languageOptions: {
      parser: tsparser,
    },
    rules: {
      // 关闭基础 JavaScript 的 no-unused-vars，使用 TypeScript 版本
      'no-unused-vars': 'off',

      // 可自定义的 TypeScript 规则
      // 注意：需要手动启用规则，或使用 typescript-eslint 包获取推荐配置
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          // 允许函数类型定义中的参数（TypeScript 类型定义需要参数名）
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },

  // React 文件配置
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React 推荐规则
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,

      // 可自定义的 React 规则
      'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入 React
      'react/prop-types': 'off', // TypeScript 已经处理了类型检查
      'react/display-name': 'warn',
      // 确保 React Hooks 规则在 React 组件中正确使用
      'react-hooks/rules-of-hooks': 'error',
      // 检查 React Hooks 的依赖项是否正确
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 代码质量规则（适用于所有文件）
  {
    rules: {
      // 可自定义的通用规则
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['warn', 'always', { null: 'ignore' }],
      'curly': ['warn', 'all'],
    },
  },

  // 测试文件配置（更宽松的规则）
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      // 测试文件中允许使用 console
      'no-console': 'off',
      // 测试文件中允许使用 any（测试场景）
      '@typescript-eslint/no-explicit-any': 'off',
      // 测试文件中允许使用非空断言
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // 忽略文件配置
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.rsbuild/**',
      '*.config.js',
      '*.config.ts',
      '**/__generated__/**',
      'public/**',
      '*.min.js',
      'coverage/**',
      '.vitest/**',
    ],
  },
];
