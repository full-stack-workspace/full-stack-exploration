/**
 * @file useLocalStorage.ts
 *
 * @description A hook for using localStorage in a React component
 */
import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';

/**
 * 该自定义 Hook 用于在 React 组件中简化 localStorage 的读写流程。
 * 它在初始化时从 localStorage 读取数据（若不存在则用 fallback），
 * 并保证每当 value 或 key 改变时自动同步到 localStorage。
 *
 * @param key - The key to use for the localStorage item
 * @param fallback - The fallback value to use if the localStorage item is not found
 *
 * @returns A tuple containing the value and the setter function
 *
 * @example
 * const [value, setValue] = useLocalStorage('key', 'defaultValue');
 * return <div>{value}</div>;
 */
export function useLocalStorage<T>(
    key: string,
    fallback: T,
): [T, Dispatch<SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : fallback;
        } catch {
            return fallback;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* quota exceeded — silently ignore */
        }
    }, [key, value]);

    return [value, setValue];
}
