<script setup lang="ts">
/**
 * ============================================================================
 * store 设计与模块化 — /state/store-design
 * ============================================================================
 *
 * 覆盖:按领域切 store(而不是按页面)、跨 store 组合与单向依赖、
 * $patch/$reset/$state 的批量操作,以及「什么不该进 store」。
 *
 * @module topics/state/store-design
 */

import { useCounterStore } from '@/stores/counter';
import { useWorkspaceStore } from '@/stores/workspace';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const counter = useCounterStore();
const workspace = useWorkspaceStore();

const batchUpdate = () => {
    // $patch:一次提交多个字段,只触发一次订阅通知
    counter.$patch({ count: 100, step: 5 });
};
</script>

<template>
    <TopicPage path="/state/store-design">
        <TopicSection
            title="切分原则:按领域,不按页面"
            description="本站的三个演示 store:counter(计数领域)、preferences(偏好领域)、workspace(组合层)。页面会消失,领域不会——按页面切 store 会在路由调整后被迫搬家。"
        >
            <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p class="font-mono text-xs text-primary-600 dark:text-primary-400">counter</p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">count / step / 加减</p>
                </div>
                <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p class="font-mono text-xs text-primary-600 dark:text-primary-400">preferences</p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">密度 / 显示偏好 / 持久化</p>
                </div>
                <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <p class="font-mono text-xs text-primary-600 dark:text-primary-400">workspace</p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">组合上面两个,提供领域摘要</p>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="跨 store 组合:workspace.summary"
            description="store 里可以直接 use 另一个 store(setup 风格下就是函数调用)。规则只有一条:依赖方向必须单向,下层不知道上层存在。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <input
                    :value="workspace.label"
                    class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                    placeholder="工作区名称"
                    @input="workspace.rename(($event.target as HTMLInputElement).value)"
                />
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="counter.increment">
                    counter +1
                </button>
            </div>
            <p class="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                summary = 「{{ workspace.summary }}」
                <span class="text-gray-400">← 改名或 +1,摘要同时变(它读两个 store)</span>
            </p>
        </TopicSection>

        <TopicSection
            title="批量操作:$patch 与 $reset"
            description="$patch 一次改多个字段只通知一次订阅者;setup 风格 store 的 $reset 需要自己暴露一个 reset 函数(本站 counter store 已示范)。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="batchUpdate">
                    $patch({ count: 100, step: 5 })
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="counter.reset">
                    reset(自定义)
                </button>
                <span class="font-mono text-xs text-gray-500 dark:text-gray-400">count = {{ counter.count }} · step = {{ counter.step }}</span>
            </div>
        </TopicSection>

        <TopicSection title="什么不该进 store" description="store 不是垃圾桶,以下状态留在组件或组合式函数里:">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>单个组件的临时 UI 态(面板展开、hover、输入草稿)——ref 就够。</li>
                <li>可以从其他状态算出来的值——那是 getter/computed,不是 state。</li>
                <li>只在父子之间流转的数据——props/emits 或 v-model,不绕路 store。</li>
                <li>URL 能表达的状态(当前 tab、分页、筛选)——放路由,可分享可回退。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
