/**
 * ============================================================================
 * useLocalStorage — localStorage 双向同步
 * ============================================================================
 *
 * 读取时反序列化、写入时持久化;序列化失败回退默认值。
 * 演示「副作用读写 + 容错」的封装范式。
 *
 * @module composables/lib/useLocalStorage
 */

import { type Ref,ref, watch } from 'vue';

/**
 * @param key 存储键
 * @param initial 默认值(无存储或反序列化失败时使用)
 * @example const theme = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(key: string, initial: T): Ref<T> {
    const read = (): T => {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? initial : (JSON.parse(raw) as T);
        } catch {
            // 存储内容损坏时回退默认值,不让脏数据击穿 UI
            return initial;
        }
    };

    const state = ref(read()) as Ref<T>;
    watch(
        state,
        (v) => {
            try {
                localStorage.setItem(key, JSON.stringify(v));
            } catch {
                // 隐私模式/配额满等写入失败场景静默降级:内存态仍可用
            }
        },
        { deep: true },
    );
    return state;
}
