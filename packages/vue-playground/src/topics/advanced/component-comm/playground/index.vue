<script setup lang="ts">
/**
 * ============================================================================
 * 组件通信 · 模式演练 — /advanced/component-comm-playground
 * ============================================================================
 *
 * 同一份数据走五种通道的对照演练:props/emits、v-model、
 * provide/inject、URL query、Pinia。看每种通道的接线方式与适用信号。
 *
 * @module topics/advanced/component-comm/playground
 */

import { provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { useCounterStore } from '@/stores/counter';
import CommChild from '../CommChild.vue';
import InjectLeaf from '../InjectLeaf.vue';
import { COMM_NAV } from '../nav';

/* ---- props / emits / v-model ---- */
const score = ref(3);
const note = ref('');
const onRated = (s: number) => (score.value = s);

/* ---- provide/inject ---- */
const themeColor = ref('#42b883');
provide('comm-theme-color', themeColor);

/* ---- URL query 通道 ---- */
const route = useRoute();
const router = useRouter();
const setQueryTab = (tab: string) => {
    // 筛选态写进 URL:刷新不丢、链接可分享
    router.replace({ query: { ...route.query, tab } });
};

/* ---- Pinia 通道 ---- */
const counter = useCounterStore();
</script>

<template>
    <TopicPage path="/advanced/component-comm-playground">
        <TopicNav category="advanced" :links="COMM_NAV" />

        <TopicSection
            title="通道一~三:props 下传 / emits 上报 / v-model 双向"
            description="子组件 CommChild 同时接三条通道:score 是 props(只读),+1 按钮 emit 上报,备注框是 v-model 双向。"
        >
            <CommChild v-model:note="note" title="演示卡片" :score="score" @rated="onRated" />
            <p class="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                父级视角:score = {{ score }} · note = {{ note || '(空)' }}
            </p>
        </TopicSection>

        <TopicSection
            title="通道四:provide/inject 跨层"
            description="InjectLeaf 不接收任何 props,颜色直接 inject 自本组件 provide 的 ref。改色即全家生效,中间层零接线。"
        >
            <div class="flex flex-wrap items-center gap-4">
                <input v-model="themeColor" type="color" class="h-9 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600" aria-label="子树主题色" />
                <InjectLeaf />
            </div>
        </TopicSection>

        <TopicSection
            title="通道五:URL query"
            description="筛选状态写进地址栏。切换 tab 后复制当前链接到新窗口打开,状态原样——这是 store 给不了的能力。"
        >
            <div class="flex flex-wrap items-center gap-2 text-sm">
                <button
                    v-for="tab in ['全部', '进行中', '已完成']"
                    :key="tab"
                    type="button"
                    class="rounded-md border px-3 py-1.5"
                    :class="
                        (route.query.tab ?? '全部') === tab
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-600'
                    "
                    @click="setQueryTab(tab)"
                >
                    {{ tab }}
                </button>
                <span class="ml-2 font-mono text-xs text-gray-400">?tab={{ route.query.tab ?? '(默认)' }}</span>
            </div>
        </TopicSection>

        <TopicSection
            title="通道六:Pinia"
            description="这里改的 count,与状态管理分类各页读到的是同一个实例——跨路由共享,不需要任何接线。"
        >
            <div class="flex items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="counter.increment">
                    counter +1
                </button>
                <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                    count = {{ counter.count }} · 去<RouterLink to="/state/pinia-core" class="text-primary-600 underline dark:text-primary-400">Pinia 核心</RouterLink>验证同一份状态
                </span>
            </div>
        </TopicSection>
    </TopicPage>
</template>
