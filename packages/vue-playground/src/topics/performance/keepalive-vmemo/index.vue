<script setup lang="ts">
/**
 * ============================================================================
 * keep-alive 与 v-memo — /performance/keepalive-vmemo
 * ============================================================================
 *
 * 覆盖:keep-alive 的缓存与 activated/deactivated 生命周期(Tab 切换保活实验)、
 * v-memo 的按依赖跳过子树更新(与 React memo 的异同)。
 *
 * @module topics/performance/keepalive-vmemo
 */

import { computed, onActivated, onDeactivated, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- keep-alive 实验:Tab 切换保活 ---- */
const activeTab = ref<'form' | 'list'>('form');
const formDraft = ref({ title: '', remark: '' });
const lifecycleLog = ref<string[]>([]);
onActivated(() => lifecycleLog.value.unshift('onActivated:本页被激活'));
onDeactivated(() => lifecycleLog.value.unshift('onDeactivated:本页被缓存(组件未销毁)'));

/* ---- v-memo 实验 ---- */
const expensiveTick = ref(0);
const unrelatedCount = ref(0);
let computeRuns = 0;
const computeRunsRef = ref(0);
// 模拟昂贵渲染:只有 tick 变化才应重算
/* eslint-disable vue/no-side-effects-in-computed-properties -- 教学演示:计数器副作用正是观测「是否重算」的手段 */
const expensiveView = computed(() => {
    computeRuns++;
    computeRunsRef.value = computeRuns;
    return `昂贵片段基于 tick=${expensiveTick.value}`;
});
/* eslint-enable vue/no-side-effects-in-computed-properties */
</script>

<template>
    <TopicPage path="/performance/keepalive-vmemo">
        <TopicSection
            title="keep-alive:切走不销毁,切回不重来"
            description="下方 Tab 用 keep-alive 缓存:在「表单」里写点字,切到「列表」再切回——草稿原样保留。日志面板显示 activated/deactivated 钩子。"
        >
            <div class="mb-3 flex gap-2 text-sm">
                <button
                    v-for="t in ['form', 'list']"
                    :key="t"
                    type="button"
                    class="rounded-md border px-3 py-1.5"
                    :class="
                        activeTab === t
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-600'
                    "
                    @click="activeTab = t as 'form' | 'list'"
                >
                    {{ t === 'form' ? '表单' : '列表' }}
                </button>
            </div>
            <KeepAlive>
                <div v-if="activeTab === 'form'" key="form" class="space-y-2 rounded-md border border-gray-200 p-4 dark:border-gray-700">
                    <input v-model="formDraft.title" placeholder="标题(切 Tab 后回来还在)" class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    <textarea v-model="formDraft.remark" rows="2" placeholder="备注" class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div v-else key="list" class="rounded-md border border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    列表视图(静态占位)。真正的收益:重列表/重表单页切回不重建。
                </div>
            </KeepAlive>
            <div class="mt-3 rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <p v-if="lifecycleLog.length === 0">生命周期日志(切换 Tab 观察)</p>
                <p v-for="(l, i) in lifecycleLog" :key="i">{{ l }}</p>
            </div>
            <p class="mt-2 text-xs text-gray-400">
                路由级用法:&lt;RouterView&gt; 外套 &lt;KeepAlive :include="['PageName']"&gt;;include/exclude 按组件 name 匹配。
            </p>
        </TopicSection>

        <TopicSection
            title="v-memo:按依赖跳过子树"
            description="v-memo=[deps] 表示「deps 没变就整块复用上次渲染」。与 React memo 的差异:v-memo 是模板里显式的、按你列的依赖;React memo 是组件级的、浅比较全部 props。"
        >
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="expensiveTick++">
                    tick +1(依赖变了)
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="unrelatedCount++">
                    无关更新({{ unrelatedCount }})
                </button>
            </div>
            <!-- v-memo:unrelatedCount 变化时,这块不重算 -->
            <div v-memo="[expensiveTick]" class="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                {{ expensiveView }} · 计算次数:{{ computeRunsRef }}
            </div>
            <p class="mt-2 text-xs text-gray-400">
                点「无关更新」:页面重渲染但计算次数不动(v-memo 命中);点「tick +1」才重算。
                注意 v-memo 是「最后的微调工具」——先把状态放对位置、拆对组件,再考虑它。
            </p>
        </TopicSection>
    </TopicPage>
</template>
