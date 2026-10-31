/**
 * ============================================================================
 * todo — 待办事项 store
 * ============================================================================
 *
 * 综合应用「待办清单」的领域 store:CRUD、筛选、优先级,
 * 整个列表经 useLocalStorage 持久化(刷新不丢)。
 *
 * @module topics/apps/todo/store
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useLocalStorage } from '@/composables/lib';

export interface TodoItem {
    id: number;
    text: string;
    done: boolean;
    priority: 'high' | 'medium' | 'low';
    createdAt: number;
}

export type TodoFilter = 'all' | 'active' | 'done';

export const useTodoStore = defineStore('apps-todo', () => {
    /* ---- state(持久化) ---- */
    const items = useLocalStorage<TodoItem[]>('vue-pg-todos', []);
    const filter = ref<TodoFilter>('all');

    /* ---- getters ---- */
    const filtered = computed(() => {
        if (filter.value === 'active') {return items.value.filter((t) => !t.done);}
        if (filter.value === 'done') {return items.value.filter((t) => t.done);}
        return items.value;
    });
    const activeCount = computed(() => items.value.filter((t) => !t.done).length);

    /* ---- actions ---- */
    const add = (text: string, priority: TodoItem['priority'] = 'medium') => {
        const trimmed = text.trim();
        if (!trimmed) {return;}
        items.value.unshift({ id: Date.now(), text: trimmed, done: false, priority, createdAt: Date.now() });
    };
    const toggle = (id: number) => {
        const t = items.value.find((t) => t.id === id);
        if (t) {t.done = !t.done;}
    };
    const update = (id: number, text: string) => {
        const t = items.value.find((t) => t.id === id);
        if (t && text.trim()) {t.text = text.trim();}
    };
    const remove = (id: number) => {
        items.value = items.value.filter((t) => t.id !== id);
    };
    const clearDone = () => {
        items.value = items.value.filter((t) => !t.done);
    };

    return { items, filter, filtered, activeCount, add, toggle, update, remove, clearDone };
});
