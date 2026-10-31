<script setup lang="ts">
/**
 * ============================================================================
 * EmitButton — emits 演示按钮
 * ============================================================================
 *
 * 组件基础专题的演示子组件:点击时 emit 一个带载荷的自定义事件,
 * 演示「子组件不直接改父级状态,而是上报发生了什么」。
 *
 * @module topics/basics/component-basic/EmitButton
 */

defineProps<{ label: string }>();
const emit = defineEmits<{ activate: [payload: { label: string; at: string }] }>();

const fire = () => {
    emit('activate', { label: '子按钮', at: new Date().toLocaleTimeString() });
};
</script>

<template>
    <button
        type="button"
        class="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
        @click="fire"
    >
        {{ label }}
    </button>
</template>
