/**
 * ============================================================================
 * hooks.ts — Runtime Store 的 React 适配 Hooks
 * ============================================================================
 *
 * 基于 useSyncExternalStore 封装的三层订阅入口:
 * - useRuntimeStore    取 Context 中的稳定 store 实例(发命令用)
 * - useRuntimeSnapshot 订阅整份快照(版本号、全局状态用)
 * - useRuntimeSelector 手写 Selector:快照缓存 + Object.is 精准订阅,
 *   不引入 use-sync-external-store/with-selector 等任何新依赖
 *
 * @module topics/agent/react-adapter/hooks
 */

import { useCallback, useContext, useRef, useSyncExternalStore } from 'react';

import type { RuntimeSnapshot } from '../runtime/types';
import type { RuntimeStore } from '../runtime/RuntimeStore';
import { RuntimeContext } from './RuntimeProvider';

/**
 * 取出 Provider 注入的 RuntimeStore 实例。
 * 用于「发命令」场景(applyEvent / reset),不订阅数据。
 *
 * @returns RuntimeStore 稳定实例
 * @throws 在 RuntimeProvider 之外调用时抛错
 */
export function useRuntimeStore(): RuntimeStore {
    const store = useContext(RuntimeContext);
    if (!store) {
        throw new Error('useRuntimeStore 必须在 RuntimeProvider 内使用');
    }
    return store;
}

/**
 * 订阅整份 Runtime 快照。任何有效事件都会触发重渲染,
 * 适合版本号、事件计数等「关心整体」的组件;
 * 高频流式场景请改用 useRuntimeSelector 精准订阅。
 */
export function useRuntimeSnapshot(): RuntimeSnapshot {
    const store = useRuntimeStore();
    return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/**
 * 手写 Selector 订阅:只有 selector 选中的切片引用变化时才重渲染。
 *
 * 实现要点(替代 with-selector 包):
 * 1. getSelection 内部做快照缓存 —— 快照引用未变时直接返回缓存的选中值,
 *    保证 getSnapshot 契约(引用稳定),React 的 Object.is 才不会误判;
 * 2. 选中值经 isEqual 比较后与旧值等价时复用旧引用,进一步避免无效渲染;
 * 3. subscribe 直接透传 store.subscribe(引用稳定),不会因重复订阅抖动。
 *
 * 前提:Store 必须不可变更新 + 结构共享(见 runtime/reducer.ts),
 * 且 selector 每次渲染应传入稳定的切片路径(如按 id 取实体),不要内联
 * `Object.values(...).filter(...)` 这类每次返回新数组的写法。
 *
 * @param selector 从快照中选取切片的纯函数
 * @param isEqual 选中值等价判断,默认 Object.is;传自定义函数时请保持引用稳定
 *
 * @example
 * const part = useRuntimeSelector((s) => s.partsById[partId]);
 */
export function useRuntimeSelector<Selected>(
    selector: (snapshot: RuntimeSnapshot) => Selected,
    isEqual: (a: Selected, b: Selected) => boolean = Object.is,
): Selected {
    const store = useRuntimeStore();

    // 最新 selector 走 ref:getSelection 保持引用稳定,又能读到最新闭包(如 partId 变化)
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    // 选中值缓存:{ 计算时所基于的快照, 选中结果 }
    const cacheRef = useRef<{ snapshot: RuntimeSnapshot; selected: Selected } | null>(null);

    const getSelection = useCallback((): Selected => {
        const snapshot = store.getSnapshot();
        const cache = cacheRef.current;

        // 快照引用未变 → 直接复用缓存,满足 getSnapshot 引用稳定契约
        if (cache && Object.is(cache.snapshot, snapshot)) {
            return cache.selected;
        }

        const selected = selectorRef.current(snapshot);

        // 快照变了但选中切片等价 → 复用旧选中引用,让 React 跳过本次渲染
        if (cache && isEqual(cache.selected, selected)) {
            cacheRef.current = { snapshot, selected: cache.selected };
            return cache.selected;
        }

        cacheRef.current = { snapshot, selected };
        return selected;
    }, [store, isEqual]);

    // 本演练为纯 CSR,getServerSnapshot 复用同一读取函数即可(它同样满足引用稳定)
    return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}
