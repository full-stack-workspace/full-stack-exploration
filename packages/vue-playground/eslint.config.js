/**
 * ============================================================================
 * eslint.config — vue-playground 包级 flat config
 * ============================================================================
 *
 * eslint-plugin-vue flat/recommended + @typescript-eslint/parser。
 * 不继承根目录的 Next 向配置(与 react-playground 的包级策略一致)。
 *
 * @module eslint.config
 */

import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
        },
    },
    {
        // .vue 文件由 vue-eslint-parser 解析,<script lang="ts"> 交给 TS parser
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: { parser: tsParser },
        },
    },
    {
        // .vue 文件的 parser 已由 eslint-plugin-vue 配置(vue-eslint-parser + tsParser)
        files: ['**/*.ts'],
        languageOptions: { parser: tsParser },
        rules: {
            // TS 编译器负责类型与未定义检查;no-undef 会把 TS 类型名误判为未定义
            'no-undef': 'off',
        },
    },
    {
        rules: {
            // 专题页多为单词目录名(Home/Loading 等),学习站不强制多词组件名
            'vue/multi-word-component-names': 'off',
            // 与仓库其他包一致使用 4 空格缩进(含模板)
            'vue/html-indent': ['warn', 4],
            // 单行标签内容不强制换行,避免短文本标签被拆行
            'vue/singleline-html-element-content-newline': 'off',
            // Tailwind 工具类场景下每行一个属性反而降低可读性
            'vue/max-attributes-per-line': 'off',
            // void 元素自闭合风格不强制(教学代码中两种写法都会出现)
            'vue/html-self-closing': 'off',
        },
    },
];
