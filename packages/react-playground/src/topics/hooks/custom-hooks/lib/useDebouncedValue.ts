/**
 * ============================================================================
 * useDebouncedValue.ts — 防抖值
 * ============================================================================
 *
 * 教学定位:演示「副作用自清理」原则 —— value/delay 每次变化都重置定时器,
 * cleanup 保证只有最后一次变化在 delay 后生效;组件卸载时定时器被清除,
 * 不会写已卸载组件的 state。
 *
 * @module topics/hooks/custom-hooks/lib/useDebouncedValue
 */

import { useEffect, useState } from 'react';

/**
 * 把高频变化的 value 防抖为低频输出的稳定值。
 *
 * @param value 输入值(如每次击键的输入框文本)
 * @param delay 防抖间隔毫秒数,默认 300
 * @returns 防抖后的值;value 静止 delay 毫秒后才跟进
 *
 * @example
 * const debouncedKeyword = useDebouncedValue(keyword, 400);
 * useEffect(() => { search(debouncedKeyword); }, [debouncedKeyword]);
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // 每次 value/delay 变化都重新计时;cleanup 清掉上一个定时器,
        // 快速连续变化时只有最后一次能走到 setDebouncedValue
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
