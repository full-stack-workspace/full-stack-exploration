/**
 * ============================================================================
 * shopping-cart — 购物车 store 与商品 mock
 * ============================================================================
 *
 * 综合应用「购物车」的领域 store:商品目录(mock)、搜索过滤、
 * 购物车明细与派生计算(总数/总价),演示「派生值一律 computed」。
 *
 * @module topics/apps/shopping-cart/store
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
}

export const PRODUCTS: Product[] = [
    { id: 1, name: '机械键盘', price: 399, category: '外设' },
    { id: 2, name: '人体工学椅', price: 1299, category: '家具' },
    { id: 3, name: '降噪耳机', price: 899, category: '外设' },
    { id: 4, name: '显示器支架', price: 199, category: '家具' },
    { id: 5, name: '桌面绿植', price: 49, category: '生活' },
    { id: 6, name: '保温杯', price: 89, category: '生活' },
    { id: 7, name: '4K 显示器', price: 1599, category: '外设' },
    { id: 8, name: '升降桌', price: 1899, category: '家具' },
];

export const useCartStore = defineStore('apps-cart', () => {
    /* ---- state ---- */
    const keyword = ref('');
    /** 购物车:商品 id → 数量 */
    const lines = ref<Record<number, number>>({});

    /* ---- getters:派生值全部 computed,不存第二份 ---- */
    const filteredProducts = computed(() => {
        const kw = keyword.value.trim().toLowerCase();
        if (!kw) {return PRODUCTS;}
        return PRODUCTS.filter((p) => p.name.toLowerCase().includes(kw) || p.category.includes(kw));
    });
    const cartEntries = computed(() =>
        Object.entries(lines.value)
            .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === Number(id))!, qty }))
            .filter((e) => e.product),
    );
    const totalCount = computed(() => cartEntries.value.reduce((s, e) => s + e.qty, 0));
    const totalPrice = computed(() => cartEntries.value.reduce((s, e) => s + e.qty * e.product.price, 0));

    /* ---- actions ---- */
    const add = (id: number) => {
        lines.value[id] = (lines.value[id] ?? 0) + 1;
    };
    const removeOne = (id: number) => {
        if (!lines.value[id]) {return;}
        lines.value[id]--;
        if (lines.value[id] <= 0) {delete lines.value[id];}
    };
    const clear = () => (lines.value = {});

    return { keyword, lines, filteredProducts, cartEntries, totalCount, totalPrice, add, removeOne, clear };
});
