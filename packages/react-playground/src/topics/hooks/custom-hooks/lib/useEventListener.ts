/**
 * ============================================================================
 * useEventListener.ts — 声明式事件监听
 * ============================================================================
 *
 * 教学定位:同样演示「回调 ref 模式」—— handler 走 ref,
 * effect 只依赖 target/type,handler 每天变一百遍也不重新挂监听。
 * 目标支持 window / document / 元素 ref 三类,订阅与退订严格成对。
 *
 * @module topics/hooks/custom-hooks/lib/useEventListener
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/** 支持的事件目标:浏览器全局对象,或指向元素的 ref */
export type EventListenerTarget =
    | Window
    | Document
    | HTMLElement
    | RefObject<HTMLElement | null>
    | null;

/**
 * 给目标对象挂事件监听,组件卸载或 target/type 变化时自动退订。
 *
 * @param target window / document / 元素 / 元素 ref;为 null 时不挂(元素还没渲染出来)
 * @param type 事件名,如 'resize' / 'keydown' / 'click'
 * @param handler 事件处理函数;内部永远调用最新版本
 * @param options 原生 addEventListener 的第三个参数;注意传对象时需自行稳定引用
 *
 * @example
 * useEventListener(window, 'resize', () => setWidth(window.innerWidth));
 */
export function useEventListener(
    target: EventListenerTarget,
    type: string,
    handler: (event: Event) => void,
    options?: Parameters<HTMLElement['addEventListener']>[2],
): void {
    const handlerRef = useRef(handler);

    // 最新 handler 走 ref:effect 不因 handler 变化而重新挂监听
    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        // ref 目标先解引用;ref.current 为 null(未挂载)时跳过
        const element: Window | Document | HTMLElement | null =
            target !== null && 'current' in target ? target.current : target;
        if (!element) {
            return;
        }
        const listener = (event: Event) => handlerRef.current(event);
        element.addEventListener(type, listener, options);
        // 订阅与退订严格成对,StrictMode 双执行下也不泄漏
        return () => element.removeEventListener(type, listener, options);
    }, [target, type, options]);
}
