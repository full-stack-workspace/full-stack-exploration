/**
 * ============================================================================
 * useLocalStorage.ts — localStorage 持久化状态
 * ============================================================================
 *
 * 教学定位:演示「懒初始化读取 + 写入异常兜底 + 函数式更新」三件套。
 * API 与 useState 完全对齐,调用方无感知地把 state 换成持久化 state。
 *
 * @module topics/hooks/custom-hooks/lib/useLocalStorage
 */

import { useCallback, useState } from 'react';

/** setValue 兼容 useState 的两种用法:直接传值 / 函数式更新 */
export type LocalStorageSetter<T> = (next: T | ((prev: T) => T)) => void;

/**
 * 状态同时写入 localStorage 的 useState。
 *
 * @param key 存储键
 * @param initialValue 无缓存或缓存损坏时的初始值
 * @returns [当前值, 写函数];写函数同步更新 state 与 localStorage
 *
 * @example
 * const [note, setNote] = useLocalStorage('my-note', '');
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): [T, LocalStorageSetter<T>] {
    // 懒初始化:只在首次渲染读一次 storage,避免每次渲染做 IO + JSON.parse;
    // JSON 损坏 / 隐私模式拒绝访问时兜底为 initialValue
    const [value, setValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`useLocalStorage 读取失败(key: ${key}),已回退初始值`, error);
            return initialValue;
        }
    });

    // 函数式更新包一层:在同一个 setState 回调里算出新值并顺手持久化,
    // 保证「写入的内容」与「state 的内容」永远是同一份,不存在竞态
    const setStoredValue = useCallback<LocalStorageSetter<T>>(
        (next) => {
            setValue((prev) => {
                const nextValue = next instanceof Function ? next(prev) : next;
                try {
                    window.localStorage.setItem(key, JSON.stringify(nextValue));
                } catch (error) {
                    // 写入失败(超配额 / 隐私模式)只告警,不阻断 state 更新
                    console.warn(`useLocalStorage 写入失败(key: ${key})`, error);
                }
                return nextValue;
            });
        },
        [key],
    );

    return [value, setStoredValue];
}
