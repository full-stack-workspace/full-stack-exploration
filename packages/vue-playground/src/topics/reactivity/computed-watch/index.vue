<script setup lang="ts">
/**
 * ============================================================================
 * computed 与 watch — /reactivity/computed-watch
 * ============================================================================
 *
 * 覆盖:computed 的缓存与惰性求值(对照 method)、可写 computed、
 * watch 的显式依赖/新旧值/deep、watchEffect 的自动追踪,
 * 最后给「三选一」决策矩阵。
 *
 * @module topics/reactivity/computed-watch
 */

import { computed, reactive, ref, watch, watchEffect } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- computed 缓存实验 ---- */
const base = ref(10);
let computedRuns = 0;
let methodRuns = 0;
const doubled = computed(() => {
    computedRuns++;
    return base.value * 2;
});
const doubledByMethod = () => {
    methodRuns++;
    return base.value * 2;
};
// 强制重渲染的无关状态,用来观察 computed 不重算而 method 会重跑
const unrelated = ref(0);

/* ---- 可写 computed ---- */
const firstName = ref('张');
const lastName = ref('三');
const fullName = computed({
    get: () => firstName.value + lastName.value,
    set: (v) => {
        firstName.value = v.slice(0, 1);
        lastName.value = v.slice(1);
    },
});

/* ---- watch 实验 ---- */
const keyword = ref('');
const watchLog = ref<string[]>([]);
watch(keyword, (next, prev) => {
    watchLog.value.unshift(`watch: "${prev}" → "${next}"`);
});
// deep watch:监听嵌套对象
const draft = reactive({ title: '', meta: { tags: [] as string[] } });
watch(
    () => draft.meta.tags,
    (tags) => watchLog.value.unshift(`watch(deep getter): tags = ${JSON.stringify(tags)}`),
    { deep: true },
);

/* ---- watchEffect 实验 ---- */
const effectLog = ref<string[]>([]);
watchEffect(() => {
    // 自动追踪:读到谁就依赖谁;keyword 变了这里就重跑
    effectLog.value.unshift(`watchEffect 执行,读到 keyword = "${keyword.value}"`);
});
const addTag = () => {
    draft.meta.tags.push(`tag-${draft.meta.tags.length + 1}`);
};
</script>

<template>
    <TopicPage path="/reactivity/computed-watch">
        <TopicSection
            title="computed 的缓存:和方法差在哪"
            description="点「重渲染」只改无关状态:computed 因为依赖没变而直接命中缓存,method 每次渲染都重跑。列表过滤、汇总金额这类「同输入反复读」的派生值,必须用 computed。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="base++">
                    base +1(当前 {{ base }})
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="unrelated++">
                    只触发重渲染(unrelated = {{ unrelated }})
                </button>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    computed:{{ doubled }} · 实际计算 {{ computedRuns }} 次
                </p>
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    method:{{ doubledByMethod() }} · 实际计算 {{ methodRuns }} 次
                </p>
            </div>
            <p class="mt-3 text-xs text-gray-400">
                注意模板上方的计数差异:每点一次「重渲染」,method 次数 +1 而 computed 不动——渲染几次 method 就跑几次,computed 只在依赖变化时重算。
            </p>
        </TopicSection>

        <TopicSection
            title="可写 computed:派生值也能反向写回"
            description="给 computed 传 { get, set },「编辑全名 → 拆回姓和名」这类双向派生就不用写 watcher 同步两份状态。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <label class="flex items-center gap-2">
                    姓 <input v-model="firstName" class="w-20 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800" />
                </label>
                <label class="flex items-center gap-2">
                    名 <input v-model="lastName" class="w-20 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800" />
                </label>
                <label class="flex items-center gap-2">
                    全名(可写 computed)
                    <input v-model="fullName" class="w-24 rounded-md border border-primary-300 px-2 py-1 dark:border-primary-700 dark:bg-gray-800" />
                </label>
            </div>
        </TopicSection>

        <TopicSection
            title="watch vs watchEffect:显式依赖 vs 自动追踪"
            description="watch 要点名监听谁、拿得到新旧值、配 deep;watchEffect 读到谁就追谁,立即执行一次。改 keyword 时两者都会记录;加 tag 时只有 deep watch 记录。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <input v-model="keyword" placeholder="输入触发两个 watcher" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="addTag">
                    加 tag(触发 deep watch)
                </button>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="max-h-36 overflow-y-auto rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <p class="font-semibold text-gray-600 dark:text-gray-300">watch 日志</p>
                    <p v-for="(l, i) in watchLog" :key="i">{{ l }}</p>
                </div>
                <div class="max-h-36 overflow-y-auto rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <p class="font-semibold text-gray-600 dark:text-gray-300">watchEffect 日志</p>
                    <p v-for="(l, i) in effectLog.slice(0, 8)" :key="i">{{ l }}</p>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="三选一决策矩阵" description="不要凭手感选,按「你要的是什么」选。">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                            <th class="py-2 pr-4 font-medium">你要什么</th>
                            <th class="py-2 pr-4 font-medium">选谁</th>
                            <th class="py-2 font-medium">理由</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 dark:text-gray-300">
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">一个由其他状态算出来的值</td>
                            <td class="py-2 pr-4 font-mono text-xs">computed</td>
                            <td class="py-2">有缓存、可在模板/其他 computed 里当普通值用;无缓存需求时才考虑 method</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">值变化后要做事(请求/写存储/手动操作 DOM)</td>
                            <td class="py-2 pr-4 font-mono text-xs">watch</td>
                            <td class="py-2">需要新旧值对比、精确指定源、控制 deep/flush 时机</td>
                        </tr>
                        <tr>
                            <td class="py-2 pr-4">「用到谁就追谁」的同步副作用</td>
                            <td class="py-2 pr-4 font-mono text-xs">watchEffect</td>
                            <td class="py-2">依赖集合动态变化(如随着条件读不同的 ref);立即执行一次适合初始化同步</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="mt-3 text-xs leading-relaxed text-gray-400">
                红线:能用 computed 表达的派生关系,不要写 watch 手动同步两份状态——那是「状态复制」,是数据不一致的温床。
            </p>
        </TopicSection>
    </TopicPage>
</template>
