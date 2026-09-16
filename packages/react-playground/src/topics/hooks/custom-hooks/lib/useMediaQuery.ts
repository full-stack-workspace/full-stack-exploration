/**
 * ============================================================================
 * useMediaQuery.ts — 响应式媒体查询
 * ============================================================================
 *
 * 教学定位:回扣 Agent 专题 —— matchMedia 正是一个「React 之外的可变
 * 数据源」,用 useSyncExternalStore 订阅它是教科书场景:
 * change 事件作 subscribe,mql.matches 作 getSnapshot(原始布尔值,
 * 天然引用稳定),getServerSnapshot 固定 false(SSr 无法知晓视口)。
 *
 * @module topics/hooks/custom-hooks/lib/useMediaQuery
 */

import { useCallback, useSyncExternalStore } from 'react';

/**
 * 订阅一条 CSS 媒体查询的匹配结果。
 *
 * @param query 媒体查询串,如 '(min-width: 768px)'
 * @returns 当前是否匹配;窗口变化时自动更新
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * const isDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
    // subscribe / getSnapshot 都用 useCallback 按 query 稳定化:
    // 内联函数会让 useSyncExternalStore 每次渲染都退订重订
    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const mql = window.matchMedia(query);
            mql.addEventListener('change', onStoreChange);
            return () => mql.removeEventListener('change', onStoreChange);
        },
        [query],
    );

    // matches 是布尔原始值,Object.is 比较天然成立,无需缓存对象
    const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

    // SSR 无视口信息,固定返回 false;hydration 后 React 会自动校正
    const getServerSnapshot = useCallback(() => false, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
