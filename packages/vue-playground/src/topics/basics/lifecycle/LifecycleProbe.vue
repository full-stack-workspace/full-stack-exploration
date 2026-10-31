<script setup lang="ts">
/**
 * ============================================================================
 * LifecycleProbe — 生命周期探针
 * ============================================================================
 *
 * 生命周期专题的演示子组件:在关键钩子(onBeforeMount / onMounted /
 * onBeforeUpdate / onUpdated / onBeforeUnmount / onUnmounted)里向父级上报,
 * 父级汇总成时间线。带一个可改的 prop,用于触发 update 钩子。
 *
 * @module topics/basics/lifecycle/LifecycleProbe
 */

import { onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated } from 'vue';

defineProps<{ tick: number }>();
const emit = defineEmits<{ hook: [name: string] }>();

onBeforeMount(() => emit('hook', 'onBeforeMount'));
onMounted(() => emit('hook', 'onMounted'));
onBeforeUpdate(() => emit('hook', 'onBeforeUpdate'));
onUpdated(() => emit('hook', 'onUpdated'));
onBeforeUnmount(() => emit('hook', 'onBeforeUnmount'));
onUnmounted(() => emit('hook', 'onUnmounted'));
</script>

<template>
    <div class="rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
        探针组件已挂载 · 当前 tick = <span class="font-mono font-semibold">{{ tick }}</span>
    </div>
</template>
