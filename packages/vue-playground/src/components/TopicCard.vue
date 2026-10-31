<script setup lang="ts">
/**
 * ============================================================================
 * TopicCard — 专题导航卡片
 * ============================================================================
 *
 * 首页分类分组下的专题入口卡片,展示标题与一句话说明,
 * hover 时边框色取所属分类主题的 hoverBorder。
 *
 * @module components/TopicCard
 */

import type { CategoryMeta, TopicMeta } from '@/config/topics';

defineProps<{
    topic: TopicMeta;
    category: CategoryMeta;
}>();
</script>

<template>
    <RouterLink
        :to="topic.path"
        class="group block rounded-xl border border-gray-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50 dark:shadow-none"
        :class="category.theme.hoverBorder"
    >
        <h3 class="text-sm font-semibold text-ink-900 dark:text-gray-100">
            {{ topic.title }}
        </h3>
        <p class="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {{ topic.description }}
        </p>
        <span class="mt-3 inline-flex items-center gap-1 text-xs font-medium" :class="category.theme.text">
            开始练习
            <span aria-hidden="true" class="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
    </RouterLink>
</template>
