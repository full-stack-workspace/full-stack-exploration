<script setup lang="ts">
/**
 * ============================================================================
 * 虚拟 DOM 与 Diff — /architecture/vdom-diff
 * ============================================================================
 *
 * 覆盖:VNode 是什么(轻量描述对象)、同层 Diff 的双端策略、
 * key 的最长递增子序列优化,以及「VDOM 不是性能银弹」的边界。
 *
 * @module topics/architecture/vdom-diff
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- 双端比较的可视化演示:手动步进 ---- */
const oldList = ['A', 'B', 'C', 'D'];
const newList = ['D', 'A', 'B', 'C'];
const step = ref(0);
const diffSteps = [
    '初始:旧 [A B C D],新 [D A B C]。双端指针:oldStart=A, oldEnd=D, newStart=D, newEnd=C。',
    '第一轮:oldStart(A) vs newStart(D) 不同;oldEnd(D) vs newEnd(C) 不同;oldStart(A) vs newEnd(C) 不同;oldEnd(D) vs newStart(D) 相同 → D 移到最前,oldEnd 左移。',
    '第二轮:剩余旧 [A B C] 与新 [A B C] 顺序一致,头头比较逐个命中 → 只复用,不移动。',
    '结束:总共只移动了 1 个节点(D)。朴素逐位对比会移动 3 个——双端 + key 让「位移」最小化。',
];

const vnodeSnippet = `// VNode:对真实 DOM 的轻量描述(纯 JS 对象)
const vnode = {
    type: 'p',                       // 标签 / 组件
    props: { class: ['active'] },    // 属性与绑定
    children: '你好',                 // 子节点
    key: 'row-1',                    // Diff 身份
    patchFlag: 1 /* TEXT */,         // 编译期标记:只有文本是动态的
    el: null,                        // 挂载后指向真实 DOM
}`;
</script>

<template>
    <TopicPage path="/architecture/vdom-diff">
        <TopicSection title="VNode:DOM 的简历" description="虚拟 DOM 不是「更快的 DOM」,而是「可以比对的 DOM 描述」。比对两份描述,比逐字段读真实 DOM 便宜得多。">
            <CodeBlock lang="ts" :code="vnodeSnippet" />
        </TopicSection>

        <TopicSection
            title="同层 Diff:双端比较步进演示"
            description="同一父节点下的子列表对比:新旧两组各设头尾指针,按「头头 / 尾尾 / 头尾 / 尾头」顺序尝试命中,命中即复用并收拢指针。点「下一步」逐轮看。"
        >
            <div class="mb-3 flex items-center gap-3 text-sm">
                <button
                    type="button"
                    class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700 disabled:opacity-40"
                    :disabled="step >= diffSteps.length - 1"
                    @click="step++"
                >
                    下一步
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="step = 0">重置</button>
                <span class="text-xs text-gray-400">第 {{ step + 1 }} / {{ diffSteps.length }} 步</span>
            </div>
            <div class="rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed dark:bg-gray-800">
                <p>旧列表:[{{ oldList.join(' ') }}]</p>
                <p>新列表:[{{ newList.join(' ') }}]</p>
                <p class="mt-2 text-gray-600 dark:text-gray-300">{{ diffSteps[step] }}</p>
            </div>
        </TopicSection>

        <TopicSection
            title="key 与最长递增子序列"
            description="双端比较收拾不了中间段的乱序时,Vue 为「新列表中位置递增的旧节点」求最长递增子序列(LIS):留在子序列上的节点不动,只移动序列外的节点——把移动次数压到理论最小。"
        >
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                这也是 basics 分类「无 key 就地复用」坑的另一面:没有 key,Vue 无法建立新旧节点的身份映射,只能按位置硬比;
                有了 key,中间段乱序也能用 LIS 求出最少移动。
            </p>
        </TopicSection>

        <TopicSection title="边界:VDOM 不是银弹" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>静态内容走 VDOM 是纯浪费——所以 Vue 编译期做静态提升,不变的部分直接复用旧节点,不进 Diff。</li>
                <li>超大列表的瓶颈在 DOM 数量本身,不在 Diff 算法——解法是虚拟滚动(见性能分类),不是换 Diff。</li>
                <li>Vapor Mode(无 VDOM 模式)是 Vue 在「编译信息足够多时直接生成精确 DOM 操作」方向的探索——了解即可,生产仍用 VDOM 管线。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
