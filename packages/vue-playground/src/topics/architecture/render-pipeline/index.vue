<script setup lang="ts">
/**
 * ============================================================================
 * 渲染管线与调度器 — /architecture/render-pipeline
 * ============================================================================
 *
 * 覆盖:一次更新的完整旅程(trigger → 调度队列 → render → patch)、
 * 调度器的去重与排序(父先子后)、flush 时机与 nextTick 的关系。
 *
 * @module topics/architecture/render-pipeline
 */

import { nextTick, ref, watch } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 调度观察实验:watch 的 flush 时机对照 ---- */
const source = ref(0);
const log = ref<string[]>([]);
let watchedPre = 0;
let watchedPost = 0;

const runExperiment = async () => {
    log.value = [];
    source.value++;
    log.value.push(`同步代码:source 已改为 ${source.value},DOM 尚未更新`);
    await nextTick();
    log.value.push('nextTick 之后:调度队列已 flush,DOM 已更新');
};

// flush: 'pre'(默认)——组件渲染前执行;flush: 'post'——渲染后执行
watch(source, () => log.value.push(`watch(pre) 回调执行(第 ${++watchedPre} 次)`));
watch(
    source,
    () => log.value.push(`watch(post) 回调执行(第 ${++watchedPost} 次)`),
    { flush: 'post' },
);

const journeySnippet = `state.count++                          // ① 写入
  └─ trigger(state, 'count')           // ② 响应式通知(见响应式原理)
       └─ scheduler: queueJob(组件渲染 effect)  // ③ 进微任务队列,Set 去重
            └─ Promise.then(flushJobs)  // ④ 本微任务周期结束时统一执行
                 ├─ 排序:父组件 job 先于子组件  // ⑤ 保证父先子后
                 ├─ render() → 新 VNode 树       // ⑥ 执行 render
                 └─ patch(old, new)             // ⑦ 按 Patch Flag 打补丁
nextTick(cb)                           // ⑧ cb 排在 flushJobs 之后 → 读到新 DOM`;
</script>

<template>
    <TopicPage path="/architecture/render-pipeline">
        <TopicSection title="一次更新的完整旅程" description="从一行赋值到屏幕变化的八步。">
            <CodeBlock lang="ts" :code="journeySnippet" />
        </TopicSection>

        <TopicSection
            title="调度观察:pre / post / nextTick 的相对顺序"
            description="点「跑一次实验」:两个 watch 分别用 pre(默认)与 post flush,对照它们与同步代码、nextTick 的先后顺序。"
        >
            <div class="mb-3 flex items-center gap-3 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="runExperiment">
                    跑一次实验(source = {{ source }})
                </button>
            </div>
            <div class="rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <p v-if="log.length === 0" class="text-gray-400">日志为空,点上方按钮</p>
                <p v-for="(l, i) in log" :key="i">{{ i + 1 }}. {{ l }}</p>
            </div>
        </TopicSection>

        <TopicSection title="调度器的三个关键设计" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>去重</strong>:同一组件在一个周期内被触发 N 次,队列里只有一份 job(Set 语义)——这是「连改三次渲染一次」的实现层答案。</li>
                <li><strong>排序</strong>:flush 时按组件 id 升序,父组件先于子组件渲染——子组件永远读到父级已经稳定的 props。</li>
                <li><strong>微任务</strong>:flush 挂在 Promise 微任务上,所以同步代码永远跑在 DOM 更新之前,nextTick 就是「排到 flush 后面」的门票。</li>
            </ul>
        </TopicSection>

        <TopicSection title="flush 三档怎么用" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><code>pre</code>(默认):组件渲染前执行——绝大多数 watcher 的正确档位。</li>
                <li><code>post</code>:DOM 更新后执行——回调里要读新 DOM 时用,比手写 nextTick 语义更清晰。</li>
                <li><code>sync</code>:状态一变同步执行——放弃批处理,仅调试或极特殊场景,慎用。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
