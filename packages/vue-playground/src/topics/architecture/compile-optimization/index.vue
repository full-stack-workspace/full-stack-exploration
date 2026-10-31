<script setup lang="ts">
/**
 * ============================================================================
 * 编译优化 — /architecture/compile-optimization
 * ============================================================================
 *
 * Vue 编译时三件套的逐一拆解:Patch Flag(标记动态绑定的种类)、
 * Block Tree(只收集动态节点,跳过静态子树)、静态提升(不变节点模块级复用)。
 *
 * @module topics/architecture/compile-optimization
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const flagSnippet = `// 模板
<p :class="cls">{{ msg }}<span>静态文本</span></p>

// 编译产物(节选)
createElementBlock('p', { class: normalizeClass(_ctx.cls) }, [
    createTextVNode(toDisplayString(_ctx.msg), 1 /* TEXT */),   // ← 只有文本动态
    createElementVNode('span', null, '静态文本'),                // ← 无 flag,Diff 直接跳过
], 8 /* PROPS */, ['class'])                                     // ← 动态 prop 名单:只比 class

// 常见 Patch Flag:
// 1 TEXT · 2 CLASS · 4 STYLE · 8 PROPS · 16 FULL_PROPS
// 32 HYDRATE_EVENTS · 64 STABLE_FRAGMENT · 128 KEYED_FRAGMENT ...`;

/* ---- Block Tree 直观演示 ---- */
const tick = ref(0);
</script>

<template>
    <TopicPage path="/architecture/compile-optimization">
        <TopicSection
            title="Patch Flag:把「哪里会动」写进编译产物"
            description="下面的模板里,p 的 class 和文本会动,span 永远不动。编译产物给每个动态绑定打上位标记,运行时可以按位跳过所有静态内容。"
        >
            <CodeBlock lang="ts" :code="flagSnippet" />
        </TopicSection>

        <TopicSection
            title="Block Tree:Diff 只看动态节点"
            description="一个 Block(带动态节点的区块)在创建时就把后代里的动态节点收集成扁平数组 dynamicChildren。Diff 时静态子树整块跳过——树的深度与静态内容量都不再影响 Diff 成本。"
        >
            <div class="rounded-md bg-gray-50 p-4 font-mono text-xs leading-loose dark:bg-gray-800">
                <p>div(Block,收集 dynamicChildren)</p>
                <p class="pl-4 text-gray-400">├─ section(静态,跳过)</p>
                <p class="pl-8 text-gray-400">├─ h2 静态标题(跳过)</p>
                <p class="pl-8 text-primary-600 dark:text-primary-400">└─ p {{ '{ msg }' }} ← 被收集进 dynamicChildren</p>
                <p class="pl-4 text-gray-400">└─ footer(静态,跳过)</p>
            </div>
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
                本页就有一个活例:这个计数器 {{ tick }}
                <button type="button" class="rounded border border-gray-300 px-1.5 text-xs dark:border-gray-600" @click="tick++">+1</button>
                更新时,本页其余上百个静态节点一个都不会进 Diff——它们根本不在 dynamicChildren 里。
            </p>
        </TopicSection>

        <TopicSection
            title="静态提升:不变的东西只创建一次"
            description="纯静态的 VNode 与属性对象被提升到模块作用域,所有渲染共用同一份。配合 Block Tree,静态内容的更新成本趋近于零。"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>静态元素/文本 → 提升为模块级常量 VNode,render 直接引用。</li>
                <li>内联的静态对象/数组 prop({ a: 1 })→ 提升为常量,避免每次 render 新建导致子组件误判 props 变化。</li>
                <li>推论:手写 render 时保持引用稳定同样重要——这与 React 里「inline object 击穿 memo」是同一个道理的两种表达。</li>
            </ul>
        </TopicSection>

        <TopicSection title="工程推论" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>不要手写 render 函数除非必要——你会失去全部编译优化。</li>
                <li>v-for 上稳定的 key 让 KEYED_FRAGMENT 生效,列表更新进 Block 快速路径。</li>
                <li>「Vue 的模板比 JSX 啰嗦」的另一面:模板给了编译器完整的静态结构信息,换来了运行时的小 Diff。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
