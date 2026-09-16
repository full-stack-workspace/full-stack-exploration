/**
 * ============================================================================
 * hooks.test.tsx — React 适配层 Selector 契约测试
 * ============================================================================
 *
 * 验证 useRuntimeSelector 的两条核心契约:
 * - 快照未变时 selector 不重算、返回值引用稳定;
 * - 无关切片更新时选中值复用旧引用(结构共享 + Object.is 精准订阅)。
 *
 * @module topics/agent/react-adapter/hooks.test
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act } from 'react';

import { RuntimeStore } from '../runtime/RuntimeStore';
import type { RuntimeEvent } from '../runtime/types';
import { RuntimeProvider } from './RuntimeProvider';
import { useRuntimeSelector } from './hooks';

/** 注入固定 store 的 Provider 包装器 */
const createWrapper = (store: RuntimeStore) => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
        <RuntimeProvider store={store}>{children}</RuntimeProvider>
    );
    return Wrapper;
};

const seedStore = (store: RuntimeStore) => {
    const events: RuntimeEvent[] = [
        {
            type: 'conversation.created',
            eventId: 'e-conv',
            conversation: { id: 'conv-1', title: 't', messageIds: [] },
        },
        {
            type: 'message.appended',
            eventId: 'e-msg',
            message: { id: 'msg-1', conversationId: 'conv-1', role: 'assistant', partIds: [] },
        },
        {
            type: 'part.started',
            eventId: 'e-p1',
            part: { id: 'p1', messageId: 'msg-1', type: 'text', content: '', state: 'streaming' },
        },
        {
            type: 'part.started',
            eventId: 'e-p2',
            part: { id: 'p2', messageId: 'msg-1', type: 'text', content: '', state: 'streaming' },
        },
    ];
    for (const event of events) {
        store.applyEvent(event);
    }
};

describe('useRuntimeSelector', () => {
    it('返回 selector 选中的切片', () => {
        const store = new RuntimeStore();
        seedStore(store);

        const { result } = renderHook(() => useRuntimeSelector((s) => s.partsById['p1']), {
            wrapper: createWrapper(store),
        });

        expect(result.current).toBe(store.getSnapshot().partsById['p1']);
    });

    it('无关切片更新时:选中值引用不变(Selector 隔离)', () => {
        const store = new RuntimeStore();
        seedStore(store);

        const { result } = renderHook(() => useRuntimeSelector((s) => s.partsById['p2']), {
            wrapper: createWrapper(store),
        });
        const before = result.current;

        // 更新 part-1,与订阅 part-2 的组件无关
        act(() => {
            store.applyEvent({ type: 'part.delta', eventId: 'e-d1', partId: 'p1', delta: 'x' });
        });

        expect(result.current).toBe(before);
    });

    it('相关切片更新时:选中值换新引用', () => {
        const store = new RuntimeStore();
        seedStore(store);

        const { result } = renderHook(() => useRuntimeSelector((s) => s.partsById['p1']), {
            wrapper: createWrapper(store),
        });
        const before = result.current;

        act(() => {
            store.applyEvent({ type: 'part.delta', eventId: 'e-d1', partId: 'p1', delta: 'x' });
        });

        expect(result.current).not.toBe(before);
        expect(result.current?.type === 'text' && result.current.content).toBe('x');
    });

    it('快照缓存:快照未变时 selector 不重算', () => {
        const store = new RuntimeStore();
        seedStore(store);

        const selector = vi.fn((s: ReturnType<RuntimeStore['getSnapshot']>) => s.partsById['p1']);
        const { result, rerender } = renderHook(() => useRuntimeSelector(selector), {
            wrapper: createWrapper(store),
        });
        const before = result.current;
        const callsAfterMount = selector.mock.calls.length;

        // 无任何 Store 更新,仅组件自身重渲染 → selector 不应重算,引用不变
        rerender();

        expect(selector.mock.calls.length).toBe(callsAfterMount);
        expect(result.current).toBe(before);
    });
});
