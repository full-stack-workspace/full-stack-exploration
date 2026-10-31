<script setup lang="ts">
/**
 * ============================================================================
 * SideNav — 专题页左侧导航(桌面端)
 * ============================================================================
 *
 * 文档式二级导航:分类为一级(点击落到分类首个专题),
 * 当前分类下展开该分类全部专题;当前专题左侧带指示条高亮。
 * 数据全部来自注册表,新增专题自动出现。
 *
 * @module components/SideNav
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { CATEGORIES, getCategoryByPath, getCategoryLandingPath, getTopicsByCategory } from '@/config/topics';

const route = useRoute();
const activeCategory = computed(() => getCategoryByPath(route.path));
</script>

<template>
    <aside class="hidden w-60 shrink-0 lg:block" aria-label="专题导航">
        <nav class="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-4 py-6">
            <div v-for="c in CATEGORIES" :key="c.key" class="mb-4">
                <RouterLink
                    :to="getCategoryLandingPath(c.key)"
                    class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] font-semibold transition-colors"
                    :class="
                        activeCategory?.key === c.key
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                    "
                >
                    <span class="h-1.5 w-1.5 rounded-full" :class="c.theme.dot" aria-hidden="true" />
                    {{ c.title }}
                </RouterLink>
                <ul v-if="activeCategory?.key === c.key" class="mt-1 space-y-0.5">
                    <li v-for="t in getTopicsByCategory(c.key)" :key="t.path">
                        <RouterLink
                            :to="t.path"
                            class="relative block rounded-r-md py-1.5 pl-6 pr-2 text-[13px] transition-colors"
                            :class="
                                route.path === t.path
                                    ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200'
                            "
                            :aria-current="route.path === t.path ? 'page' : undefined"
                        >
                            <span
                                v-if="route.path === t.path"
                                class="absolute left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-primary-500"
                                aria-hidden="true"
                            />
                            {{ t.title }}
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </nav>
    </aside>
</template>
