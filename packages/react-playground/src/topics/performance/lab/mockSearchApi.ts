/**
 * ============================================================================
 * mockSearchApi.ts — 带随机延迟与 AbortSignal 的搜索接口
 * ============================================================================
 *
 * 模拟真实搜索后端:300–800ms 随机延迟(可用 delay 覆盖,
 * 测试与「慢化特定请求」演示用),响应回显关键字 ——
 * UI 据此检测「结果与当前输入不一致」的 stale 现象。
 *
 * @module topics/performance/lab/mockSearchApi
 */

/** 搜索响应:回显关键字,便于 stale 检测 */
export interface SearchResponse {
    keyword: string;
    results: string[];
}

/** 本地词库:搜索 = 前缀/包含匹配 */
const WORDS: readonly string[] = [
    'apple', 'application', 'appetite', 'ape', 'apricot',
    'banana', 'bandwidth', 'battery', 'buffer',
    'cache', 'callback', 'canvas', 'closure', 'component', 'concurrent',
    'debounce', 'deferred', 'dispatch',
    'effect', 'element', 'event',
    'fiber', 'fragment', 'frame',
    'hook', 'hydration',
    'input', 'interval',
    'lane', 'layout', 'list',
    'memo', 'mutation',
    'props', 'priority', 'profiler',
    'react', 'reconcile', 'reducer', 'render', 'resource',
    'scheduler', 'skeleton', 'state', 'suspense', 'sync',
    'throttle', 'transition', 'tree',
    'update', 'urgent',
    'virtual', 'viewport',
];

export interface SearchOptions {
    signal?: AbortSignal;
    /** 覆盖随机延迟(毫秒);不传则 300–800ms 随机 */
    delay?: number;
}

/**
 * 搜索词库。
 *
 * @param keyword 关键字(空串返回空结果)
 * @param options.signal 取消信号:abort 后立即 reject
 * @param options.delay 固定延迟覆盖
 * @returns 延迟后 resolve 回显关键字的响应
 */
export function searchItems(keyword: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const { signal, delay } = options;

    return new Promise<SearchResponse>((resolve, reject) => {
        const wait = delay ?? 300 + Math.random() * 500;
        const timer = setTimeout(() => {
            cleanup();
            const trimmed = keyword.trim().toLowerCase();
            const results =
                trimmed === '' ? [] : WORDS.filter((word) => word.includes(trimmed));
            resolve({ keyword, results });
        }, wait);

        const onAbort = () => {
            clearTimeout(timer);
            cleanup();
            reject(new Error('请求已被取消(abort)'));
        };
        const cleanup = () => signal?.removeEventListener('abort', onAbort);

        if (signal?.aborted) {
            clearTimeout(timer);
            reject(new Error('请求已被取消(abort)'));
            return;
        }
        signal?.addEventListener('abort', onAbort);
    });
}
