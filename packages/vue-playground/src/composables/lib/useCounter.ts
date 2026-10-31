/**
 * ============================================================================
 * useCounter — 带边界的计数器
 * ============================================================================
 *
 * 演示「返回对象 + 方法语义化」:inc/dec/reset/set,支持 min/max 边界钳制。
 *
 * @module composables/lib/useCounter
 */

import { ref } from 'vue';

/**
 * @param initial 初始值
 * @param options min/max 边界(超出会被钳制)
 * @example const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })
 */
export function useCounter(initial = 0, options: { min?: number; max?: number } = {}) {
    const clamp = (v: number) =>
        Math.min(options.max ?? Number.POSITIVE_INFINITY, Math.max(options.min ?? Number.NEGATIVE_INFINITY, v));
    const count = ref(clamp(initial));
    const inc = (step = 1) => (count.value = clamp(count.value + step));
    const dec = (step = 1) => (count.value = clamp(count.value - step));
    const set = (v: number) => (count.value = clamp(v));
    const reset = () => (count.value = clamp(initial));
    return { count, inc, dec, set, reset };
}
