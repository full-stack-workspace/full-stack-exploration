<script setup lang="ts">
/**
 * ============================================================================
 * CommChild — 通信演练子组件
 * ============================================================================
 *
 * 组件通信模式演练的子组件:一个组件同时演示 props 接收、
 * emits 上报与 v-model 双向绑定三个通道。
 *
 * @module topics/advanced/component-comm/CommChild
 */

const props = defineProps<{ title: string; score: number }>();
const emit = defineEmits<{ rated: [score: number] }>();

// v-model 通道:备注的双向绑定
const note = defineModel<string>('note', { default: '' });
</script>

<template>
    <div class="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
        <p class="font-medium">{{ props.title }} <span class="text-xs text-gray-400">(props 传入)</span></p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            当前评分(props):<span class="font-mono">{{ props.score }}</span>
        </p>
        <div class="mt-2 flex items-center gap-2">
            <button
                type="button"
                class="rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-600"
                @click="emit('rated', props.score + 1)"
            >
                emit('rated', +1)
            </button>
            <input v-model="note" placeholder="备注(v-model 通道)" class="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800" />
        </div>
    </div>
</template>
