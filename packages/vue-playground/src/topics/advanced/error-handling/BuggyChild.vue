<script setup lang="ts">
/**
 * ============================================================================
 * BuggyChild — 渲染期抛错的演示子组件
 * ============================================================================
 *
 * 错误处理专题的演示载荷:shouldCrash 变为 true 时,
 * 模板依赖的 computed 在渲染期抛错,由父级 onErrorCaptured 捕获。
 * (放在 computed 而非 setup 顶层,是为了响应 prop 变化后再抛。)
 *
 * @module topics/advanced/error-handling/BuggyChild
 */

import { computed } from 'vue';

const props = defineProps<{ shouldCrash: boolean }>();

/** 渲染期守卫:shouldCrash 为 true 时抛错,模拟子树渲染崩溃 */
const guard = computed(() => {
    if (props.shouldCrash) throw new Error('BuggyChild 渲染期崩溃(演示)');
    return 'BuggyChild 正常渲染';
});
</script>

<template>
    <div class="rounded-md bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-950 dark:text-primary-300">
        {{ guard }}
    </div>
</template>
