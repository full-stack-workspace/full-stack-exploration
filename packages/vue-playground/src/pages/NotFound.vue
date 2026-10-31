<script setup lang="ts">
/**
 * ============================================================================
 * NotFound — 404 兜底页
 * ============================================================================
 *
 * 未注册路径渲染本页,不静默跳回首页(与 react-playground 壳层约定一致)。
 *
 * @module pages/NotFound
 */
</script>

<template>
    <div class="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p class="text-5xl font-bold text-gray-200 dark:text-gray-800">404</p>
        <h1 class="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">页面不存在</h1>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            你访问的路径没有注册到专题表中,可能是链接过期或输入有误。
        </p>
        <RouterLink
            to="/"
            class="mt-6 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
            回到首页
        </RouterLink>
    </div>
</template>
