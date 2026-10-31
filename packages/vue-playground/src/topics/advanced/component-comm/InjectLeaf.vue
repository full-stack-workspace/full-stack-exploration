<script setup lang="ts">
/**
 * ============================================================================
 * InjectLeaf — provide/inject 演练叶子组件
 * ============================================================================
 *
 * 组件通信模式演练的叶子组件:不接收任何 props,
 * 直接 inject 祖辈提供的主题色与子树上下文。
 *
 * @module topics/advanced/component-comm/InjectLeaf
 */

import { inject, type Ref } from 'vue';

// 注入祖辈提供的响应式颜色(子树级通道,不经中间层接力)
const themeColor = inject<Ref<string>>('comm-theme-color')!;
</script>

<template>
    <div class="rounded-lg border p-4 text-sm" :style="{ borderColor: themeColor }">
        <p class="text-xs text-gray-500 dark:text-gray-400">InjectLeaf:零 props,颜色来自祖辈 provide</p>
        <p class="mt-1 font-mono text-xs" :style="{ color: themeColor }">themeColor = {{ themeColor }}</p>
    </div>
</template>
