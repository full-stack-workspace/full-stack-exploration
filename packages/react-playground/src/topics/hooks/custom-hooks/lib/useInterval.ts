/**
 * ============================================================================
 * useInterval.ts — 声明式定时器
 * ============================================================================
 *
 * 教学定位:演示「回调 ref 模式」—— 把最新 callback 存进 ref,
 * interval 的 effect 只依赖 delay。既不用为了新闭包反复重置定时器,
 * 也永远不会调到过期闭包里的旧值。delay 传 null 即暂停。
 *
 * @module topics/hooks/custom-hooks/lib/useInterval
 */

import { useEffect, useRef } from 'react';

/**
 * 以 delay 间隔反复执行 callback。
 *
 * @param callback 每次触发的回调;内部永远调用最新一次渲染传入的版本
 * @param delay 间隔毫秒数;传 null 暂停
 *
 * @example
 * const [count, setCount] = useState(0);
 * useInterval(() => setCount((c) => c + 1), running ? 1000 : null);
 */
export function useInterval(callback: () => void, delay: number | null): void {
    const callbackRef = useRef(callback);

    // 每次渲染后同步最新回调;不放进 interval 的 effect deps,
    // 否则 callback 每变一次定时器就重建一次,计时节拍被打断
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) {
            return;
        }
        // 通过 ref 调用:闭包旧值问题在 useInterval 层面被根治
        const id = setInterval(() => callbackRef.current(), delay);
        return () => clearInterval(id);
    }, [delay]);
}
