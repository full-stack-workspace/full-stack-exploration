/**
 * ============================================================================
 * RuntimeProvider.tsx — Runtime Store 的依赖注入容器
 * ============================================================================
 *
 * 通过 Context 把 RuntimeStore 实例注入子树。关键设计:
 * Context 只传递「稳定的 store 实例」,不传递快照数据 ——
 * 快照的读取与订阅交给 useSyncExternalStore(hooks.ts),
 * 否则任何 Store 更新都会连坐重渲染所有读 Context 的组件。
 *
 * @module topics/agent/react-adapter/RuntimeProvider
 */

import { createContext, useRef } from 'react';
import type { ReactNode } from 'react';

import { RuntimeStore } from '../runtime/RuntimeStore';

/** 只承载稳定实例的 Context;快照不经过这里 */
export const RuntimeContext = createContext<RuntimeStore | null>(null);

interface RuntimeProviderProps {
    /**
     * 可选的外部 store 实例(测试注入用);
     * 不传时在首次渲染惰性创建,之后引用保持稳定。
     */
    store?: RuntimeStore;
    children: ReactNode;
}

/**
 * @example
 * <RuntimeProvider>
 *   <AgentChatPanel />
 * </RuntimeProvider>
 */
export const RuntimeProvider = ({ store, children }: RuntimeProviderProps) => {
    // useRef 惰性创建:避免每次渲染 new 一个 store 导致状态丢失、反复重订阅
    const storeRef = useRef<RuntimeStore | null>(null);
    if (storeRef.current === null) {
        storeRef.current = store ?? new RuntimeStore();
    }

    return (
        <RuntimeContext.Provider value={storeRef.current}>{children}</RuntimeContext.Provider>
    );
};
