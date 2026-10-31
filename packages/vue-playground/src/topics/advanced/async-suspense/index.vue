<script setup lang="ts">
/**
 * ============================================================================
 * 异步组件与 Suspense — /advanced/async-suspense
 * ============================================================================
 *
 * 覆盖:defineAsyncComponent(路由级与组件级代码分割)、
 * Suspense 的加载态编排(等待层级、fallback 粒度),
 * 以及和骨架屏/四态渲染的关系。
 *
 * @module topics/advanced/async-suspense
 */

import { defineAsyncComponent, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/**
 * defineAsyncComponent:组件代码拆成独立 chunk,首次渲染时才请求。
 * 顶层带 await 的组件(如 AsyncPanel)配合 Suspense 才有完整加载态语义。
 */
const AsyncPanel = defineAsyncComponent(() => import('./AsyncPanel.vue'));

/* 卸载/重挂,用于重复演示加载过程 */
const showPanel = ref(false);
const mountKey = ref(0);
const remount = () => {
    mountKey.value++;
    showPanel.value = false;
    requestAnimationFrame(() => (showPanel.value = true));
};
</script>

<template>
    <TopicPage path="/advanced/async-suspense">
        <TopicSection
            title="Suspense 编排异步面板"
            description="AsyncPanel 顶层 await 1.2s(模拟慢 chunk)。Suspense 捕获子树的异步依赖,就绪前渲染 #default 之外的 fallback。点「重新挂载」重复观察。"
        >
            <div class="mb-3 flex gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="remount">
                    挂载 / 重新挂载异步面板
                </button>
            </div>
            <Suspense :key="mountKey">
                <AsyncPanel v-if="showPanel" />
                <p v-else class="py-4 text-center text-xs text-gray-400">尚未挂载</p>
                <template #fallback>
                    <div class="animate-pulse rounded-lg border border-gray-200 p-4 text-sm text-gray-400 dark:border-gray-700">
                        面板加载中(Suspense fallback)…
                    </div>
                </template>
            </Suspense>
        </TopicSection>

        <TopicSection
            title="粒度决策:fallback 罩多大"
            description="Suspense 的边界决定「等待时用户看到什么」。三条经验:"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>罩整个页面</strong>:最简单的全屏 loading,但所有异步块互相等待(最慢的拖住全部)。</li>
                <li><strong>按区域罩</strong>(推荐):每个独立信息块一个 Suspense,谁慢谁显示骨架,互不拖累。</li>
                <li><strong>路由级</strong>:本站注册表的 element 懒加载就是路由级代码分割;过渡态由 router 的 loading 处理,不需要 Suspense。</li>
            </ul>
        </TopicSection>

        <TopicSection title="与四态渲染的关系" description="">
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Suspense 管的是「组件代码/初始化数据还没就绪」的 loading;接口请求的四态(loading/error/empty/success)
                仍在组件内部用 useFetch 这类组合式函数显式建模(见组合式函数 · 组合实战)。
                错误处理:errorCaptured 能兜住 Suspense 子树的加载失败,见「错误处理」专题。
            </p>
        </TopicSection>
    </TopicPage>
</template>
