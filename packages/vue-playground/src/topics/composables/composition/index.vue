<script setup lang="ts">
/**
 * ============================================================================
 * 组合实战 — /composables/composition
 * ============================================================================
 *
 * 把原子 composable 分层组合成领域 composable:
 * keyword(组件态)→ useDebouncedRef(节奏控制)→ computed URL(派生)
 * → useFetch(请求四态 + 竞态防护)= useUserSearch(领域接口)。
 * 组件只面对领域接口,不知道下面有几层。
 *
 * @module topics/composables/composition
 */

import { computed, ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { useDebouncedRef, useFetch } from '@/composables/lib';
import { COMPOSABLES_NAV } from '../nav';

interface JpUser {
    id: number;
    name: string;
    email: string;
    company: { name: string };
}

/* =================================================================
 * 领域 composable:用户搜索(本页 co-locate,生产中放 composables/)
 * ================================================================ */

/**
 * 用户搜索:防抖关键词 → 请求 jsonplaceholder 全量用户 → 客户端过滤。
 * 返回四态与过滤结果,组件只消费领域语义。
 */
function useUserSearch(keyword: { value: string }) {
    const debounced = useDebouncedRef(computed(() => keyword.value), 300);
    const url = computed(() => 'https://jsonplaceholder.typicode.com/users');
    const { data, loading, error, refresh } = useFetch<JpUser[]>(url);

    const results = computed(() => {
        const kw = debounced.value.trim().toLowerCase();
        if (!kw) return data.value ?? [];
        return (data.value ?? []).filter(
            (u) => u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw),
        );
    });

    return { results, loading, error, refresh, debounced };
}

const keyword = ref('');
const { results, loading, error, refresh } = useUserSearch(keyword);

const layersSnippet = `// 组件只面对领域接口
const keyword = ref('')
const { results, loading, error } = useUserSearch(keyword)

// useUserSearch 内部:原子分层,每层职责单一
function useUserSearch(keyword) {
    const debounced = useDebouncedRef(computed(() => keyword.value), 300)  // 节奏
    const url = computed(() => buildUrl(debounced.value))                  // 派生
    const { data, loading, error } = useFetch(url)                         // 请求
    const results = computed(() => filter(data.value, debounced.value))    // 过滤
    return { results, loading, error }
}`;
</script>

<template>
    <TopicPage path="/composables/composition">
        <TopicNav category="composables" :links="COMPOSABLES_NAV" />

        <TopicSection
            title="用户搜索实战(真实请求 jsonplaceholder)"
            description="输入关键词:防抖 300ms → 客户端过滤用户列表。四态齐全:初次进入 loading,失败可重试,无结果显示空态。"
        >
            <div class="mb-3 flex items-center gap-3">
                <input
                    v-model="keyword"
                    placeholder="按姓名 / 邮箱搜索(试试 Leanne)"
                    class="w-72 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                />
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600" @click="refresh">
                    重新拉取
                </button>
            </div>

            <!-- 四态渲染:loading / error / empty / success -->
            <div v-if="loading" class="rounded-md bg-gray-50 px-4 py-6 text-center text-sm text-gray-400 dark:bg-gray-800">
                加载中…
            </div>
            <div v-else-if="error" class="rounded-md bg-red-50 px-4 py-6 text-center text-sm text-red-500 dark:bg-red-950/40">
                请求失败:{{ error.message }}
                <button type="button" class="ml-2 underline" @click="refresh">重试</button>
            </div>
            <div v-else-if="results.length === 0" class="rounded-md bg-gray-50 px-4 py-6 text-center text-sm text-gray-400 dark:bg-gray-800">
                没有匹配「{{ keyword }}」的用户
            </div>
            <ul v-else class="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                <li v-for="u in results" :key="u.id" class="flex items-center justify-between px-4 py-2.5 text-sm">
                    <span>{{ u.name }} <span class="text-xs text-gray-400">{{ u.email }}</span></span>
                    <span class="text-xs text-gray-400">{{ u.company.name }}</span>
                </li>
            </ul>
        </TopicSection>

        <TopicSection title="分层结构" description="每一层都可以单独替换:换防抖策略、换请求库、换过滤逻辑,领域接口不变。">
            <CodeBlock lang="ts" :code="layersSnippet" />
        </TopicSection>

        <TopicSection title="组合的三条纪律" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>单向分层</strong>:领域 composable 可以调用原子 composable,原子之间不互相依赖,更不反向依赖领域层。</li>
                <li><strong>接口用领域语义</strong>:返回 results/loading/error,而不是把 debounced、url 这些实现细节全抛给组件。</li>
                <li><strong>测试落在边界</strong>:原子层做契约测试(见 lib.test.ts),领域层做集成式测试,组件层只做冒烟。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
