<script setup lang="ts">
/**
 * ============================================================================
 * Loading — 加载占位
 * ============================================================================
 *
 * 懒加载专题页(异步组件)pending 时的统一占位。
 *
 * @module components/Loading
 */
</script>

<template>
    <div class="flex items-center justify-center py-24" role="status" aria-label="加载中">
        <span
            class="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-400"
            aria-hidden="true"
        />
    </div>
</template>
