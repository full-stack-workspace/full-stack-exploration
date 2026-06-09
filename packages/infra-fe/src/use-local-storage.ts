/**
 * ============================================================================
 * useLocalStorage — SSR 安全的 localStorage 状态 Hook
 * ============================================================================
 *
 * 将 localStorage 键值对绑定到 React 状态，支持 JSON 序列化/反序列化。
 *
 * 功能特点：
 * - SSR 安全：服务端渲染时使用初始值，客户端 hydration 后同步存储值
 * - JSON 序列化：自动处理对象/数组的序列化与反序列化
 * - 跨标签页同步：监听 storage 事件，多标签页状态保持一致
 * - 类型安全：泛型支持任意 JSON 可序列化类型
 *
 * @module src/use-local-storage
 *
 * @example
 * ```tsx
 * import { useLocalStorage } from '@/use-local-storage';
 *
 * function ThemeSwitcher() {
 *   const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('app-theme', 'light');
 *
 *   return (
 *     <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
 *       Current: {theme}
 *     </button>
 *   );
 * }
 * ```
 */

import { useCallback,useEffect, useState } from "react";

/* =================================================================
 * Types
 * ================================================================ */

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

/* =================================================================
 * Helper
 * ================================================================ */

function readValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {return fallback;}

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {return fallback;}
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* =================================================================
 * Hook
 * ================================================================ */

/**
 * 将状态持久化到 localStorage 的 Hook。
 *
 * @param key - localStorage 键名
 * @param fallback - 初始值（存储中无对应键时使用）
 * @returns [value, setValue] — 与 useState 相同的元组
 */
export function useLocalStorage<T>(key: string, fallback: T): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(() => readValue(key, fallback));

  /* ---- Setter：同时更新状态和 localStorage ---- */
  const set: SetValue<T> = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // quota exceeded 等情况，静默失败但状态已更新
        }
        return resolved;
      });
    },
    [key],
  );

  /* ---- 跨标签页同步 ---- */
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          // ignore parse errors from other tabs
        }
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, set];
}
