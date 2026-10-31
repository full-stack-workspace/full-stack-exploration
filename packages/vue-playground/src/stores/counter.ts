/**
 * ============================================================================
 * counter — Pinia 核心演示 store(setup 风格)
 * ============================================================================
 *
 * setup 风格 store:ref 即 state,computed 即 getter,function 即 action。
 * 与选项式 defineStore('id', { state, getters, actions }) 等价,
 * 但类型推断与组合式函数复用更自然。
 *
 * @module stores/counter
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useCounterStore = defineStore('counter', () => {
    /* ---- state ---- */
    const count = ref(0);
    const step = ref(1);

    /* ---- getters:就是 computed ---- */
    const doubleCount = computed(() => count.value * 2);
    const isEven = computed(() => count.value % 2 === 0);

    /* ---- actions:就是普通函数,可以是异步的 ---- */
    const increment = () => (count.value += step.value);
    const incrementAsync = async (ms = 500) => {
        await new Promise((r) => setTimeout(r, ms));
        count.value += step.value;
    };
    const reset = () => {
        count.value = 0;
        step.value = 1;
    };

    return { count, step, doubleCount, isEven, increment, incrementAsync, reset };
});
