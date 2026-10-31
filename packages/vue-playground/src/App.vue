<script setup lang="ts">
/**
 * ============================================================================
 * App — 站点壳层
 * ============================================================================
 *
 * 壳层结构:skip link → Header(品牌区 + 分类导航 + 暗色开关,
 * lg 以下收起为抽屉)→ 主区(专题页带左侧 SideNav 二级导航)→ Footer。
 * 壳层约定:品牌区不占 h1(每页仅内容区一个 h1)。
 *
 * @module App
 */

import { Moon, Sunny } from '@element-plus/icons-vue';
import { ElDrawer } from 'element-plus';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import BrandMark from '@/components/BrandMark.vue';
import SideNav from '@/components/SideNav.vue';
import { useDark } from '@/composables/useDark';
import { CATEGORIES, getCategoryByPath, getCategoryLandingPath, getTopicsByCategory } from '@/config/topics';

const route = useRoute();
const { isDark, toggleDark } = useDark();

/** 当前路径所属分类(顶部导航与抽屉高亮) */
const activeCategory = computed(() => getCategoryByPath(route.path));

/** 是否在专题页(决定是否渲染左侧二级导航) */
const isTopicRoute = computed(() => route.path !== '/' && route.name !== 'not-found');

/** lg 以下抽屉开关 */
const drawerVisible = ref(false);
</script>

<template>
    <div class="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <!-- 跳到主内容 -->
        <a
            href="#main-content"
            class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary-600 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
            跳到主内容
        </a>

        <header
            class="sticky top-0 z-40 border-b border-gray-200/80 bg-white/85 backdrop-blur dark:border-gray-800 dark:bg-gray-950/85"
        >
            <div class="mx-auto flex h-14 w-full max-w-[88rem] items-center gap-6 px-4 sm:px-6">
                <BrandMark />
                <!-- 桌面端分类导航:落到分类首个专题 -->
                <nav aria-label="分类导航" class="hidden items-center gap-0.5 lg:flex">
                    <RouterLink
                        v-for="c in CATEGORIES"
                        :key="c.key"
                        :to="getCategoryLandingPath(c.key)"
                        class="rounded-md px-2.5 py-1.5 text-[13px] transition-colors"
                        :class="
                            activeCategory?.key === c.key
                                ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
                        "
                    >
                        {{ c.title }}
                    </RouterLink>
                </nav>
                <div class="ml-auto flex items-center gap-2">
                    <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                        :aria-label="isDark ? '切换到浅色模式' : '切换到暗色模式'"
                        @click="toggleDark"
                    >
                        <el-icon :size="16">
                            <Moon v-if="isDark" />
                            <Sunny v-else />
                        </el-icon>
                    </button>
                    <!-- 移动端菜单按钮 -->
                    <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-900"
                        aria-label="打开导航菜单"
                        @click="drawerVisible = true"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- 移动端抽屉:分类 + 专题两级导航 -->
        <ElDrawer v-model="drawerVisible" title="站点导航" direction="rtl" size="300px">
            <nav aria-label="移动端导航" class="flex flex-col gap-3">
                <div v-for="c in CATEGORIES" :key="c.key">
                    <RouterLink
                        :to="getCategoryLandingPath(c.key)"
                        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200"
                        @click="drawerVisible = false"
                    >
                        <span class="h-1.5 w-1.5 rounded-full" :class="c.theme.dot" aria-hidden="true" />
                        {{ c.title }}
                    </RouterLink>
                    <div class="mt-0.5 flex flex-col">
                        <RouterLink
                            v-for="t in getTopicsByCategory(c.key)"
                            :key="t.path"
                            :to="t.path"
                            class="rounded-md py-1.5 pl-6 pr-2 text-[13px]"
                            :class="
                                route.path === t.path
                                    ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
                                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            "
                            @click="drawerVisible = false"
                        >
                            {{ t.title }}
                        </RouterLink>
                    </div>
                </div>
            </nav>
        </ElDrawer>

        <main id="main-content" class="flex-1">
            <div class="mx-auto flex w-full max-w-[88rem]">
                <SideNav v-if="isTopicRoute" />
                <div class="min-w-0 flex-1">
                    <RouterView />
                </div>
            </div>
        </main>

        <footer class="border-t border-gray-200/80 py-6 dark:border-gray-800">
            <div
                class="mx-auto flex w-full max-w-[88rem] flex-col items-center justify-between gap-2 px-4 text-xs text-gray-400 sm:flex-row sm:px-6 dark:text-gray-500"
            >
                <span>Vue 权衡录 · Vue Tradeoffs</span>
                <span>Vite 8 · Vue 3 · TypeScript · Pinia · Element Plus · Tailwind CSS 4</span>
            </div>
        </footer>
    </div>
</template>
