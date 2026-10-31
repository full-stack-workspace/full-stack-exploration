<script setup lang="ts">
/**
 * ============================================================================
 * AsyncPanel — 模拟慢加载的异步面板
 * ============================================================================
 *
 * 异步组件专题的演示载荷:模块顶层人为延迟 1.2s,
 * 模拟「大 chunk 网络加载」;加载完成后展示一张数据面板。
 *
 * @module topics/advanced/async-suspense/AsyncPanel
 */

import { ref } from 'vue';

// 顶层 await:配合 defineAsyncComponent / Suspense 演示加载态
await new Promise((r) => setTimeout(r, 1200));

const loadTime = ref(new Date().toLocaleTimeString());
</script>

<template>
    <div class="rounded-lg border border-primary-200 bg-primary-50/50 p-4 text-sm dark:border-primary-900 dark:bg-primary-950/30">
        <p class="font-medium text-primary-700 dark:text-primary-300">异步面板已加载</p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">模块于 {{ loadTime }} 就绪(顶层 await 模拟 1.2s chunk 延迟)</p>
    </div>
</template>
