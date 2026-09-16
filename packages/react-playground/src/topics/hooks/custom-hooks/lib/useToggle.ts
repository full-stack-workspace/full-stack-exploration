/**
 * ============================================================================
 * useToggle.ts — 布尔状态开关
 * ============================================================================
 *
 * 教学定位:最小完整的自定义 Hook 范本,演示「返回值引用稳定性」原则 ——
 * 所有操作函数经 useCallback 稳定化,actions 对象经 useMemo 稳定化,
 * 下游 memo 组件不会因重渲染而失效。
 *
 * @module topics/hooks/custom-hooks/lib/useToggle
 */

import { useCallback, useMemo, useState } from 'react';

/** useToggle 暴露的操作集,引用跨渲染稳定 */
export interface ToggleActions {
    /** 取反 */
    toggle: () => void;
    /** 置为 true */
    setTrue: () => void;
    /** 置为 false */
    setFalse: () => void;
}

/**
 * 管理一个布尔状态。
 *
 * @param initialValue 初始值,默认 false
 * @returns [当前值, 稳定引用操作集] 的元组
 *
 * @example
 * const [open, { toggle, setFalse }] = useToggle();
 */
export function useToggle(initialValue = false): [boolean, ToggleActions] {
    const [value, setValue] = useState(initialValue);

    // 全部走函数式更新 / 常量写入,不依赖当前值 → deps 为空,引用永远稳定
    const toggle = useCallback(() => setValue((v) => !v), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);

    // actions 对象本身也稳定化:否则每次渲染都是新对象,下游 useMemo/memo 失效
    const actions = useMemo<ToggleActions>(
        () => ({ toggle, setTrue, setFalse }),
        [toggle, setTrue, setFalse],
    );

    return [value, actions];
}
