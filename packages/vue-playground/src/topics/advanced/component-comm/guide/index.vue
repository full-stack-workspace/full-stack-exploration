<script setup lang="ts">
/**
 * ============================================================================
 * 组件通信 · 决策梳理 — /advanced/component-comm-guide
 * ============================================================================
 *
 * 四问(数据归谁/传多远/变得多勤/要不要可分享)+ 通道梯子,
 * 每种通道的适用与红线。机制细节页(响应式/Pinia/provide)用卡片链到对应专题。
 *
 * @module topics/advanced/component-comm/guide
 */

import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { COMM_NAV } from '../nav';

const channels = [
    { name: 'props / emits', reach: '父子', cost: '零成本', red: '跨三层以上仍在用 props 接力(props drilling)' },
    { name: 'v-model / defineModel', reach: '父子(双向)', cost: '零成本', red: '一个组件上挂 5+ 个 v-model,说明该拆组件了' },
    { name: '插槽(含作用域插槽)', reach: '父子(渲染权)', cost: '零成本', red: '把 slot 当数据通道用,状态该回流时却用 slot 硬传' },
    { name: 'provide / inject', reach: '一棵子树', cost: '低', red: '当应用级业务状态通道(无 devtools、来源不明)' },
    { name: 'URL(query / params)', reach: '全站 + 可分享', cost: '低', red: '把大对象塞进 query(URL 有长度上限且不可读)' },
    { name: 'Pinia store', reach: '任意组件', cost: '中', red: '组件局部 UI 态进 store,store 变全局垃圾场' },
];
</script>

<template>
    <TopicPage path="/advanced/component-comm-guide">
        <TopicNav category="advanced" :links="COMM_NAV" />

        <TopicSection title="四问:选通道前先回答" description="不回答问题就选通道,等于不量尺寸就买衣服。">
            <ol class="list-inside list-decimal space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>数据归谁?</strong>谁是唯一可信源——父组件、某棵子树、URL、还是应用?先定归属,通道只是结果。</li>
                <li><strong>传多远?</strong>父子一层、子树几层、还是任意两个组件?距离决定梯子爬几级。</li>
                <li><strong>变得多勤?</strong>高频变化(输入草稿)留在近处;低频共享(主题、用户)才值得走远路。</li>
                <li><strong>要不要可分享/可回退?</strong>要,则答案几乎一定是 URL——它是唯一自带「链接分享 + 前进后退」语义的通道。</li>
            </ol>
        </TopicSection>

        <TopicSection title="通道梯子:从下往上爬" description="能用下面的就不用上面的;每一级都标注红线。">
            <div class="overflow-x-auto">
                <table class="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                            <th class="py-2 pr-4 font-medium">通道</th>
                            <th class="py-2 pr-4 font-medium">覆盖距离</th>
                            <th class="py-2 pr-4 font-medium">接入成本</th>
                            <th class="py-2 font-medium">红线(出现即重构)</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 dark:text-gray-300">
                        <tr v-for="c in channels" :key="c.name" class="border-b border-gray-100 last:border-0 dark:border-gray-800">
                            <td class="py-2 pr-4 font-mono text-xs">{{ c.name }}</td>
                            <td class="py-2 pr-4">{{ c.reach }}</td>
                            <td class="py-2 pr-4">{{ c.cost }}</td>
                            <td class="py-2 text-xs text-gray-500 dark:text-gray-400">{{ c.red }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </TopicSection>

        <TopicSection title="机制深入去哪里读" description="本专题只做决策;各通道的机制细节在对应专题:">
            <ul class="list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>props/emits、插槽 → <RouterLink to="/basics/component-basic" class="text-primary-600 underline dark:text-primary-400">组件基础</RouterLink></li>
                <li>v-model / defineModel → <RouterLink to="/basics/event-form" class="text-primary-600 underline dark:text-primary-400">事件与表单</RouterLink></li>
                <li>provide/inject vs Pinia 的四问决策 → <RouterLink to="/state/decision" class="text-primary-600 underline dark:text-primary-400">状态通道决策</RouterLink></li>
            </ul>
            <p class="mt-3 text-xs text-gray-400">
                反模式提及:全局 event bus(mitt)会让「谁发的、谁听的」全部隐形,本站不演示;需要解耦通知时优先 props/emits 提升一层或进 store。
            </p>
        </TopicSection>
    </TopicPage>
</template>
