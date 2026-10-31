/**
 * ============================================================================
 * useFetch — 最小可用的请求组合式函数
 * ============================================================================
 *
 * 四态(data/loading/error)+ URL 变化自动重取 + 卸载/重取时 abort 旧请求。
 * 演示「异步资源的四态模型」与竞态防护(每次新请求 abort 上一个)。
 *
 * @module composables/lib/useFetch
 */

import { onUnmounted, type Ref,ref, watch } from 'vue';

/**
 * @param url 请求地址(响应式,变化即重取)
 * @returns data / loading / error / refresh
 * @example const { data, loading, error } = useFetch(computed(() => `/api/users/${id.value}`))
 */
export function useFetch<T = unknown>(url: Ref<string>) {
    const data = ref<T | null>(null) as Ref<T | null>;
    const loading = ref(false);
    const error = ref<Error | null>(null);
    let controller: AbortController | null = null;

    const run = async () => {
        // 竞态防护:新请求发起前 abort 上一个,旧响应永远落不了地
        controller?.abort();
        controller = new AbortController();
        loading.value = true;
        error.value = null;
        try {
            const res = await fetch(url.value, { signal: controller.signal });
            if (!res.ok) {throw new Error(`HTTP ${res.status}`);}
            data.value = (await res.json()) as T;
        } catch (e) {
            // abort 是正常控制流,不算错误
            if ((e as Error).name !== 'AbortError') {error.value = e as Error;}
        } finally {
            loading.value = false;
        }
    };

    watch(url, run, { immediate: true });
    onUnmounted(() => controller?.abort());

    return { data, loading, error, refresh: run };
}
