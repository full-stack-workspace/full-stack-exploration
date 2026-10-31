/**
 * ============================================================================
 * bookkeeping — 记账本 store 与类型
 * ============================================================================
 *
 * 综合应用「记账本」的领域 store:账目 CRUD、分类两级字典、
 * 汇总统计(收支合计、按分类分组),记录持久化到 localStorage。
 *
 * @module topics/apps/bookkeeping/store
 */

import { defineStore } from 'pinia';
import { computed } from 'vue';

import { useLocalStorage } from '@/composables/lib';

export interface Entry {
    id: number;
    type: 'expense' | 'income';
    category: string;
    sub: string;
    amount: number;
    note: string;
    date: string;
}

/** 两级分类字典:大类 → 子类(表单联动数据源) */
export const CATEGORY_MAP: Record<string, string[]> = {
    餐饮: ['正餐', '咖啡茶饮', '零食水果'],
    交通: ['公交地铁', '打车', '加油'],
    居住: ['房租', '水电煤', '日用品'],
    娱乐: ['电影', '游戏', '旅行'],
    工资: ['月薪', '奖金', '报销'],
};

export const useBookkeepingStore = defineStore('apps-bookkeeping', () => {
    /* ---- state(持久化) ---- */
    const entries = useLocalStorage<Entry[]>('vue-pg-entries', []);

    /* ---- getters ---- */
    const totalExpense = computed(() =>
        entries.value.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    );
    const totalIncome = computed(() =>
        entries.value.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0),
    );
    const balance = computed(() => totalIncome.value - totalExpense.value);
    /** 按大类分组汇总(表格展示用) */
    const byCategory = computed(() => {
        const map = new Map<string, number>();
        for (const e of entries.value) {
            if (e.type !== 'expense') {continue;}
            map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
        }
        return [...map.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
    });

    /* ---- actions ---- */
    const add = (entry: Omit<Entry, 'id'>) => {
        entries.value.unshift({ ...entry, id: Date.now() });
    };
    const remove = (id: number) => {
        entries.value = entries.value.filter((e) => e.id !== id);
    };

    return { entries, totalExpense, totalIncome, balance, byCategory, add, remove };
});
