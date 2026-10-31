<script setup lang="ts">
/**
 * ============================================================================
 * 组件基础 — /basics/component-basic
 * ============================================================================
 *
 * 覆盖:props(类型与校验、单向数据流)、emits(事件上报)、
 * 三种插槽(默认/具名/作用域),以及 SFC 样式
 * (scoped / :deep() / v-bind in css)。合并了原「SFC 与样式」专题。
 *
 * @module topics/basics/component-basic
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import EmitButton from './EmitButton.vue';
import SlotCard from './SlotCard.vue';

/* ---- emits 演示 ---- */
const lastEvent = ref('(尚未收到子组件事件)');

/* ---- 样式 v-bind 演示 ---- */
const themeColor = ref('#42b883');

// 代码样例放在 script 里,避免模板属性值中的引号转义问题
const propsSnippet = `// <script setup lang="ts"> 内
interface Props {
    title: string
    max?: number
    items: string[]          // 引用类型 prop 默认深响应
}
// withDefaults 只给可选 prop 默认值
const props = withDefaults(defineProps<Props>(), { max: 10 })

// ❌ props.max = 5          —— 编译能过,运行时警告,数据流被破坏
// ✅ emit('update:max', 5)  —— 由父级决定改不改`;

const styleSnippet = `<style scoped>
.box { background: v-bind('themeColor') }  /* 样式跟着响应式状态走 */
:deep(.child-inner) { color: red }          /* 穿透 scoped,改子组件内部 */
</style>

<!-- 工程约定:能用 utility(Tailwind)就不用 scoped 块;
     scoped 块只留给 v-bind 样式、:deep 穿透与复杂选择器 -->`;
</script>

<template>
    <TopicPage path="/basics/component-basic">
        <TopicSection
            title="props:契约先行,单向数据流"
            description="defineProps 用 TypeScript 类型声明契约(withDefaults 给默认值)。props 只读:子组件要改父级状态,只能 emit 事件,不能直接赋值——这保证了数据流向可追踪。"
        >
            <CodeBlock lang="vue" :code="propsSnippet" />
        </TopicSection>

        <TopicSection
            title="emits:子组件上报「发生了什么」"
            description="defineEmits 声明事件签名(带载荷类型),父级用 @ 监听。下方按钮在子组件内,事件载荷在父级展示。"
        >
            <div class="flex items-center gap-4">
                <EmitButton label="点我上报事件" @activate="(p) => (lastEvent = `收到 activate:${p.label} @ ${p.at}`)" />
                <p class="rounded-md bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {{ lastEvent }}
                </p>
            </div>
        </TopicSection>

        <TopicSection
            title="插槽三件套:默认 / 具名 / 作用域"
            description="插槽是 Vue 的组合主力。作用域插槽尤其关键:子组件把内部数据回传给父级渲染——「状态在子,渲染权在父」。下方 footer 的计数与按钮都来自 SlotCard 内部。"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SlotCard title="具名 header + 作用域 footer">
                    这是默认插槽内容:父级写什么,卡片正文就渲染什么。
                    <template #header="{ title }">📦 {{ title }}(父级重写了 header)</template>
                    <template #footer="{ count, markRead }">
                        <span>已读 {{ count }} 次(数据在子组件)</span>
                        <button type="button" class="rounded border border-gray-300 px-2 py-0.5 text-xs dark:border-gray-600" @click="markRead">
                            标记已读
                        </button>
                    </template>
                </SlotCard>
                <SlotCard title="全默认插槽">
                    不提供具名插槽时,卡片各处回退到子组件的默认内容。
                </SlotCard>
            </div>
        </TopicSection>

        <TopicSection
            title="SFC 与样式:scoped、:deep()、v-bind in css"
            description="scoped 用属性选择器把样式限制在组件内;要穿透到子组件用 :deep();样式需要跟随响应式状态时用 v-bind()。右侧色块颜色由下面的取色器实时驱动。"
        >
            <div class="flex items-center gap-4">
                <input v-model="themeColor" type="color" class="h-9 w-14 cursor-pointer rounded border border-gray-300 dark:border-gray-600" aria-label="选择主题色" />
                <span class="themed-box" aria-hidden="true" />
                <code class="text-xs text-gray-400">background: v-bind('themeColor')</code>
            </div>
            <CodeBlock class="mt-4" lang="vue" :code="styleSnippet" />
        </TopicSection>
    </TopicPage>
</template>

<style scoped>
/* v-bind in css:样式值绑定响应式状态 */
.themed-box {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: v-bind('themeColor');
    transition: background 0.2s;
}
</style>
