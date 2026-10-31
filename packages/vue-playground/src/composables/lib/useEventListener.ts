/**
 * ============================================================================
 * useEventListener — 事件监听自动清理
 * ============================================================================
 *
 * 把「挂载注册、卸载移除」收进一个函数;支持 window/document/元素 ref。
 * 卸载自动清理是组合式函数的核心红利——调用方再也写不出泄漏。
 *
 * @module composables/lib/useEventListener
 */

import { onMounted, onUnmounted, type Ref,unref } from 'vue';

type MaybeRefTarget = EventTarget | Ref<EventTarget | null> | null;

/**
 * @example useEventListener(window, 'resize', onResize)
 * @example useEventListener(buttonRef, 'click', onClick)
 */
export function useEventListener(
    target: MaybeRefTarget,
    event: string,
    callback: EventListener,
    options?: AddEventListenerOptions,
) {
    let el: EventTarget | null = null;
    onMounted(() => {
        el = unref(target);
        el?.addEventListener(event, callback, options);
    });
    onUnmounted(() => {
        el?.removeEventListener(event, callback, options);
        el = null;
    });
}
