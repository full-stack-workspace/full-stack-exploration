<script setup lang="ts">
/**
 * ============================================================================
 * TemplateRenderProbe — 渲染探针
 * ============================================================================
 *
 * 模板语法专题的演示子组件:挂载时通过 emits 上报一次,
 * 用于对照 v-if(销毁重建)与 v-show(只切 display)的行为差异。
 * 组件内携带一个本地计数器,销毁后状态即丢失——直观展示状态重置。
 *
 * @module topics/basics/template-render/TemplateRenderProbe
 */

import { onMounted, ref } from 'vue';

defineProps<{ label: string }>();
const emit = defineEmits<{ rendered: [] }>();

// 本地状态:v-if 重建后归零,v-show 切换则保留
const local = ref(0);

onMounted(() => emit('rendered'));
</script>

<template>
    <div class="rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
        <span class="text-gray-500 dark:text-gray-400">{{ label }} · 本地计数:</span>
        <span class="mx-1 font-mono font-semibold">{{ local }}</span>
        <button type="button" class="ml-2 rounded border border-gray-300 px-1.5 text-xs dark:border-gray-600" @click="local++">
            +1
        </button>
    </div>
</template>
