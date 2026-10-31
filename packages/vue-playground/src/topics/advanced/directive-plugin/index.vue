<script setup lang="ts">
/**
 * ============================================================================
 * 自定义指令与插件 — /advanced/directive-plugin
 * ============================================================================
 *
 * 覆盖:自定义指令(v-focus / v-highlight 演示钩子与参数)、
 * 插件机制(app.use 的安装协议、全局资源注册),
 * 以及「指令 vs 组件 vs composable」的选型边界。
 *
 * @module topics/advanced/directive-plugin
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 局部自定义指令:v-focus(挂载即聚焦) ---- */
const vFocus = {
    mounted: (el: HTMLElement) => el.focus(),
};

/* ---- 局部自定义指令:v-highlight(带参数与修饰符) ---- */
const vHighlight = {
    mounted: (el: HTMLElement, binding: { value: string; modifiers: Record<string, true> }) => {
        el.style.backgroundColor = binding.value || '#fef08a';
        if (binding.modifiers.rounded) el.style.borderRadius = '4px';
    },
    updated: (el: HTMLElement, binding: { value: string; modifiers: Record<string, true> }) => {
        el.style.backgroundColor = binding.value || '#fef08a';
        if (binding.modifiers.rounded) el.style.borderRadius = '4px';
    },
};

const highlightColor = ref('#fef08a');
const focusLog = ref('点下方「重新挂载」观察 v-focus 只在 mounted 时触发一次');
const remountKey = ref(0);

const pluginSnippet = `// 插件协议:一个带 install(app) 的对象
const ToastPlugin = {
    install(app, options) {
        // 可注册:全局组件 / 全局指令 / provide / 全局属性
        app.provide('toast', createToast(options))
        app.config.globalProperties.$toast = createToast(options)
        app.directive('focus', focusDirective)
    },
}
app.use(ToastPlugin, { duration: 2000 })`;
</script>

<template>
    <TopicPage path="/advanced/directive-plugin">
        <TopicSection
            title="v-focus / v-highlight:指令解剖"
            description="指令 = 一组「元素级生命周期钩子」+ 参数(value / arg / modifiers)。适合对 DOM 元素本身的横切增强。"
        >
            <div class="space-y-3 text-sm">
                <input
                    :key="remountKey"
                    v-focus
                    placeholder="我一挂载就自动聚焦"
                    class="w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="button" class="text-xs text-gray-400 underline" @click="remountKey++; focusLog = `第 ${remountKey} 次重挂,焦点回来了`">
                    重新挂载输入框
                </button>
                <p class="text-xs text-gray-400">{{ focusLog }}</p>
                <div class="flex flex-wrap items-center gap-3">
                    <input v-model="highlightColor" type="color" class="h-8 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600" aria-label="高亮色" />
                    <span v-highlight.rounded="highlightColor" class="px-2 py-1 text-xs text-gray-800">
                        v-highlight.rounded="color":色值随取色器更新(updated 钩子)
                    </span>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="插件:app.use 的安装协议" description="插件的本质是一个 install(app, options) 函数,在应用级注册全局资源。">
            <CodeBlock lang="ts" :code="pluginSnippet" />
            <p class="mt-3 text-xs leading-relaxed text-gray-400">
                本站的 Element Plus、Pinia、vue-router 都是这个协议的实现:app.use(pinia) 安装 store 注入,app.use(router) 注册 RouterLink/RouterView 与路由上下文。
            </p>
        </TopicSection>

        <TopicSection title="选型:指令 vs 组件 vs composable" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>指令</strong>:增强「一个 DOM 元素」的行为(聚焦、高亮、权限移除、点击外部关闭),无模板结构。</li>
                <li><strong>组件</strong>:有渲染结构、有插槽、需要被组合(卡片、表格、弹层)。</li>
                <li><strong>composable</strong>:响应式逻辑复用,不碰模板(监听、请求、状态)。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
