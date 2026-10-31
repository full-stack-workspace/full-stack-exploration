<script setup lang="ts">
/**
 * ============================================================================
 * nextTick 与批量更新 — /reactivity/next-tick
 * ============================================================================
 *
 * 覆盖:同一事件里的多次修改为什么只渲染一次(批处理)、
 * DOM 更新时机的实测(nextTick 前后读 DOM)、
 * 以及微任务队列在其中的角色。
 *
 * @module topics/reactivity/next-tick
 */

import { nextTick, ref, useTemplateRef } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 批处理实验 ---- */
const count = ref(0);
let renderCount = 0;
const renderCountRef = ref(0);

/** 更新渲染计数的钩子:模板每次重渲染时执行 */
const bumpRender = () => {
    renderCount++;
    renderCountRef.value = renderCount;
    return '';
};

const incrementThreeTimes = () => {
    // 同步连改三次:Vue 把更新合并成一个微任务,只渲染一次
    count.value++;
    count.value++;
    count.value++;
};

/* ---- nextTick 实测 ---- */
const message = ref('初始文本');
const domBefore = ref('');
const domAfter = ref('');
const msgEl = useTemplateRef<HTMLParagraphElement>('msgEl');

const measureDom = async () => {
    message.value = `更新于 ${new Date().toLocaleTimeString()}`;
    // 同一微任务内:DOM 还是旧的(更新还没 flush)
    domBefore.value = msgEl.value?.textContent ?? '';
    await nextTick();
    // nextTick 之后:DOM 已是最新
    domAfter.value = msgEl.value?.textContent ?? '';
};
</script>

<template>
    <TopicPage path="/reactivity/next-tick">
        <TopicSection
            title="批处理:连改三次,渲染一次"
            description="Vue 的组件更新是异步的:状态变更不会立刻改 DOM,而是把渲染任务推进微任务队列,同一事件循环内的所有修改合并成一次渲染。"
        >
            {{ bumpRender() }}
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="incrementThreeTimes">
                    同步 count++ × 3
                </button>
                <div class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    <p>count = {{ count }}</p>
                    <p>
                        本组件实际渲染 {{ renderCountRef }} 次
                        <span class="text-gray-400">← 点一次按钮,count 变了 3 但渲染只 +1</span>
                    </p>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="nextTick 实测:改完状态,DOM 什么时候变?"
            description="点击按钮:修改 message 后立即读 DOM(还是旧文本),await nextTick() 之后再读(已是新文本)。「改了状态但 DOM 没变」不是 bug,是时机。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <p ref="msgEl" class="rounded-md bg-primary-50 px-3 py-2 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                    {{ message }}
                </p>
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="measureDom">
                    改 message 并测量
                </button>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    <span class="text-red-500">nextTick 前读 DOM:</span>{{ domBefore || '(未测量)' }}
                </p>
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    <span class="text-primary-600 dark:text-primary-400">nextTick 后读 DOM:</span>{{ domAfter || '(未测量)' }}
                </p>
            </div>
        </TopicSection>

        <TopicSection
            title="什么时候真的需要 nextTick"
            description="绝大多数场景不需要——它只在「必须读到更新后的 DOM」时出现。"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>改完条件渲染后要操作新出现的元素(聚焦输入框、滚动到新消息)。</li>
                <li>改完数据后要测量新布局(高度、位置),再接第三方库操作。</li>
                <li>微任务链上的协作:确保某段代码跑在所有组件更新之后。</li>
            </ul>
            <p class="mt-3 text-xs leading-relaxed text-gray-400">
                反例:把 nextTick 当「等等再说」的万能延迟。如果逻辑依赖的是数据而不是 DOM,用 watch(computed 也行)声明依赖关系,而不是赌时序。
                watch 的 flush: 'post' 选项本质就是「等 DOM 更新后再跑回调」,语义比手写 nextTick 更清晰。
            </p>
        </TopicSection>
    </TopicPage>
</template>
