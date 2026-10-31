<script setup lang="ts">
/**
 * ============================================================================
 * 组合式函数原子演练 — /composables/playground
 * ============================================================================
 *
 * lib/ 的 8 个原子 composable 逐个交互演示;每个都配契约测试(lib.test.ts)。
 *
 * @module topics/composables/playground
 */

import { ref } from 'vue';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import {
    useClipboard,
    useCounter,
    useDebouncedRef,
    useEventListener,
    useInterval,
    useLocalStorage,
    useMediaQuery,
    useToggle,
} from '@/composables/lib';
import { COMPOSABLES_NAV } from '../nav';

const [panelOpen, togglePanel] = useToggle(true);
const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 });
const keyword = ref('');
const debouncedKeyword = useDebouncedRef(keyword, 300);
const nickname = useLocalStorage('vue-pg-nickname', '');
const { counter: ticks, isActive, pause, resume } = useInterval(() => {}, 1000);
const { copied, copy } = useClipboard();
const isNarrow = useMediaQuery('(max-width: 768px)');

/* useEventListener 演示:监听全局滚动次数 */
const scrollCount = ref(0);
useEventListener(window, 'scroll', () => scrollCount.value++);
</script>

<template>
    <TopicPage path="/composables/playground">
        <TopicNav category="composables" :links="COMPOSABLES_NAV" />

        <TopicSection title="useToggle / useCounter / useClipboard" description="布尔、计数、剪贴板——三个最常用的 UI 原子。">
            <div class="flex flex-wrap items-center gap-3 text-sm">
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="togglePanel()">
                    {{ panelOpen ? '收起面板' : '展开面板' }}
                </button>
                <span v-show="panelOpen" class="rounded bg-gray-50 px-2 py-1 text-xs dark:bg-gray-800">useToggle 驱动的面板</span>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <button type="button" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-600" @click="dec()">−</button>
                <span class="w-8 text-center font-mono">{{ count }}</span>
                <button type="button" class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-600" @click="inc()">+</button>
                <button type="button" class="text-xs text-gray-400 underline" @click="reset()">reset</button>
                <span class="text-xs text-gray-400">(min 0 / max 10,到界即钳制)</span>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="copy('Hello from useClipboard')">
                    {{ copied ? '已复制 ✓' : '复制一段文本' }}
                </button>
            </div>
        </TopicSection>

        <TopicSection title="useDebouncedRef / useLocalStorage" description="防抖:狂敲键盘,右侧值只在你停手 300ms 后更新。持久化:改昵称后刷新页面仍在。">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                    <input v-model="keyword" placeholder="输入搜索词(防抖 300ms)" class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    <p class="font-mono text-xs text-gray-500 dark:text-gray-400">
                        实时:{{ keyword || '∅' }} · 防抖后:<span class="text-primary-600 dark:text-primary-400">{{ debouncedKeyword || '∅' }}</span>
                    </p>
                </div>
                <div class="space-y-2">
                    <input v-model="nickname" placeholder="昵称(写入 localStorage)" class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
                    <p class="font-mono text-xs text-gray-500 dark:text-gray-400">localStorage["vue-pg-nickname"] = {{ nickname || '∅' }}(刷新页面验证)</p>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="useInterval / useEventListener / useMediaQuery" description="定时器可暂停、滚动监听与媒体查询——三者的清理都已被封装,离开本页即自动停止。">
            <div class="flex flex-wrap items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                    <span class="font-mono">{{ ticks }}s</span>
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-600" @click="isActive ? pause() : resume()">
                        {{ isActive ? '暂停' : '继续' }}
                    </button>
                </div>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">页面滚动次数:<span class="font-mono">{{ scrollCount }}</span>(滚动页面试试)</span>
                <span class="text-gray-300 dark:text-gray-600">|</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                    视口 ≤768px:<span class="font-mono" :class="isNarrow ? 'text-primary-600 dark:text-primary-400' : ''">{{ isNarrow }}</span>
                </span>
            </div>
        </TopicSection>

        <TopicSection title="useFetch" description="四态 + 竞态防护的组合式请求,完整用法见下一页「组合实战」的搜索演练。">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                useFetch(urlRef) 返回 { data, loading, error, refresh };url 变化自动重取,新请求发起时 abort 旧请求,组件卸载时中断在途请求。
                <RouterLink to="/composables/composition" class="text-primary-600 underline dark:text-primary-400">去看真实组合 →</RouterLink>
            </p>
        </TopicSection>
    </TopicPage>
</template>
