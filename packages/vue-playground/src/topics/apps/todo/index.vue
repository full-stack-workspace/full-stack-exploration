<script setup lang="ts">
/**
 * ============================================================================
 * 待办事项清单 — /apps/todo
 * ============================================================================
 *
 * 综合应用:增删改查、筛选、优先级与本地持久化。
 * 状态在 Pinia(co-locate store.ts),列表整体 useLocalStorage 持久化;
 * 控件用 Element Plus(对照 react-playground 同名应用的 antd 实现)。
 *
 * @module topics/apps/todo
 */

import { ElButton, ElInput, ElOption, ElSelect, ElTag } from 'element-plus';
import { ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { useTodoStore, type TodoFilter, type TodoItem } from './store';

const store = useTodoStore();

/* ---- 新增表单(组件局部态) ---- */
const newText = ref('');
const newPriority = ref<TodoItem['priority']>('medium');
const submit = () => {
    store.add(newText.value, newPriority.value);
    newText.value = '';
};

/* ---- 行内编辑(组件局部态) ---- */
const editingId = ref<number | null>(null);
const editingText = ref('');
const startEdit = (t: TodoItem) => {
    editingId.value = t.id;
    editingText.value = t.text;
};
const commitEdit = () => {
    if (editingId.value !== null) store.update(editingId.value, editingText.value);
    editingId.value = null;
};

const PRIORITY_META: Record<TodoItem['priority'], { label: string; type: 'danger' | 'warning' | 'info' }> = {
    high: { label: '高', type: 'danger' },
    medium: { label: '中', type: 'warning' },
    low: { label: '低', type: 'info' },
};

const FILTERS: { key: TodoFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'done', label: '已完成' },
];
</script>

<template>
    <TopicPage path="/apps/todo">
        <TopicSection title="待办清单" description="CRUD + 筛选 + 优先级 + 持久化。刷新页面,数据仍在(useLocalStorage 写穿)。">
            <!-- 新增 -->
            <div class="mb-4 flex flex-wrap gap-2">
                <ElInput v-model="newText" placeholder="要做点什么?" class="!w-64" @keyup.enter="submit" />
                <ElSelect v-model="newPriority" class="!w-24">
                    <ElOption label="高" value="high" />
                    <ElOption label="中" value="medium" />
                    <ElOption label="低" value="low" />
                </ElSelect>
                <ElButton type="primary" @click="submit">添加</ElButton>
            </div>

            <!-- 筛选与统计 -->
            <div class="mb-3 flex items-center gap-2 text-sm">
                <button
                    v-for="f in FILTERS"
                    :key="f.key"
                    type="button"
                    class="rounded-md border px-2.5 py-1 text-xs"
                    :class="
                        store.filter === f.key
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-600'
                    "
                    @click="store.filter = f.key"
                >
                    {{ f.label }}
                </button>
                <span class="ml-auto text-xs text-gray-400">
                    剩余 {{ store.activeCount }} 项 · 共 {{ store.items.length }} 项
                </span>
                <button v-if="store.items.some((t) => t.done)" type="button" class="text-xs text-gray-400 underline" @click="store.clearDone">
                    清除已完成
                </button>
            </div>

            <!-- 列表四态 -->
            <p v-if="store.filtered.length === 0" class="rounded-md bg-gray-50 px-4 py-8 text-center text-sm text-gray-400 dark:bg-gray-800">
                {{ store.items.length === 0 ? '还没有待办,从上方添加第一条' : '当前筛选下没有待办' }}
            </p>
            <ul v-else class="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                <li v-for="t in store.filtered" :key="t.id" class="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <input type="checkbox" class="accent-primary-600" :checked="t.done" @change="store.toggle(t.id)" />
                    <template v-if="editingId === t.id">
                        <ElInput v-model="editingText" size="small" class="!w-56" @keyup.enter="commitEdit" @blur="commitEdit" />
                    </template>
                    <span
                        v-else
                        class="flex-1 cursor-text"
                        :class="{ 'text-gray-400 line-through': t.done }"
                        title="双击编辑"
                        @dblclick="startEdit(t)"
                    >
                        {{ t.text }}
                    </span>
                    <ElTag :type="PRIORITY_META[t.priority].type" size="small">{{ PRIORITY_META[t.priority].label }}</ElTag>
                    <button type="button" class="text-xs text-gray-300 hover:text-red-500 dark:text-gray-600" aria-label="删除" @click="store.remove(t.id)">
                        ✕
                    </button>
                </li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
