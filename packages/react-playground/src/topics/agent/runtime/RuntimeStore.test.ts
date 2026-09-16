/**
 * ============================================================================
 * RuntimeStore.test.ts — Runtime Store 契约测试
 * ============================================================================
 *
 * 验证外部 Store 必须满足的 useSyncExternalStore 协议契约:
 * 引用稳定、有效更新、幂等去重、订阅生命周期、原子性、结构共享。
 *
 * @module topics/agent/runtime/RuntimeStore.test
 */

import { describe, expect, it, vi } from 'vitest';

import { RuntimeStore } from './RuntimeStore';
import type { RuntimeEvent } from './types';

/* ---- 测试夹具:构造各类事件 ---- */

const conversationCreated = (eventId = 'e-conv'): RuntimeEvent => ({
    type: 'conversation.created',
    eventId,
    conversation: { id: 'conv-1', title: '测试会话', messageIds: [] },
});

const messageAppended = (eventId = 'e-msg'): RuntimeEvent => ({
    type: 'message.appended',
    eventId,
    message: { id: 'msg-1', conversationId: 'conv-1', role: 'assistant', partIds: [] },
});

const partStarted = (eventId = 'e-part', partId = 'p1'): RuntimeEvent => ({
    type: 'part.started',
    eventId,
    part: { id: partId, messageId: 'msg-1', type: 'text', content: '', state: 'streaming' },
});

const partDelta = (eventId: string, partId = 'p1', delta = 'x'): RuntimeEvent => ({
    type: 'part.delta',
    eventId,
    partId,
    delta,
});

const runStatus = (eventId: string, status: 'queued' | 'running' | 'completed'): RuntimeEvent => ({
    type: 'run.status_changed',
    eventId,
    runId: 'run-1',
    status,
});

describe('RuntimeStore 契约', () => {
    it('引用稳定:无更新时 getSnapshot 重复调用返回同一引用', () => {
        const store = new RuntimeStore();
        expect(store.getSnapshot()).toBe(store.getSnapshot());
    });

    it('getServerSnapshot 同样引用稳定', () => {
        const store = new RuntimeStore();
        expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
    });

    it('有效事件产生新快照且 version + 1', () => {
        const store = new RuntimeStore();
        const previous = store.getSnapshot();

        const changed = store.applyEvent(conversationCreated());

        expect(changed).toBe(true);
        expect(store.getSnapshot()).not.toBe(previous);
        expect(store.getSnapshot().version).toBe(previous.version + 1);
    });

    it('重复 eventId 事件被幂等去重:返回原引用、不通知订阅者', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated());

        const listener = vi.fn();
        store.subscribe(listener);
        const previous = store.getSnapshot();

        const changed = store.applyEvent(conversationCreated());

        expect(changed).toBe(false);
        expect(store.getSnapshot()).toBe(previous);
        expect(listener).not.toHaveBeenCalled();
    });

    it('非法状态迁移被拒绝:completed 之后不能回到 running', () => {
        const store = new RuntimeStore();
        store.applyEvent(runStatus('e1', 'queued'));
        store.applyEvent(runStatus('e2', 'running'));
        store.applyEvent(runStatus('e3', 'completed'));

        const previous = store.getSnapshot();
        const changed = store.applyEvent(runStatus('e4', 'running'));

        expect(changed).toBe(false);
        expect(store.getSnapshot()).toBe(previous);
        expect(store.getSnapshot().runsById['run-1'].status).toBe('completed');
    });

    it('同状态重复事件(不同 eventId)同样不产生新快照', () => {
        const store = new RuntimeStore();
        store.applyEvent(runStatus('e1', 'queued'));

        const previous = store.getSnapshot();
        const changed = store.applyEvent(runStatus('e2', 'queued'));

        expect(changed).toBe(false);
        expect(store.getSnapshot()).toBe(previous);
    });

    it('订阅通知 → unsubscribe 后不再通知', () => {
        const store = new RuntimeStore();
        const listener = vi.fn();
        const unsubscribe = store.subscribe(listener);

        store.applyEvent(conversationCreated('e1'));
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        store.applyEvent(messageAppended('e2'));
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('原子性:一个事件同时改 message 与 conversation,订阅者看不到中间态', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated());

        // 在通知回调里读快照:两份映射必须同时落地
        const seen: string[] = [];
        store.subscribe(() => {
            const snap = store.getSnapshot();
            const hasMessage = 'msg-1' in snap.messagesById;
            const hasIdInConversation =
                snap.conversationsById['conv-1'].messageIds.includes('msg-1');
            seen.push(`${hasMessage}-${hasIdInConversation}`);
        });

        store.applyEvent(messageAppended());
        expect(seen).toEqual(['true-true']);
    });

    it('结构共享:更新 part-A 时 part-B 与无关映射引用不变(Selector 隔离的前提)', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated());
        store.applyEvent(messageAppended());
        store.applyEvent(partStarted('e-p1', 'p1'));
        store.applyEvent(partStarted('e-p2', 'p2'));

        const previous = store.getSnapshot();
        const partBBefore = previous.partsById['p2'];
        const runsBefore = previous.runsById;
        const messagesBefore = previous.messagesById;

        store.applyEvent(partDelta('e-d1', 'p1', 'hello'));

        const next = store.getSnapshot();
        // 变化的:根快照、partsById、part-A
        expect(next).not.toBe(previous);
        expect(next.partsById).not.toBe(previous.partsById);
        expect(next.partsById['p1']).not.toBe(previous.partsById['p1']);
        // 不变的:part-B、runs、messages(结构共享)
        expect(next.partsById['p2']).toBe(partBBefore);
        expect(next.runsById).toBe(runsBefore);
        expect(next.messagesById).toBe(messagesBefore);
    });

    it('part.delta 追加到已完成/不存在的 part 上无效', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated());
        store.applyEvent(messageAppended());
        store.applyEvent(partStarted('e-p1', 'p1'));
        store.applyEvent({ type: 'part.completed', eventId: 'e-c1', partId: 'p1' });

        const previous = store.getSnapshot();
        expect(store.applyEvent(partDelta('e-d1', 'p1'))).toBe(false);
        expect(store.applyEvent(partDelta('e-d2', 'p-ghost'))).toBe(false);
        expect(store.getSnapshot()).toBe(previous);
    });

    it('reset 回到空快照并通知订阅者,version 归零', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated());
        const listener = vi.fn();
        store.subscribe(listener);

        store.reset();

        expect(listener).toHaveBeenCalledTimes(1);
        expect(store.getSnapshot().version).toBe(0);
        expect(Object.keys(store.getSnapshot().conversationsById)).toHaveLength(0);
    });

    it('reset 后同一 eventId 可再次应用(去重记录已清空)', () => {
        const store = new RuntimeStore();
        store.applyEvent(conversationCreated('e1'));
        store.reset();

        expect(store.applyEvent(conversationCreated('e1'))).toBe(true);
    });
});
