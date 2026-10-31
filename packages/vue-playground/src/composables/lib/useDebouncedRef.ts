/**
 * ============================================================================
 * useDebouncedRef — 值防抖
 * ============================================================================
 *
 * 输入源变化后,延迟 delay 毫秒才同步到 debounced;高频输入(搜索框)
 * 只取「停下来之后的最终值」。组件卸载时自动清定时器。
 *
 * @module composables/lib/useDebouncedRef
 */

import { onUnmounted, type Ref,ref, watch } from 'vue';

/**
 * @param source 源 ref
 * @param delay 防抖毫秒数,默认 300
 * @returns 延迟同步的只读 ref
 * @example const debouncedKeyword = useDebouncedRef(keyword, 300)
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
    const debounced = ref(source.value) as Ref<T>;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = watch(source, (v) => {
        if (timer) {clearTimeout(timer);}
        timer = setTimeout(() => (debounced.value = v), delay);
    });

    onUnmounted(() => {
        // 双保险:watch 随组件卸载自动停止,定时器需要手动清
        if (timer) {clearTimeout(timer);}
        stop();
    });

    return debounced;
}
