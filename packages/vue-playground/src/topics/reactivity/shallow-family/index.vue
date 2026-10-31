<script setup lang="ts">
/**
 * ============================================================================
 * shallow 家族与性能边界 — /reactivity/shallow-family
 * ============================================================================
 *
 * 覆盖:shallowRef / shallowReactive / triggerRef 的语义,
 * 以及用 5000 行大列表实测「深响应 vs 浅响应」的初始化成本差异。
 *
 * @module topics/reactivity/shallow-family
 */

import { nextTick, onUnmounted, ref, shallowRef, triggerRef } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- shallowRef 语义实验 ---- */
const deepUser = ref({ profile: { name: '张三', tags: ['a'] } });
const shallowUser = shallowRef({ profile: { name: '张三', tags: ['a'] } });

const mutateNested = () => {
    // 嵌套修改:deep ref 会触发更新;shallowRef 不会(它只盯 .value 整体替换)
    deepUser.value.profile.tags.push(`t${deepUser.value.profile.tags.length}`);
    shallowUser.value.profile.tags.push(`t${shallowUser.value.profile.tags.length}`);
};
const forceShallow = () => {
    // triggerRef:手动通知 shallowRef 的依赖「我变了」
    triggerRef(shallowUser);
};
const replaceShallow = () => {
    // 整体替换:shallowRef 唯一自动响应的方式
    shallowUser.value = { profile: { name: '李四', tags: ['new'] } };
};

/* ---- 大列表初始化成本实测 ---- */
interface BigRow {
    id: number;
    cells: number[];
}
const buildRows = (n: number): BigRow[] =>
    Array.from({ length: n }, (_, i) => ({ id: i, cells: Array.from({ length: 8 }, (_j, c) => i * c) }));

const deepCost = ref<number | null>(null);
const shallowCost = ref<number | null>(null);
const deepRowCount = ref(0);
const bigListShown = ref<'deep' | 'shallow' | null>(null);
const bigRows = shallowRef<BigRow[]>([]);

const measureDeep = async () => {
    const t0 = performance.now();
    // ref() 对大数组做深响应:递归给 5000×9 个字段装 Proxy
    const r = ref(buildRows(5000));
    await nextTick();
    deepCost.value = Math.round(performance.now() - t0);
    deepRowCount.value = r.value.length;
};

const measureShallow = async () => {
    const t0 = performance.now();
    // shallowRef:只代理 .value 这一层,内部数据原样
    bigRows.value = buildRows(5000);
    await nextTick();
    shallowCost.value = Math.round(performance.now() - t0);
    bigListShown.value = 'shallow';
};

onUnmounted(() => {
    // 页面卸载时释放大列表引用,帮助 GC
    bigRows.value = [];
});
</script>

<template>
    <TopicPage path="/reactivity/shallow-family">
        <TopicSection
            title="shallowRef:只盯 .value 整体替换"
            description="嵌套修改两边都发生了(数据确实变了),但只有 deep ref 的视图跟着更新;shallowRef 需要 triggerRef 手动通知,或整体替换 .value。"
        >
            <div class="mb-3 flex flex-wrap gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="mutateNested">
                    嵌套 push 一个 tag
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="forceShallow">
                    triggerRef(shallowUser)
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="replaceShallow">
                    整体替换 .value
                </button>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    deep:{{ deepUser.profile.tags.join(', ') }}
                </p>
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    shallow:{{ shallowUser.profile.tags.join(', ') }}
                    <span class="text-gray-400">← 嵌套改后视图不更新,直到 triggerRef / 替换</span>
                </p>
            </div>
            <p class="mt-3 text-xs text-gray-400">
                shallowReactive 同理:只代理第一层属性,嵌套对象是原样数据。二者换的是「放弃深层追踪」→「省去深层 Proxy 成本」。
            </p>
        </TopicSection>

        <TopicSection
            title="性能实测:5000 行数据的初始化成本"
            description="分别用 ref(深响应)与 shallowRef 装 5000×9 字段的数据,测「创建 + 首次渲染」耗时。深响应要为每个嵌套对象装 Proxy,浅响应几乎免费。"
        >
            <div class="mb-3 flex flex-wrap gap-3 text-sm">
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="measureDeep">
                    用 ref 装 5000 行
                </button>
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="measureShallow">
                    用 shallowRef 装 5000 行(并渲染)
                </button>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    ref 深响应成本:<span class="text-red-500">{{ deepCost === null ? '(未测量)' : `${deepCost} ms · ${deepRowCount} 行` }}</span>
                </p>
                <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                    shallowRef 成本:<span class="text-primary-600 dark:text-primary-400">{{ shallowCost === null ? '(未测量)' : `${shallowCost} ms` }}</span>
                </p>
            </div>
            <div v-if="bigListShown" class="mt-3 max-h-40 overflow-y-auto rounded-md border border-gray-100 dark:border-gray-800">
                <p v-for="row in bigRows.slice(0, 50)" :key="row.id" class="px-3 py-0.5 font-mono text-xs text-gray-400">
                    #{{ row.id }} · {{ row.cells.join(' / ') }}
                </p>
                <p class="px-3 py-1 text-xs text-gray-400">…共 5000 行,仅渲染前 50 行(大列表渲染策略见性能分类)</p>
            </div>
        </TopicSection>

        <TopicSection title="选型清单" description="深度不是免费的——每深一层都是 Proxy 与依赖追踪的开销。">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>大列表 / 图表数据 / 编辑器文档</strong>:整体替换更新,用 shallowRef;嵌套改动场景配合 triggerRef。</li>
                <li><strong>第三方库实例</strong>(echarts、地图、编辑器):必须 shallowRef 或 markRaw——深代理会拖慢库的内部读写,甚至破坏其实例方法。</li>
                <li><strong>readonly</strong>:防修改语义(给子组件的只读数据),不是性能工具;shallowReadonly 同理只罩第一层。</li>
                <li>普通业务状态(几十个字段以内)默认 ref/reactive 即可,不要预先优化。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
