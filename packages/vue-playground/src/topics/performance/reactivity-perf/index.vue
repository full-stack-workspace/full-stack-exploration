<script setup lang="ts">
/**
 * ============================================================================
 * 响应式性能边界 — /performance/reactivity-perf
 * ============================================================================
 *
 * 响应式系统不是免费的:深度代理、deep watch、巨型 computed 都有成本。
 * 本页给出「成本来源地图」与对应的减压手段,并链接到 shallow 家族的实测。
 *
 * @module topics/performance/reactivity-perf
 */

import { computed, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 过滤大列表的两种写法实测 ---- */
const listSize = 5000;
const bigList = ref(Array.from({ length: listSize }, (_, i) => ({ id: i, name: `item-${i}`, active: i % 2 === 0 })));
const onlyActive = ref(true);
const filterCost = ref<number | null>(null);

const filtered = computed(() => (onlyActive.value ? bigList.value.filter((i) => i.active) : bigList.value));

const measureFilter = () => {
    const t0 = performance.now();
    // 读 computed:全量过滤 5000 项
    const _len = filtered.value.length;
    filterCost.value = Math.round((performance.now() - t0) * 100) / 100;
    return _len;
};
</script>

<template>
    <TopicPage path="/performance/reactivity-perf">
        <TopicSection
            title="成本来源地图"
            description="响应式的每一环都有价格标签,按「最常见的账单」排序:"
        >
            <div class="overflow-x-auto">
                <table class="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                            <th class="py-2 pr-4 font-medium">成本来源</th>
                            <th class="py-2 pr-4 font-medium">什么时候疼</th>
                            <th class="py-2 font-medium">减压手段</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 dark:text-gray-300">
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">深响应代理</td>
                            <td class="py-2 pr-4">大数组/大对象初始化(几千+ 字段)</td>
                            <td class="py-2 font-mono text-xs">shallowRef + 整体替换 / markRaw</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">deep watch</td>
                            <td class="py-2 pr-4">监听大对象,每次变更都全树遍历</td>
                            <td class="py-2 font-mono text-xs">改为 watch 具体路径(getter)</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">巨型 computed</td>
                            <td class="py-2 pr-4">依赖一变就全量重算(过滤/排序大列表)</td>
                            <td class="py-2 font-mono text-xs">拆分 computed / 预聚合 / 分页</td>
                        </tr>
                        <tr>
                            <td class="py-2 pr-4">effect 数量爆炸</td>
                            <td class="py-2 pr-4">万级组件各自挂 watch/computed</td>
                            <td class="py-2 font-mono text-xs">虚拟列表先减组件数,再谈响应式优化</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </TopicSection>

        <TopicSection
            title="实测:5000 项的 computed 过滤"
            description="切换开关触发 computed 重算,下方显示本次重算的耗时。感受「依赖一变就全量重算」的规模成本。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <label class="flex items-center gap-2">
                    <input v-model="onlyActive" type="checkbox" class="accent-primary-600" />
                    只看 active({{ filtered.length }} / {{ listSize }} 项)
                </label>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="measureFilter">
                    手动测一次重算耗时
                </button>
                <span v-if="filterCost !== null" class="font-mono text-xs text-gray-500 dark:text-gray-400">
                    本次过滤耗时:{{ filterCost }} ms
                </span>
            </div>
            <p class="mt-2 text-xs text-gray-400">
                5000 项的 filter 在现代机器上通常不到 1ms——所以「巨型 computed」的减压前提是先测量;
                真正疼的是 10万+ 或重算链路里套了 DOM/请求。
            </p>
        </TopicSection>

        <TopicSection title="原则:先测量,再优化;先减 DOM,再减追踪" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>性能问题的排序:DOM 数量 &gt; 第三方库 &gt; 响应式追踪。虚拟列表通常比 shallowRef 收益大一个量级。</li>
                <li>shallowRef 的实测对照见 <RouterLink to="/reactivity/shallow-family" class="text-primary-600 underline dark:text-primary-400">shallow 家族</RouterLink>(深/浅初始化成本)。</li>
                <li>Profiling 工具:Performance 面板看长任务,vue devtools 的 Timeline 看组件渲染次数——先找到最贵的组件再动手。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
