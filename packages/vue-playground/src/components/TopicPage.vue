<script setup lang="ts">
/**
 * ============================================================================
 * TopicPage — 专题页骨架
 * ============================================================================
 *
 * 所有专题页的统一骨架:面包屑(首页 / 分类 / 专题)+ 分类眉题 +
 * h1 标题 + 一句话说明 + 默认插槽内容。path 必填,用于回查注册表取标题与分类,
 * 保证页头信息与注册表同源。
 *
 * @example
 * <TopicPage path="/reactivity/ref-vs-reactive">
 *     <TopicSection title="...">...</TopicSection>
 * </TopicPage>
 *
 * @module components/TopicPage
 */

import { computed } from 'vue';
import { getCategoryMeta, getTopicByPath } from '@/config/topics';

const props = defineProps<{
    /** 专题路由路径,必填,用于回查注册表 */
    path: string;
}>();

const topic = computed(() => getTopicByPath(props.path));
const category = computed(() => (topic.value ? getCategoryMeta(topic.value.category) : undefined));
</script>

<template>
    <div class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-8">
        <nav v-if="topic && category" aria-label="面包屑" class="mb-6 text-xs text-gray-400 dark:text-gray-500">
            <RouterLink to="/" class="transition-colors hover:text-gray-600 dark:hover:text-gray-300">首页</RouterLink>
            <span class="mx-1.5 text-gray-300 dark:text-gray-700">/</span>
            <span>{{ category.title }}</span>
            <span class="mx-1.5 text-gray-300 dark:text-gray-700">/</span>
            <span class="text-gray-600 dark:text-gray-300">{{ topic.title }}</span>
        </nav>
        <header v-if="topic && category" class="mb-10 border-b border-gray-100 pb-8 dark:border-gray-800/80">
            <!-- 分类眉题:圆点取分类主题色 -->
            <p class="mb-3 flex items-center gap-2 text-[13px] font-medium" :class="category.theme.text">
                <span class="h-1.5 w-1.5 rounded-full" :class="category.theme.dot" aria-hidden="true" />
                {{ category.title }}
            </p>
            <h1 class="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-gray-50">
                {{ topic.title }}
            </h1>
            <p class="mt-3 max-w-2xl text-[15px] leading-7 text-gray-500 dark:text-gray-400">
                {{ topic.description }}
            </p>
        </header>
        <slot />
    </div>
</template>
