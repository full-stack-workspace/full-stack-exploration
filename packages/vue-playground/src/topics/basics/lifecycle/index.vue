<script setup lang="ts">
/**
 * ============================================================================
 * 生命周期 — /basics/lifecycle
 * ============================================================================
 *
 * 覆盖:组合式 API 下的生命周期钩子执行顺序(挂载/更新/卸载三幕)、
 * 钩子的真实用途(DOM 就绪、副作用注册与清理),
 * 以及「为什么组合式函数让生命周期不再是大杂烩」。
 *
 * @module topics/basics/lifecycle
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import LifecycleProbe from './LifecycleProbe.vue';

/* ---- 钩子时间线实验 ---- */
const alive = ref(true);
const tick = ref(0);
const timeline = ref<string[]>([]);

const onHook = (name: string) => {
    timeline.value.push(`${new Date().toLocaleTimeString()}.${String(Date.now() % 1000).padStart(3, '0')} ${name}`);
};
const clearTimeline = () => (timeline.value = []);
</script>

<template>
    <TopicPage path="/basics/lifecycle">
        <TopicSection
            title="钩子时间线实验"
            description="探针组件在六个关键钩子里上报事件。操作:改 tick 观察 onBeforeUpdate → onUpdated;卸载观察 onBeforeUnmount → onUnmounted。"
        >
            <div class="mb-3 flex flex-wrap items-center gap-3 text-sm">
                <button
                    type="button"
                    class="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
                    @click="alive = !alive"
                >
                    {{ alive ? '卸载探针' : '重新挂载探针' }}
                </button>
                <button
                    type="button"
                    class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600"
                    :disabled="!alive"
                    @click="tick++"
                >
                    改 prop(tick = {{ tick }})
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-400 dark:border-gray-600" @click="clearTimeline">
                    清空时间线
                </button>
            </div>
            <LifecycleProbe v-if="alive" :tick="tick" @hook="onHook" />
            <div class="mt-3 grid max-h-48 grid-cols-1 gap-0.5 overflow-y-auto rounded-md bg-gray-50 p-3 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <p v-if="timeline.length === 0">时间线为空</p>
                <p v-for="(line, i) in timeline" :key="i">{{ line }}</p>
            </div>
        </TopicSection>

        <TopicSection
            title="三幕结构:每个钩子真正该做什么"
            description="钩子不是「放初始化的垃圾桶」,每个阶段有明确的职责边界。"
        >
            <div class="grid grid-cols-1 gap-4 text-sm leading-relaxed md:grid-cols-3">
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 font-semibold text-primary-600 dark:text-primary-400">挂载</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        <code>onBeforeMount</code> 时 DOM 还不存在;<code>onMounted</code> 是 DOM 就绪点——测量尺寸、初始化第三方 DOM 库(echarts、地图)都在这里。数据请求放 setup 顶层(或 onMounted,无本质差别),不必等 DOM。
                    </p>
                </div>
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 font-semibold text-primary-600 dark:text-primary-400">更新</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        <code>onBeforeUpdate</code> 可读更新前的 DOM 快照;<code>onUpdated</code> 可读新 DOM。注意:在 onUpdated 里改状态会再次触发更新,必须加终止条件,否则死循环。
                    </p>
                </div>
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 font-semibold text-primary-600 dark:text-primary-400">卸载</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        副作用清理的最后机会:定时器、事件监听、订阅、abort 请求。漏清理 = 内存泄漏与幽灵更新。<code>watch</code>/<code>watchEffect</code> 在组件卸载时自动停止,手写监听器不会。
                    </p>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="组合式函数:把生命周期按「事」聚合,而不是按「时刻」切碎"
            description="选项式 API 让一个功能散落在 data/methods/mounted/destroyed;组合式函数把一件事的初始化和清理收进同一个函数,生命周期钩子变成组合式函数的内部实现细节。"
        >
            <CodeBlock
                lang="ts"
                :code="`// 一件完整的事:注册 + 清理,调用方一行拿走
function useEventListener(el: EventTarget, event: string, cb: EventListener) {
    onMounted(() => el.addEventListener(event, cb))
    onUnmounted(() => el.removeEventListener(event, cb))
}

// 组件里不再有 mounted/destroyed 的散点:
useEventListener(window, 'resize', onResize)`"
            />
            <p class="mt-3 text-xs leading-relaxed text-gray-400">
                更多组合式函数的设计原则与原子库见「组合式函数」分类;watch 等 API 的自动清理语义见「响应式」分类的 computed 与 watch 专题。
            </p>
        </TopicSection>
    </TopicPage>
</template>
