<script setup lang="ts">
/**
 * ============================================================================
 * 组合式函数深入梳理 — /composables/guide
 * ============================================================================
 *
 * 设计原则:什么该抽成 composable、命名与参数返回值约定、
 * 自动清理红利,以及和 mixins / 工具函数 / Pinia 的边界。
 *
 * @module topics/composables/guide
 */

import CodeBlock from '@/components/CodeBlock.vue';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { COMPOSABLES_NAV } from '../nav';

const anatomySnippet = `// 一个组合式函数的解剖:输入响应式、返回值 ref、副作用自带清理
export function useEventListener(target, event, cb) {
    onMounted(() => unref(target)?.addEventListener(event, cb))
    onUnmounted(() => unref(target)?.removeEventListener(event, cb))
}

// 调用方:一行拿走,没有清理负担
useEventListener(window, 'resize', onResize)`;
</script>

<template>
    <TopicPage path="/composables/guide">
        <TopicNav category="composables" :links="COMPOSABLES_NAV" />

        <TopicSection
            title="什么时候该抽 composable"
            description="不是为了「复用率」抽,而是为了「认知边界」抽。四个信号满足两个以上就值得抽:"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>跨组件复用</strong>:同一段响应式逻辑出现在第二个组件里(防抖、监听、请求)。</li>
                <li><strong>setup 超重</strong>:一个组件的 setup 超过一屏,按「事」切成 composable,主 setup 只剩编排。</li>
                <li><strong>生命周期纠缠</strong>:逻辑里出现 onMounted/onUnmounted 配对(定时器、监听、订阅)——这是泄漏重灾区,封进 composable 就把清理变成内部责任。</li>
                <li><strong>需要单测</strong>:响应式逻辑抽出来才能脱离组件做契约测试(见原子演练页的测试示范)。</li>
            </ul>
        </TopicSection>

        <TopicSection title="解剖一个 composable" description="三个要素:输入接受 ref(灵活)、输出返回 ref(保持响应)、副作用自带清理。">
            <CodeBlock lang="ts" :code="anatomySnippet" />
        </TopicSection>

        <TopicSection title="命名与签名约定" description="本站 lib/ 的 8 个原子函数共同遵守的约定:">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>命名</strong>:use + 名词,描述「它是什么」而不是「它做什么」(useCounter 而非 useCounting)。</li>
                <li><strong>参数</strong>:接受 MaybeRef——普通值和 ref 都能传(unref 归一),调用方不用关心形式。</li>
                <li><strong>返回值</strong>:返回 ref 而非 reactive 对象,调用方解构安全(见响应式分类的 ref vs reactive)。状态多时用对象返回({ count, inc }),只有一两个时用元组([state, toggle])。</li>
                <li><strong>清理</strong>:所有副作用(定时器/监听/订阅/请求)在 onUnmounted 自动清理,不允许把清理义务推给调用方。</li>
            </ul>
        </TopicSection>

        <TopicSection
            title="边界:composable vs mixins vs 工具函数 vs Pinia"
            description="四个候选各自的地盘,选错了维护成本翻倍。"
        >
            <div class="overflow-x-auto">
                <table class="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                            <th class="py-2 pr-4 font-medium">候选</th>
                            <th class="py-2 pr-4 font-medium">适合</th>
                            <th class="py-2 font-medium">不适合 / 风险</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 dark:text-gray-300">
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4 font-mono text-xs">composable</td>
                            <td class="py-2 pr-4">带响应式状态与生命周期的逻辑复用</td>
                            <td class="py-2">纯计算(那是工具函数);跨页面共享状态(那是 store)</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4 font-mono text-xs">mixins</td>
                            <td class="py-2">遗留选项式项目</td>
                            <td class="py-2">来源不明、命名冲突、隐式依赖——Vue 3 新项目禁用</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4 font-mono text-xs">工具函数</td>
                            <td class="py-2 pr-4">纯计算、无副作用、无状态(format、validate)</td>
                            <td class="py-2">一旦要碰 ref/生命周期,就该升级成 composable</td>
                        </tr>
                        <tr>
                            <td class="py-2 pr-4 font-mono text-xs">Pinia store</td>
                            <td class="py-2 pr-4">跨页面/跨组件共享的应用状态</td>
                            <td class="py-2">组件局部的临时状态——放 store 里只会变成全局垃圾场</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </TopicSection>
    </TopicPage>
</template>
