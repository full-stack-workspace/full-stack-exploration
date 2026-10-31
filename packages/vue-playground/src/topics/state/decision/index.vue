<script setup lang="ts">
/**
 * ============================================================================
 * 状态通道决策 — /state/decision
 * ============================================================================
 *
 * provide/inject vs Pinia 的决策框架:从「状态归谁、活多久、跨多远」三问出发。
 * Vuex 只在此页作为历史背景提及(已进入维护期,新项目一律 Pinia)。
 *
 * @module topics/state/decision
 */

import { computed, inject, provide, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- provide/inject 演示:本页内的「局部通道」 ---- */
const channelKeyword = ref('provide 通道的消息');
provide('demo-channel', channelKeyword);
const injected = inject<{ value: string }>('demo-channel')!;
const echo = computed(() => `inject 读到:${injected.value}`);

/* ---- 四问决策 ---- */
const answers = ref({ scope: '', lifetime: '', distance: '', devtools: '' });
const verdict = computed(() => {
    const a = answers.value;
    if (!a.scope || !a.lifetime || !a.distance) return null;
    if (a.scope === 'app' || a.devtools === 'yes') return 'Pinia';
    if (a.distance === 'subtree' && a.lifetime === 'session') return 'provide/inject';
    if (a.distance === 'parent-child') return 'props / emits / v-model';
    return '组件内 ref';
});
</script>

<template>
    <TopicPage path="/state/decision">
        <TopicSection
            title="四问决策:通道梯子"
            description="先回答问题,再选通道。梯子从下往上爬:能用下面的就不用上面的。"
        >
            <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <label class="flex items-center gap-2">
                    ① 状态归谁?
                    <select v-model="answers.scope" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="">选择…</option>
                        <option value="component">单个组件</option>
                        <option value="feature">一个功能域</option>
                        <option value="app">整个应用</option>
                    </select>
                </label>
                <label class="flex items-center gap-2">
                    ② 活多久?
                    <select v-model="answers.lifetime" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="">选择…</option>
                        <option value="view">随视图生灭</option>
                        <option value="session">整个会话</option>
                        <option value="persist">要持久化</option>
                    </select>
                </label>
                <label class="flex items-center gap-2">
                    ③ 跨多远?
                    <select v-model="answers.distance" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="">选择…</option>
                        <option value="parent-child">父子之间</option>
                        <option value="subtree">一棵子树</option>
                        <option value="anywhere">任意组件</option>
                    </select>
                </label>
                <label class="flex items-center gap-2">
                    ④ 需要调试与追踪?
                    <select v-model="answers.devtools" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="">选择…</option>
                        <option value="no">不需要</option>
                        <option value="yes">需要 devtools / 变更追踪</option>
                    </select>
                </label>
            </div>
            <p class="mt-3 rounded-md bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {{ verdict ? `推荐通道:${verdict}` : '回答前三个问题后给出推荐' }}
            </p>
        </TopicSection>

        <TopicSection
            title="provide/inject:子树级通道"
            description="下方输入框的值经 provide 提供,由 inject 端实时读出。它解决「跨多层传递」,但范围仅限当前子树,且没有 devtools 与变更记录。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <input v-model="channelKeyword" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                <span class="rounded-md bg-gray-50 px-3 py-1.5 font-mono text-xs dark:bg-gray-800">{{ echo }}</span>
            </div>
            <p class="mt-2 text-xs text-gray-400">
                适用:组件库的局部上下文(表单/表格/主题)、插件内部通道。不适用:应用级业务状态。
            </p>
        </TopicSection>

        <TopicSection title="Vuex 的历史定位" description="只作背景提及,不做演示。">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Vuex 已进入维护期(官方不再加新特性),Pinia 是 Vue 官方状态库:更小的 API 面(没有 mutations)、
                完整的 TS 推断、模块化即「多个 store」而非「单 store 多模块」。新项目一律 Pinia;
                老项目迁移路径是「新功能用 Pinia,Vuex 模块按需平移」。
            </p>
        </TopicSection>
    </TopicPage>
</template>
