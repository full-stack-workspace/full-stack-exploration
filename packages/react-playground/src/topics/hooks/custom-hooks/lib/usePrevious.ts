/**
 * ============================================================================
 * usePrevious.ts — 上一次的值
 * ============================================================================
 *
 * 教学定位:演示 ref 的本质 —— 「跨渲染存活、修改不触发渲染的盒子」。
 * render 期间读到的 ref.current 永远是「上一次提交后写入的值」,
 * 因此天然拿到上一个渲染周期的 value。
 *
 * @module topics/hooks/custom-hooks/lib/usePrevious
 */

import { useEffect, useRef } from 'react';

/**
 * 返回 value 在上一次渲染时的值(首次渲染为 undefined)。
 *
 * @param value 需要追踪的值
 * @returns 上一次渲染的值
 *
 * @example
 * const prevCount = usePrevious(count);
 * // count 从 1 变 2 的这次渲染中:count === 2,prevCount === 1
 */
export function usePrevious<T>(value: T): T | undefined {
    const previousRef = useRef<T | undefined>(undefined);

    // 提交后才写入:本次 render 读到的仍是上一次的值;
    // 若放在 render 期间直接写 ref,会破坏并发渲染的可重入性
    useEffect(() => {
        previousRef.current = value;
    }, [value]);

    return previousRef.current;
}
