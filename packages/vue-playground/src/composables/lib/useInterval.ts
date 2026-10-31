/**
 * ============================================================================
 * useInterval — 可暂停的响应式定时器
 * ============================================================================
 *
 * 间隔与暂停状态都是响应式的:改 delay 自动重排,pause/resume 控制启停,
 * 卸载自动清理。演示「定时器这种命令式 API 如何被响应式驯服」。
 *
 * @module composables/lib/useInterval
 */

import { onUnmounted, ref, watch } from 'vue';

/**
 * @param cb 每次触发执行的回调
 * @param delay 间隔毫秒数(响应式,改动即重排)
 * @returns counter(已触发次数)/ isActive / pause / resume
 * @example const { counter, pause, resume } = useInterval(() => tick(), 1000)
 */
export function useInterval(cb: () => void, delay = 1000) {
    const counter = ref(0);
    const isActive = ref(true);
    const delayRef = ref(delay);
    let timer: ReturnType<typeof setInterval> | null = null;

    const clear = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };
    const start = () => {
        clear();
        timer = setInterval(() => {
            counter.value++;
            cb();
        }, delayRef.value);
    };

    // delay 或启停状态变化 → 重排定时器
    watch([delayRef, isActive], ([, active]) => (active ? start() : clear()), { immediate: true });

    const pause = () => (isActive.value = false);
    const resume = () => (isActive.value = true);

    onUnmounted(clear);

    return { counter, isActive, delay: delayRef, pause, resume };
}
