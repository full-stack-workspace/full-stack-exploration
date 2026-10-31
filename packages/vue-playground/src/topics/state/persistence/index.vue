<script setup lang="ts">
/**
 * ============================================================================
 * 持久化与跨页共享 — /state/persistence
 * ============================================================================
 *
 * 覆盖:setup store × useLocalStorage 的持久化组合(改动偏好 →
 * 刷新页面仍在),以及「store 是应用级单例」的跨页共享验证。
 *
 * @module topics/state/persistence
 */

import { storeToRefs } from 'pinia';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { usePreferencesStore } from '@/stores/preferences';

const preferences = usePreferencesStore();
const { density, showDescription } = storeToRefs(preferences);
</script>

<template>
    <TopicPage path="/state/persistence">
        <TopicSection
            title="偏好设置:改完刷新页面验证"
            description="preferences store 的每个字段都经 useLocalStorage 持久化——setup 风格 store 可以直接复用组合式函数,这是 Pinia 最顺滑的工程红利。"
        >
            <div class="flex flex-wrap items-center gap-6 text-sm">
                <label class="flex items-center gap-2">
                    列表密度
                    <select v-model="density" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="cozy">舒适</option>
                        <option value="compact">紧凑</option>
                    </select>
                </label>
                <label class="flex items-center gap-2">
                    <input v-model="showDescription" type="checkbox" class="accent-primary-600" />
                    卡片显示描述
                </label>
                <button type="button" class="text-xs text-gray-400 underline" @click="preferences.$resetPreferences">
                    恢复默认
                </button>
            </div>
            <p class="mt-3 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                localStorage: density = {{ density }} · showDescription = {{ showDescription }}
            </p>
            <p class="mt-2 text-xs text-gray-400">
                改完任意一项,刷新页面(F5)——设置仍在。这就是「状态写穿到 localStorage」的最小实现,无第三方插件。
            </p>
        </TopicSection>

        <TopicSection
            title="跨页共享:store 生命周期跟着应用"
            description="组件卸载只销毁组件;store 实例由 Pinia 持有,离开本页再回来,状态原样保留。"
        >
            <ol class="list-inside list-decimal space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                <li>在上方把密度改成「紧凑」。</li>
                <li>
                    跳到 <RouterLink to="/state/pinia-core" class="text-primary-600 underline dark:text-primary-400">Pinia 核心</RouterLink> 再回来。
                </li>
                <li>密度仍是「紧凑」——跨页共享成立;再按 F5——持久化也成立。两层语义正交。</li>
            </ol>
        </TopicSection>

        <TopicSection title="持久化选型清单" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>字段级少量偏好</strong>:本页方案(useLocalStorage 直接进 setup store),零依赖、粒度可控。</li>
                <li><strong>整 store 持久化 + 多存储介质</strong>:pinia-plugin-persistedstate,配 storage/serializer/paths 选项。</li>
                <li><strong>敏感数据</strong>:别放 localStorage(XSS 可读);token 走 httpOnly cookie,store 只存「已登录」这个事实。</li>
                <li><strong>持久化 ≠ 真相源</strong>:存储里的数据可能过期或被改,读取时永远带校验与回退(useLocalStorage 已示范)。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
