<script setup lang="ts">
/**
 * ============================================================================
 * Home — 首页(注册表驱动的分类分组导航 Hub)
 * ============================================================================
 *
 * Hero(品牌 slogan + 实时响应式演示卡)+ 按 CATEGORIES 分组的专题卡片网格。
 * 专题为空的分类显示「专题筹备中」占位。
 *
 * @module pages/Home
 */

import { ref } from 'vue';
import TopicCard from '@/components/TopicCard.vue';
import { SITE_DESCRIPTION, SITE_SLOGAN } from '@/config/site';
import { CATEGORIES, TOPICS, getTopicsByCategory } from '@/config/topics';

/* Hero 演示卡:一个活的 ref——首页的第一眼就是本站的主题 */
const demoCount = ref(0);
const demoDouble = () => demoCount.value * 2;

const CHECK_COUNT = TOPICS.filter((t) => t.path.endsWith('/check')).length;
</script>

<template>
    <div class="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
        <!-- Hero:左文案,右活 demo -->
        <section class="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-20">
            <div>
                <p class="text-sm font-semibold text-primary-600 dark:text-primary-400">Vue 权衡录 · Vue Tradeoffs</p>
                <h1 class="mt-3 text-4xl font-bold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl dark:text-gray-50">
                    {{ SITE_SLOGAN }}
                </h1>
                <p class="mt-5 max-w-lg text-[15px] leading-7 text-gray-500 dark:text-gray-400">
                    {{ SITE_DESCRIPTION }}
                </p>
                <div class="mt-8 flex items-center gap-3">
                    <RouterLink
                        to="/reactivity/ref-vs-reactive"
                        class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
                    >
                        从响应式开始
                    </RouterLink>
                    <RouterLink
                        to="/architecture/compile-runtime"
                        class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
                    >
                        看架构原理
                    </RouterLink>
                </div>
                <p class="mt-6 text-xs text-gray-400 dark:text-gray-500">
                    {{ CATEGORIES.length }} 个分类 · {{ TOPICS.length }} 个专题 · {{ CHECK_COUNT }} 个理解检验
                </p>
            </div>

            <!-- 活的响应式演示:点按钮,数字与派生值同时变 -->
            <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
                <div class="border-b border-gray-100 bg-gray-50 px-4 py-2 font-mono text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900">
                    响应式 · 开箱即用
                </div>
                <div class="bg-white p-5 dark:bg-gray-950">
                    <div class="flex items-center gap-4">
                        <button
                            type="button"
                            class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                            @click="demoCount++"
                        >
                            count++
                        </button>
                        <div class="font-mono text-sm text-ink-700 dark:text-gray-300">
                            <p>count = <span class="font-semibold text-primary-600 dark:text-primary-400">{{ demoCount }}</span></p>
                            <p>double = <span class="font-semibold text-primary-600 dark:text-primary-400">{{ demoDouble() }}</span></p>
                        </div>
                    </div>
                    <p class="mt-4 text-xs leading-relaxed text-gray-400">
                        一次赋值,视图与派生值同步更新——这就是本站的第一个专题:
                        <RouterLink to="/reactivity/ref-vs-reactive" class="text-primary-600 underline underline-offset-2 dark:text-primary-400">ref vs reactive</RouterLink>
                    </p>
                </div>
            </div>
        </section>

        <!-- 分类分组 -->
        <section
            v-for="c in CATEGORIES"
            :id="`cat-${c.key}`"
            :key="c.key"
            class="mb-14 scroll-mt-20"
            :aria-labelledby="`cat-title-${c.key}`"
        >
            <div class="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-800/80">
                <span
                    class="flex h-9 w-9 items-center justify-center rounded-lg"
                    :class="c.theme.iconChip"
                    aria-hidden="true"
                >
                    <el-icon :size="18"><component :is="c.theme.icon" /></el-icon>
                </span>
                <div class="flex-1">
                    <h2 :id="`cat-title-${c.key}`" class="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink-900 dark:text-gray-100">
                        {{ c.title }}
                        <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {{ getTopicsByCategory(c.key).length }} 个专题
                        </span>
                    </h2>
                    <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{{ c.subtitle }}</p>
                </div>
            </div>

            <div
                v-if="getTopicsByCategory(c.key).length > 0"
                class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
                <TopicCard
                    v-for="topic in getTopicsByCategory(c.key)"
                    :key="topic.path"
                    :topic="topic"
                    :category="c"
                />
            </div>
            <div
                v-else
                class="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500"
            >
                专题筹备中
            </div>
        </section>
    </div>
</template>
