<script setup lang="ts">
/**
 * ============================================================================
 * FancyInput — 自定义 v-model 输入框
 * ============================================================================
 *
 * 事件与表单专题的演示子组件:用 defineModel 实现双向绑定,
 * 并演示自定义修饰符(uppercase:输入自动转大写)。
 *
 * defineModel 是 Vue 3.4+ 的官方方案,替代手写的
 * props.modelValue + emit('update:modelValue') 样板。
 *
 * @module topics/basics/event-form/FancyInput
 */

// 自定义修饰符:解构 defineModel 的第二位拿到父级传入的修饰符集合
const [model, modifiers] = defineModel<string>();

const onInput = (e: Event) => {
    let value = (e.target as HTMLInputElement).value;
    if (modifiers.uppercase) value = value.toUpperCase();
    model.value = value;
};
</script>

<template>
    <input
        :value="model"
        class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        placeholder="试试输入小写字母"
        @input="onInput"
    />
</template>
