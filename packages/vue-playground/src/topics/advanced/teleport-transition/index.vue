<script setup lang="ts">
/**
 * ============================================================================
 * Teleport 与 Transition — /advanced/teleport-transition
 * ============================================================================
 *
 * 覆盖:Teleport 把弹层挂到 body(逃离层叠与 overflow 裁剪)、
 * Transition 的单元素进入/离开、TransitionGroup 的列表移动动画,
 * 以及 CSS 类名钩子与 JavaScript 钩子的分工。
 *
 * @module topics/advanced/teleport-transition
 */

import { ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- Teleport:模态框 ---- */
const modalOpen = ref(false);

/* ---- Transition:单元素 ---- */
const boxVisible = ref(true);

/* ---- TransitionGroup:列表 ---- */
let nextId = 6;
const items = ref([1, 2, 3, 4, 5]);
const addItem = () => items.value.splice(Math.floor(Math.random() * (items.value.length + 1)), 0, nextId++);
const removeItem = () => items.value.splice(Math.floor(Math.random() * items.value.length), 1);
const shuffleItems = () => (items.value = [...items.value].sort(() => Math.random() - 0.5));
</script>

<template>
    <TopicPage path="/advanced/teleport-transition">
        <TopicSection
            title="Teleport:把弹层挂到 body"
            description="模态框在 DOM 上逃离了本卡片的层叠上下文(z-index/overflow 再也困不住它),但逻辑上仍是本组件的子节点——props、事件、响应式全部照常。"
        >
            <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700" @click="modalOpen = true">
                打开模态框(Teleport 到 body)
            </button>
            <Teleport to="body">
                <div
                    v-if="modalOpen"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    @click.self="modalOpen = false"
                >
                    <div class="w-80 rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900">
                        <h3 class="text-sm font-semibold">Teleport 模态框</h3>
                        <p class="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            这段 DOM 实际挂在 body 下,但组件树里仍是专题页的子节点。点遮罩关闭。
                        </p>
                        <button type="button" class="mt-4 w-full rounded-md bg-primary-600 py-1.5 text-sm text-white" @click="modalOpen = false">
                            关闭
                        </button>
                    </div>
                </div>
            </Teleport>
        </TopicSection>

        <TopicSection
            title="Transition:单元素进入/离开"
            description="Vue 在插入/移除时自动套用 v-enter-*/v-leave-* 类名序列。下方盒子的淡入位移动画全部由四个 CSS 类描述。"
        >
            <div class="flex items-center gap-4">
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600" @click="boxVisible = !boxVisible">
                    切换盒子
                </button>
                <Transition name="fade-slide">
                    <span v-if="boxVisible" class="inline-block rounded-md bg-primary-500 px-4 py-2 text-sm text-white">我在过渡中</span>
                </Transition>
            </div>
        </TopicSection>

        <TopicSection
            title="TransitionGroup:列表的移动动画"
            description="列表增删/重排时,Vue 用 FLIP 技术自动补间位置变化(v-move 类)。加、删、打乱各点几次,观察卡片滑动而不是瞬移。"
        >
            <div class="mb-3 flex gap-2 text-sm">
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="addItem">随机插入</button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="removeItem">随机删除</button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="shuffleItems">打乱</button>
            </div>
            <TransitionGroup name="list" tag="div" class="flex flex-wrap gap-2">
                <span
                    v-for="n in items"
                    :key="n"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-100 font-mono text-sm text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                >
                    {{ n }}
                </span>
            </TransitionGroup>
        </TopicSection>

        <TopicSection title="何时用哪个" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>Teleport</strong>:模态框、抽屉、Toast、气泡卡片——任何「逻辑属于这里、视觉属于全局」的浮层。</li>
                <li><strong>Transition</strong>:单个元素/组件的进入离开;需要更细控制(进度、取消)时换 JS 钩子或 Web Animations API。</li>
                <li><strong>TransitionGroup</strong>:列表项的增删与重排;key 必须稳定(否则 FLIP 失效)。</li>
                <li>尊重 prefers-reduced-motion:生产里应给动画加媒体查询降级。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>

<style scoped>
/* Transition 类名钩子:fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(8px);
}

/* TransitionGroup:增删过渡 + 移动补间 */
.list-enter-active,
.list-leave-active {
    transition: all 0.25s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: scale(0.6);
}
.list-move {
    transition: transform 0.25s ease;
}
.list-leave-active {
    position: absolute;
}
</style>
