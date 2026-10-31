<script setup lang="ts">
/**
 * ============================================================================
 * 错误处理 — /advanced/error-handling
 * ============================================================================
 *
 * 覆盖:onErrorCaptured 的边界与恢复、app.config.errorHandler 全局兜底、
 * 以及「哪些错误它俩都抓不到」(事件/异步/Promise)。
 *
 * @module topics/advanced/error-handling
 */

import { onErrorCaptured, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import BuggyChild from './BuggyChild.vue';

/* ---- 边界实验 ---- */
const crash = ref(false);
const crashed = ref(false);
const capturedLog = ref<string[]>([]);
const boundaryKey = ref(0);

onErrorCaptured((err) => {
    capturedLog.value.unshift(`onErrorCaptured 捕获:${err.message}`);
    // 就地处理:换降级 UI;返回 false 阻止错误继续向上冒泡
    crashed.value = true;
    return false;
});

const triggerCrash = () => {
    crash.value = true;
};
const recover = () => {
    // 恢复 = 重置状态 + 重挂子树(key 变化强制重建)
    crash.value = false;
    crashed.value = false;
    boundaryKey.value++;
};

/* ---- 事件/异步错误:onErrorCaptured 抓不到 ---- */
const manualLog = ref<string[]>([]);
const eventError = () => {
    try {
        throw new Error('事件处理器里的错误(边界抓不到)');
    } catch (e) {
        manualLog.value.unshift(`手动 try/catch:${(e as Error).message}`);
    }
};
</script>

<template>
    <TopicPage path="/advanced/error-handling">
        <TopicSection
            title="onErrorCaptured:Vue 的错误边界"
            description="点「让子组件崩溃」:渲染期错误被本组件的 onErrorCaptured 捕获,应用不白屏;点「恢复」重挂子树。"
        >
            <div class="mb-3 flex gap-3 text-sm">
                <button type="button" class="rounded-md bg-red-500 px-3 py-1.5 text-white hover:bg-red-600" @click="triggerCrash">
                    让子组件崩溃
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="recover">
                    恢复(重置 + 重挂)
                </button>
            </div>
            <div :key="boundaryKey" class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <BuggyChild v-if="!crashed" :should-crash="crash" />
                <div v-else class="rounded-md bg-red-50 px-3 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    ⚠️ 子树已崩溃,降级 UI 接管(应用其余部分不受影响)
                </div>
            </div>
            <div class="mt-3 rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <p v-if="capturedLog.length === 0">捕获日志(尚未触发)</p>
                <p v-for="(l, i) in capturedLog" :key="i">{{ l }}</p>
            </div>
        </TopicSection>

        <TopicSection
            title="边界抓不到什么"
            description="onErrorCaptured 与 errorHandler 只覆盖「渲染期 / 生命周期 / watcher」的同步错误。以下三类必须自己兜:"
        >
            <div class="space-y-2 text-sm">
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="eventError">
                    触发一个事件里的错误(已手动 try/catch)
                </button>
                <div class="rounded-md bg-gray-50 p-3 font-mono text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <p v-if="manualLog.length === 0">事件错误日志(需要手动捕获)</p>
                    <p v-for="(l, i) in manualLog" :key="i">{{ l }}</p>
                </div>
            </div>
            <ul class="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>事件处理器</strong>:@click 里的 throw 不进边界——手动 try/catch 或统一封装。</li>
                <li><strong>异步回调</strong>:setTimeout / Promise.then 里的错误——用 await + try/catch,Promise 加 .catch。</li>
                <li><strong>请求层</strong>:接口失败是「状态」不是「异常」——建模进 error 四态(见 useFetch),不要 throw。</li>
            </ul>
        </TopicSection>

        <TopicSection title="分层兜底策略" description="生产里的三层防线:">
            <ol class="list-inside list-decimal space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>局部 onErrorCaptured</strong>:易碎子树(第三方组件、富文本渲染)就地隔离 + 降级 UI + 恢复入口。</li>
                <li><strong>app.config.errorHandler</strong>:全局兜底,上报监控(Sentry)并防止白屏;不做恢复。</li>
                <li><strong>window.onerror / unhandledrejection</strong>:最后一张网,只负责上报。</li>
            </ol>
        </TopicSection>
    </TopicPage>
</template>
