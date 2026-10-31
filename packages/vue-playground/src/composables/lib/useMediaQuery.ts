/**
 * ============================================================================
 * useMediaQuery — 媒体查询响应式桥
 * ============================================================================
 *
 * 把 matchMedia 的结果桥接成 ref,媒体查询状态变化自动更新。
 * 注意:matchMedia 的监听在组合式函数里手动挂/卸(它不随 watch 自动清理)。
 *
 * @module composables/lib/useMediaQuery
 */

import { onMounted, onUnmounted, ref } from 'vue';

/**
 * @param query 媒体查询字符串,如 '(max-width: 768px)'
 * @returns 是否命中的响应式布尔值
 * @example const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string) {
    const matches = ref(false);
    let mql: MediaQueryList | null = null;

    const update = () => {
        if (mql) {matches.value = mql.matches;}
    };

    onMounted(() => {
        mql = window.matchMedia(query);
        update();
        mql.addEventListener('change', update);
    });
    onUnmounted(() => {
        mql?.removeEventListener('change', update);
        mql = null;
    });

    return matches;
}
