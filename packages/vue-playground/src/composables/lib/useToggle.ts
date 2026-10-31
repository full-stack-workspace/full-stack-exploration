/**
 * ============================================================================
 * useToggle — 布尔开关
 * ============================================================================
 *
 * 最小原子:布尔值 + toggle/set 操作。演示「返回值用数组还是对象」的取舍。
 *
 * @module composables/lib/useToggle
 */

import { ref } from 'vue';

/**
 * @param initial 初始值,默认 false
 * @returns [state, toggle, set] 三元组
 * @example const [open, toggleOpen] = useToggle()
 */
export function useToggle(initial = false) {
    const state = ref(initial);
    const toggle = () => (state.value = !state.value);
    const set = (v: boolean) => (state.value = v);
    return [state, toggle, set] as const;
}
