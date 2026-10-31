<script setup lang="ts">
/**
 * ============================================================================
 * 组件通信 · 工作台实战 — /advanced/component-comm-practice
 * ============================================================================
 *
 * 工单工作台:把「决策梳理」的四问落到真实界面——
 * 筛选状态归 URL(可分享)、选中工单归本组件 ref(视图态)、
 * 回复草稿归本地(随选中切换重置)、处理人变更经 emits 上报。
 *
 * @module topics/advanced/component-comm/practice
 */

import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { COMM_NAV } from '../nav';
import { STATUS_LABEL, TICKETS, type Ticket } from '../tickets';

const route = useRoute();
const router = useRouter();

/* ---- 筛选:归 URL(query.status)——可分享、可回退 ---- */
const status = computed(() => (route.query.status as string) || 'all');
const setStatus = (s: string) => router.replace({ query: { ...route.query, status: s === 'all' ? undefined : s } });

/* ---- 列表派生 ---- */
const filtered = computed(() => TICKETS.filter((t) => status.value === 'all' || t.status === status.value));

/* ---- 选中:归本组件 ref(纯视图态) ---- */
const selectedId = ref<number | null>(null);
const selected = computed(() => TICKETS.find((t) => t.id === selectedId.value) ?? null);

/* ---- 回复草稿:归本地,切换选中即重置(避免草稿串工单) ---- */
const draft = ref('');
watch(selectedId, () => (draft.value = ''));

/* ---- 处理人变更:emits 上报模式(此处直接在父级改数据,演示流向) ---- */
const assignees = ['张三', '李四', '王五', '赵六'];
const reassign = (ticket: Ticket, to: string) => {
    ticket.assignee = to;
};
</script>

<template>
    <TopicPage path="/advanced/component-comm-practice">
        <TopicNav category="advanced" :links="COMM_NAV" />

        <TopicSection
            title="状态归属一览"
            description="筛选归 URL、选中归组件、草稿归本地、数据归 mock 源——每种状态只待在该在的通道里。"
        >
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <!-- 列表区 -->
                <div class="lg:col-span-3">
                    <div class="mb-2 flex gap-2 text-xs">
                        <button
                            v-for="s in ['all', 'open', 'doing', 'done']"
                            :key="s"
                            type="button"
                            class="rounded-md border px-2.5 py-1"
                            :class="
                                status === s
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                                    : 'border-gray-300 dark:border-gray-600'
                            "
                            @click="setStatus(s)"
                        >
                            {{ s === 'all' ? '全部' : STATUS_LABEL[s as Ticket['status']] }}
                        </button>
                        <span class="ml-auto self-center font-mono text-gray-400">?status={{ route.query.status ?? 'all' }}</span>
                    </div>
                    <ul class="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                        <li
                            v-for="t in filtered"
                            :key="t.id"
                            class="cursor-pointer px-3 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                            :class="{ 'bg-primary-50/60 dark:bg-primary-950/40': t.id === selectedId }"
                            @click="selectedId = t.id"
                        >
                            <div class="flex items-center justify-between">
                                <span :class="{ 'text-gray-400 line-through': t.status === 'done' }">#{{ t.id }} {{ t.title }}</span>
                                <span class="text-xs" :class="t.priority === '高' ? 'text-red-500' : 'text-gray-400'">{{ t.priority }}</span>
                            </div>
                            <p class="mt-0.5 text-xs text-gray-400">{{ STATUS_LABEL[t.status] }} · {{ t.assignee }}</p>
                        </li>
                    </ul>
                </div>

                <!-- 详情区 -->
                <div class="rounded-md border border-gray-200 p-4 lg:col-span-2 dark:border-gray-700">
                    <template v-if="selected">
                        <h3 class="text-sm font-semibold">#{{ selected.id }} {{ selected.title }}</h3>
                        <p class="mt-1 text-xs text-gray-400">状态:{{ STATUS_LABEL[selected.status] }}</p>
                        <label class="mt-3 block text-xs text-gray-500 dark:text-gray-400">
                            改派给
                            <select
                                :value="selected.assignee"
                                class="ml-2 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                                @change="reassign(selected, ($event.target as HTMLSelectElement).value)"
                            >
                                <option v-for="a in assignees" :key="a" :value="a">{{ a }}</option>
                            </select>
                        </label>
                        <textarea
                            v-model="draft"
                            rows="3"
                            placeholder="回复草稿(切换工单即清空——草稿跟随选中,不串台)"
                            class="mt-3 w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800"
                        />
                    </template>
                    <p v-else class="py-8 text-center text-xs text-gray-400">从左侧选择一个工单</p>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="回看四问" description="">
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>筛选「要不要可分享」→ 要 → <strong>URL query</strong>(复制链接给同事,他看到的就是你筛选后的列表)。</li>
                <li>选中「数据归谁」→ 只属于这个工作台视图 → <strong>组件 ref</strong>,不进 store 不进 URL。</li>
                <li>草稿「变得多勤」→ 高频且私有 → <strong>本地 ref</strong>,并用 watch 把「切换选中 → 清空草稿」声明成规则。</li>
                <li>改派「流向」→ 详情面板不直接持有数据 → <strong>emit / 父级改源</strong>,列表与详情同时更新。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
