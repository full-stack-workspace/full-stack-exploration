<script setup lang="ts">
/**
 * ============================================================================
 * 大列表与虚拟滚动 — /performance/virtual-list
 * ============================================================================
 *
 * 手写一个迷你虚拟列表(约 40 行):只渲染视口内 + 缓冲的行,
 * 10000 行数据的滚动如丝般顺滑。对照「全量渲染」的 DOM 数量差异。
 *
 * @module topics/performance/virtual-list
 */

import { computed, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 数据 ---- */
const ROW_HEIGHT = 32;
const VIEWPORT_HEIGHT = 288; // 9 行可视
const BUFFER = 3;
const TOTAL = 10000;

const rows = Array.from({ length: TOTAL }, (_, i) => ({
    id: i,
    text: `第 ${i + 1} 行 · 内容摘要 ${Math.random().toString(36).slice(2, 8)}`,
}));

/* ---- 虚拟滚动核心:滚动位置 → 起止索引 ---- */
const scrollTop = ref(0);
const onScroll = (e: Event) => {
    scrollTop.value = (e.target as HTMLElement).scrollTop;
};

const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER));
const endIndex = computed(() =>
    Math.min(TOTAL, Math.ceil((scrollTop.value + VIEWPORT_HEIGHT) / ROW_HEIGHT) + BUFFER),
);
const visibleRows = computed(() => rows.slice(startIndex.value, endIndex.value));
/** 占位:可视区上方被跳过的高度 */
const offsetTop = computed(() => startIndex.value * ROW_HEIGHT);
/** 总高度占位,撑出真实的滚动条 */
const totalHeight = TOTAL * ROW_HEIGHT;

/* ---- DOM 数量对照 ---- */
const domCount = computed(() => visibleRows.value.length);
</script>

<template>
    <TopicPage path="/performance/virtual-list">
        <TopicSection
            title="迷你虚拟列表(10000 行)"
            description="滚动试试:无论滚到哪里,DOM 里始终只有可视区 + 缓冲的十几行。原理:总高度占位撑起滚动条,只渲染 [startIndex, endIndex) 区间。"
        >
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div
                    class="overflow-y-auto rounded-md border border-gray-200 md:col-span-2 dark:border-gray-700"
                    :style="{ height: `${VIEWPORT_HEIGHT}px` }"
                    @scroll="onScroll"
                >
                    <!-- 总高度占位 -->
                    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
                        <!-- 可视窗口:按 offset 定位 -->
                        <div :style="{ transform: `translateY(${offsetTop}px)` }">
                            <div
                                v-for="row in visibleRows"
                                :key="row.id"
                                class="flex items-center border-b border-gray-50 px-3 font-mono text-xs text-gray-600 dark:border-gray-800/60 dark:text-gray-300"
                                :style="{ height: `${ROW_HEIGHT}px` }"
                            >
                                {{ row.text }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <p class="rounded-md bg-gray-50 p-3 font-mono leading-loose dark:bg-gray-800">
                        总行数:{{ TOTAL }}<br />
                        实际 DOM 行数:<span class="text-primary-600 dark:text-primary-400">{{ domCount }}</span><br />
                        渲染区间:[{{ startIndex }}, {{ endIndex }})<br />
                        滚动位置:{{ Math.round(scrollTop) }}px
                    </p>
                    <p class="leading-relaxed">
                        全量渲染会挂 10000 个节点(首帧数百毫秒、内存常驻);
                        虚拟列表把 DOM 数量压到与数据量无关的常数级。
                    </p>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="生产使用清单" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>行高固定 → 本页的索引计算就够;行高动态 → 用 vue-virtual-scroller 等库(预估 + 实测修正)。</li>
                <li>虚拟列表解决「DOM 数量」;如果瓶颈是「数据本身的深响应」,叠加 shallowRef(见 shallow 家族专题)。</li>
                <li>行内不要放重型组件(图表/编辑器),虚拟滚动省的是节点数,省不了节点内部的初始化成本。</li>
                <li>key 用数据 id:滚动区间变化时节点被复用,key 不稳会串行内状态。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
