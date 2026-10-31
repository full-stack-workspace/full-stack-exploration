<script setup lang="ts">
/**
 * ============================================================================
 * 懒加载与包体积 — /performance/lazy-bundle
 * ============================================================================
 *
 * 覆盖:路由级代码分割(本站注册表的 element 懒加载)、
 * 组件级 defineAsyncComponent、第三方库按需/分包策略,
 * 以及怎么看 bundle 产物(构建输出与可视化分析)。
 *
 * @module topics/performance/lazy-bundle
 */

import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const lazySnippet = `// 本站注册表:每个专题页都是独立 chunk,访问时才加载
{
    path: '/performance/lazy-bundle',
    element: () => import('@/topics/performance/lazy-bundle/index.vue'),
}

// 组件级:重组件(图表/编辑器)拆出去,用到才加载
const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))

// 第三方库:只 import 用到的模块,让 tree-shaking 生效
import { debounce } from 'lodash-es'   // ✅
import _ from 'lodash'                 // ❌ 全量`;
</script>

<template>
    <TopicPage path="/performance/lazy-bundle">
        <TopicSection
            title="本站就是活例:注册表即分包清单"
            description="本站的每个专题页都经 element: () => import(...) 注册,构建产物中每页一个 chunk。你打开本页时,只下载了壳层 + 本页,其余 30+ 个专题一个都没加载。"
        >
            <CodeBlock lang="ts" :code="lazySnippet" />
        </TopicSection>

        <TopicSection title="包体积治理三板斧" description="">
            <ol class="list-inside list-decimal space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>先看再砍</strong>:构建时开 bundle 可视化(vite 生态用 rollup-plugin-visualizer / rolldown 分析),找到前三大块再动手;别凭感觉优化。</li>
                <li><strong>按路由拆页面,按场景拆重组件</strong>:页面级懒加载是默认值;图表/编辑器/富文本这类重组件用 defineAsyncComponent 拆到场景内。</li>
                <li><strong>盯第三方</strong>:组件库按需引入、lodash 换 lodash-es、dayjs 换 moment——第三方依赖通常是首屏 JS 的最大头。</li>
            </ol>
            <p class="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                本站待办:P0 期 Element Plus 为全量引入(主 bundle 约 1MB),后续应切 unplugin-vue-components 按需引入——这本身就是一次真实的包体积治理练习。
            </p>
        </TopicSection>

        <TopicSection title="加载时机策略" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>首屏必需</strong>:直接静态 import,进主 bundle。</li>
                <li><strong>交互后才需要</strong>(设置面板、分享弹窗):defineAsyncComponent,触发时再加载。</li>
                <li><strong>很可能需要</strong>(下一个路由):空闲时 prefetch(requestIdleCallback / link prefetch),用预测换感知速度。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
