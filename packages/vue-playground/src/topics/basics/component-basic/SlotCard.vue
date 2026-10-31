<script setup lang="ts">
/**
 * ============================================================================
 * SlotCard — 插槽演示卡片
 * ============================================================================
 *
 * 组件基础专题的演示子组件:一张卡片同时展示三种插槽——
 * 默认插槽(内容)、具名插槽(header/footer)、作用域插槽(把内部数据
 * 回传给父级渲染)。
 *
 * @module topics/basics/component-basic/SlotCard
 */

import { ref } from 'vue';

defineProps<{ title: string }>();

// 作用域插槽回传的内部状态示例:卡片的「已读」状态由子组件持有
const readCount = ref(0);
const markRead = () => readCount.value++;
</script>

<template>
    <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm font-medium dark:border-gray-800 dark:bg-gray-800/60">
            <slot name="header" :title="title">{{ title }}</slot>
        </div>
        <div class="px-4 py-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <slot>（默认插槽内容）</slot>
        </div>
        <div class="flex items-center justify-between border-t border-gray-100 px-4 py-2 text-xs text-gray-400 dark:border-gray-800">
            <slot name="footer" :count="readCount" :mark-read="markRead">
                <span>默认 footer</span>
            </slot>
        </div>
    </div>
</template>
