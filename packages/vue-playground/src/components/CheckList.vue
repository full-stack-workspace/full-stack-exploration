<script setup lang="ts">
/**
 * ============================================================================
 * CheckList — 理解检验问答列表
 * ============================================================================
 *
 * 各分类末页「理解检验」的统一载体:折叠面板(Question → 自答后展开答案)。
 * 较难题标星级与考察点,对齐 react-playground 的 check 页约定。
 *
 * @module components/CheckList
 */

import { ElCollapse, ElCollapseItem } from 'element-plus';
import type { CheckItem } from './check-list';

defineProps<{
    items: CheckItem[];
}>();
</script>

<template>
    <ElCollapse class="check-list">
        <ElCollapseItem v-for="(item, i) in items" :key="i" :name="i">
            <template #title>
                <span class="flex items-center gap-2 text-left">
                    <span class="text-xs text-gray-400">{{ String(i + 1).padStart(2, '0') }}</span>
                    <span class="text-sm">{{ item.question }}</span>
                    <span v-if="item.star" class="text-amber-500" :aria-label="`难度 ${item.star} 星`">
                        {{ '★'.repeat(item.star) }}
                    </span>
                    <span v-if="item.point" class="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {{ item.point }}
                    </span>
                </span>
            </template>
            <p class="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">{{ item.answer }}</p>
        </ElCollapseItem>
    </ElCollapse>
</template>

<style scoped>
/* 折叠面板底色贴合站点明暗主题 */
.check-list {
    --el-collapse-header-bg-color: transparent;
    --el-collapse-content-bg-color: transparent;
    --el-collapse-header-text-color: inherit;
    --el-collapse-border-color: var(--el-border-color-lighter);
}
</style>
