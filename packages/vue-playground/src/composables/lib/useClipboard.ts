/**
 * ============================================================================
 * useClipboard — 剪贴板复制
 * ============================================================================
 *
 * 复制 + 短暂的「已复制」反馈态;反馈态自动复位,不用调用方管理。
 *
 * @module composables/lib/useClipboard
 */

import { onUnmounted, ref } from 'vue';

/**
 * @param resetDelay 「已复制」状态自动复位的毫秒数,默认 1500
 * @example const { copied, copy } = useClipboard()
 */
export function useClipboard(resetDelay = 1500) {
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;

    const copy = async (text: string) => {
        await navigator.clipboard.writeText(text);
        copied.value = true;
        if (timer) {clearTimeout(timer);}
        timer = setTimeout(() => (copied.value = false), resetDelay);
    };

    onUnmounted(() => {
        if (timer) {clearTimeout(timer);}
    });

    return { copied, copy };
}
