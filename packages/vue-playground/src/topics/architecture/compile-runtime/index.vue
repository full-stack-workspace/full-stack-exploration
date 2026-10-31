<script setup lang="ts">
/**
 * ============================================================================
 * 编译时与运行时 — /architecture/compile-runtime
 * ============================================================================
 *
 * Vue 的双引擎:编译时(@vue/compiler-sfc,把模板编译成 render 函数)
 * 与运行时(@vue/runtime-core,响应式 + 调度 + 挂载)。
 * 理解这条分界线,才能理解 Patch Flag 等编译优化为什么是 Vue 独有。
 *
 * @module topics/architecture/compile-runtime
 */

import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const pipelineSnippet = `<!-- 你写的 SFC 模板 -->
<template>
  <p :class="{ active }">{{ msg }}</p>
</template>

// 编译时:模板 → render 函数(带 Patch Flag 提示)
import { openBlock, createElementBlock, toDisplayString, normalizeClass } from 'vue'
function render(_ctx) {
    return openBlock(),
        createElementBlock('p', {
            class: normalizeClass({ active: _ctx.active })  // 1 /* CLASS */
        }, toDisplayString(_ctx.msg), 1 /* TEXT */)
}

// 运行时:render 产出 VNode → Diff → 打补丁到真实 DOM`;
</script>

<template>
    <TopicPage path="/architecture/compile-runtime">
        <TopicSection
            title="一条流水线:模板 → render → VNode → DOM"
            description="下面是从 SFC 模板到真实 DOM 的完整链路。编译产物里的 /* CLASS */ / /* TEXT */ 注释就是 Patch Flag——下一个专题的主角。"
        >
            <CodeBlock lang="vue" :code="pipelineSnippet" />
        </TopicSection>

        <TopicSection title="编译时做什么 / 运行时做什么" description="两边职责的清晰分界:">
            <div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 font-semibold text-primary-600 dark:text-primary-400">编译时(构建期,一次性)</h3>
                    <ul class="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        <li>解析模板为 AST,做静态分析</li>
                        <li>标记动态绑定(Patch Flag)、圈出动态节点(Block Tree)</li>
                        <li>静态提升:不变的节点/属性对象提升到模块级复用</li>
                        <li>生成 render 函数(再也不碰模板字符串)</li>
                    </ul>
                </div>
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 font-semibold text-primary-600 dark:text-primary-400">运行时(浏览器里,每次更新)</h3>
                    <ul class="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        <li>响应式系统:track / trigger(见响应式原理专题)</li>
                        <li>调度器:合并更新、flush 队列</li>
                        <li>执行 render → 新旧 VNode Diff</li>
                        <li>按 Patch Flag 精确打补丁到 DOM</li>
                    </ul>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="和 React 的本质分歧"
            description="React 没有模板编译期(JSX 只转 createElement),动态性分析全部留到运行时逐节点对比;Vue 因为有编译期,可以在构建时就把「哪些节点会变、变什么」写进产物——运行时 Diff 从「全树对比」退化为「只看被标记的少数节点」。这就是「编译时优化」这个 Vue 独有地盘的来源。"
        >
            <p class="text-xs text-gray-400">
                推论:手写 render 函数(或 h())会绕过编译优化;用动态组件字符串模板(runtime compiler)同理。工程上优先让模板走编译管线。
            </p>
        </TopicSection>
    </TopicPage>
</template>
