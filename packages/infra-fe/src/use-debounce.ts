/**
 * ============================================================================
 * useDebounce — 防抖 Hook
 * ============================================================================
 *
 * 对快速变化的值进行防抖处理，常用于搜索输入、窗口 resize 等高频场景。
 *
 * 功能特点：
 * - 可配置延迟时间（毫秒）
 * - 组件卸载时自动清理定时器，避免内存泄漏
 * - 类型安全：泛型支持任意值类型
 *
 * @module src/use-debounce
 *
 * @example
 * ```tsx
 * import { useDebounce } from '@/use-debounce';
 *
 * function SearchBox() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) fetchResults(debouncedQuery);
 *   }, [debouncedQuery]);
 *
 *   return <input value={query} onChange={e => setQuery(e.target.value)} />;
 * }
 * ```
 */

import { useEffect,useState } from "react";

/* =================================================================
 * Hook
 * ================================================================ */

/**
 * 对值进行防抖处理，在指定延迟后返回最新值。
 *
 * @param value - 需要防抖的值
 * @param delayMs - 延迟时间（毫秒），默认 300
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
