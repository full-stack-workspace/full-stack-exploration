<script setup lang="ts">
/**
 * ============================================================================
 * Pinia 核心 — /state/pinia-core
 * ============================================================================
 *
 * 覆盖:setup 风格 store 的三要素(ref=state、computed=getters、函数=actions)、
 * 异步 action、storeToRefs 解构实验,以及「store 实例是单例」的跨组件验证。
 *
 * @module topics/state/pinia-core
 */

import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { useCounterStore } from '@/stores/counter';

const store = useCounterStore();

/* ---- 解构实验 ---- */
// ✅ storeToRefs:只给 state/getters 建引用,actions 直接从 store 上拿
const { count, doubleCount } = storeToRefs(store);
const { increment } = store;
// ❌ 直接解构 state:断开响应式(下面的数字不会动)
const { step: brokenStep } = store;

const asyncPending = ref(false);
const runAsync = async () => {
    asyncPending.value = true;
    await store.incrementAsync(600);
    asyncPending.value = false;
};
</script>

<template>
    <TopicPage path="/state/pinia-core">
        <TopicSection
            title="setup 风格 store:没有新概念"
            description="defineStore('counter', () => { ... }) 里,ref 是 state、computed 是 getter、函数是 action。你已经在用组合式 API,store 只是它的具名单例。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-600" @click="store.step = store.step > 1 ? store.step - 1 : 1">
                    step −
                </button>
                <span class="text-xs text-gray-400">step = {{ store.step }}</span>
                <button type="button" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-600" @click="store.step++">step +</button>
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="increment">
                    increment()
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" :disabled="asyncPending" @click="runAsync">
                    {{ asyncPending ? '异步中…' : 'incrementAsync(600ms)' }}
                </button>
                <button type="button" class="text-xs text-gray-400 underline" @click="store.reset()">reset</button>
            </div>
            <div class="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs leading-loose dark:bg-gray-800">
                <p>count = {{ count }} · doubleCount(getter) = {{ doubleCount }} · isEven = {{ store.isEven }}</p>
            </div>
        </TopicSection>

        <TopicSection
            title="storeToRefs 解构实验"
            description="store 本身是个 reactive 对象——直接解构 state 会断连(同 ref vs reactive 的坑)。storeToRefs 为每个 state/getter 建立 ref,actions 保持直取。"
        >
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    storeToRefs 的 count = {{ count }}
                    <span class="text-primary-600 dark:text-primary-400">← 跟着变</span>
                </p>
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    直接解构的 step = {{ brokenStep }}
                    <span class="text-red-500">← 停在初始值 1</span>
                </p>
            </div>
        </TopicSection>

        <TopicSection
            title="单例验证:两个组件读同一个 store"
            description="本页所有面板用的是同一个 useCounterStore() 实例;切到其他页再回来,状态还在(store 生命周期跟着应用,不跟着组件)。"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400">
                当前 count = <span class="font-mono font-semibold">{{ count }}</span> ——
                记下这个数字,去别的页面逛逛再回来看。
                <RouterLink to="/state/store-design" class="ml-1 text-primary-600 underline dark:text-primary-400">去 store 设计专题 →</RouterLink>
            </p>
        </TopicSection>
    </TopicPage>
</template>
