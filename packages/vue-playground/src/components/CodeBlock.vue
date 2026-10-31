<script setup lang="ts">
/**
 * ============================================================================
 * CodeBlock — 代码展示块
 * ============================================================================
 *
 * 梳理页/专题页的代码片段展示:深色面板 + 可选语言标注 + 复制按钮。
 * 不做语法高亮(避免引入高亮库),以等宽字体呈现。
 *
 * @module components/CodeBlock
 */

import { ref } from 'vue';

const props = withDefaults(
    defineProps<{
        /** 代码内容 */
        code: string;
        /** 语言标注(右上角展示),如 'vue' / 'ts' */
        lang?: string;
    }>(),
    { lang: '' },
);

const copied = ref(false);

/** 复制代码到剪贴板,2s 后恢复按钮文案 */
const copy = async () => {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
};
</script>

<template>
    <div class="group relative overflow-hidden rounded-lg bg-gray-900 dark:bg-gray-950 dark:ring-1 dark:ring-gray-800">
        <div class="flex items-center justify-between px-4 pt-2">
            <span v-if="lang" class="text-[10px] font-medium uppercase tracking-wider text-gray-500">{{ lang }}</span>
            <span v-else />
            <button
                type="button"
                class="text-[11px] text-gray-500 opacity-0 transition-opacity hover:text-gray-200 group-hover:opacity-100"
                @click="copy"
            >
                {{ copied ? '已复制' : '复制' }}
            </button>
        </div>
        <pre class="overflow-x-auto px-4 pb-3 pt-1 text-[13px] leading-relaxed text-gray-100"><code>{{ code }}</code></pre>
    </div>
</template>
