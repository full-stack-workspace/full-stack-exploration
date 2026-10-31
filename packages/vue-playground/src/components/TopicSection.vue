<script setup lang="ts">
/**
 * ============================================================================
 * TopicSection — 专题页小节容器
 * ============================================================================
 *
 * 专题页内的内容分节:小节标题 + 可选说明 + 默认插槽。
 *
 * @module components/TopicSection
 */

defineProps<{
    /** 小节标题 */
    title: string;
    /** 小节说明(可选) */
    description?: string;
}>();
</script>

<template>
    <section class="mb-8 rounded-xl border border-gray-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-gray-800 dark:bg-gray-900/50 dark:shadow-none">
        <h2 class="text-base font-semibold tracking-tight text-ink-900 dark:text-gray-100">{{ title }}</h2>
        <p v-if="description" class="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {{ description }}
        </p>
        <div class="mt-5">
            <slot />
        </div>
    </section>
</template>
