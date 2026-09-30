/**
 * @file useLocalStorage.ts
 *
 * @description A hook for using localStorage in a React component
 */
import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from 'react';

/**
 * 读取指定 key 的存储值;不存在或解析失败(脏数据/隐私模式抛错)时降级到 fallback
 */
function readStored<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

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
    const [value, setValue] = useState<T>(() => readStored(key, fallback));

    // 用 ref 记住上一轮的 key:useState 惰性初始化只读首次 key,
    // key 变化时必须先重读新 key 的已有值,而不是把旧 value 直接写过去
    const prevKeyRef = useRef(key);

    useEffect(() => {
        if (prevKeyRef.current !== key) {
            prevKeyRef.current = key;
            setValue(readStored(key, fallback));
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* quota exceeded — silently ignore */
        }
    }, [key, value, fallback]);

    return [value, setValue];
}
