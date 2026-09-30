/**
 * ============================================================================
 * MockSseClient.test.ts — 模拟 SSE 事件源生命周期测试
 * ============================================================================
 *
 * 用假定时器验证 MockSseClient 的推送契约:
 * - start 按剧本顺序逐条推送,间隔 = delay / 倍速
 * - pause 保留进度,resume 续播;cancel 清回调;reset 回到开头
 * - 自然播完触发 onFinish,且清空回调(取消不算播完)
 *
 * @module topics/agent/runtime/MockSseClient.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MockSseClient } from './MockSseClient';
import type { ScriptStep } from './script';
import type { RuntimeEvent } from './types';

/* ---- 测试剧本:三条 run 状态事件 ---- */

const runEvent = (eventId: string, status: 'queued' | 'running' | 'completed'): RuntimeEvent => ({
    type: 'run.status_changed',
    eventId,
    runId: 'run-1',
    status,
});

const SCRIPT: readonly ScriptStep[] = [
    { delay: 100, event: runEvent('e1', 'queued') },
    { delay: 200, event: runEvent('e2', 'running') },
    { delay: 400, event: runEvent('e3', 'completed') },
];

const collect = () => {
    const events: RuntimeEvent[] = [];
    return { events, onEvent: (e: RuntimeEvent) => events.push(e) };
};

describe('MockSseClient', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('start 后按剧本顺序逐条推送,播完触发 onFinish 并停止', () => {
        const client = new MockSseClient(SCRIPT);
        const { events, onEvent } = collect();
        const onFinish = vi.fn();

        expect(client.playing).toBe(false);
        client.start(onEvent, onFinish);
        expect(client.playing).toBe(true);
        expect(client.hasNext).toBe(true);

        vi.advanceTimersByTime(100);
        expect(events.map((e) => e.eventId)).toEqual(['e1']);

        vi.advanceTimersByTime(200);
        expect(events.map((e) => e.eventId)).toEqual(['e1', 'e2']);
        expect(onFinish).not.toHaveBeenCalled();

        vi.advanceTimersByTime(400);
        expect(events.map((e) => e.eventId)).toEqual(['e1', 'e2', 'e3']);
        expect(onFinish).toHaveBeenCalledTimes(1);
        expect(client.playing).toBe(false);
        expect(client.hasNext).toBe(false);

        // 播完后回调已清空,时间继续走也不会再推事件或重复 finish
        vi.advanceTimersByTime(10_000);
        expect(events).toHaveLength(3);
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('pause 保留进度,resume 从暂停处继续', () => {
        const client = new MockSseClient(SCRIPT);
        const { events, onEvent } = collect();
        const onFinish = vi.fn();

        client.start(onEvent, onFinish);
        vi.advanceTimersByTime(100);
        expect(events).toHaveLength(1);

        client.pause();
        expect(client.playing).toBe(false);
        vi.advanceTimersByTime(10_000);
        expect(events).toHaveLength(1);
        expect(client.hasNext).toBe(true);

        client.resume();
        expect(client.playing).toBe(true);
        vi.advanceTimersByTime(600);
        expect(events.map((e) => e.eventId)).toEqual(['e1', 'e2', 'e3']);
        expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('cancel 停掉定时器并清空回调:不触发 onFinish,resume 无效', () => {
        const client = new MockSseClient(SCRIPT);
        const { events, onEvent } = collect();
        const onFinish = vi.fn();

        client.start(onEvent, onFinish);
        vi.advanceTimersByTime(100);

        client.cancel();
        vi.advanceTimersByTime(10_000);
        expect(events).toHaveLength(1);
        expect(onFinish).not.toHaveBeenCalled();

        // cancel 后回调已空,resume 不再生效
        client.resume();
        vi.advanceTimersByTime(10_000);
        expect(events).toHaveLength(1);
    });

    it('reset 回到剧本开头,可重新 start 重放同一剧本', () => {
        const client = new MockSseClient(SCRIPT);
        const first = collect();
        client.start(first.onEvent);
        vi.advanceTimersByTime(10_000);
        expect(first.events).toHaveLength(3);

        client.reset();
        expect(client.hasNext).toBe(true);
        expect(client.playing).toBe(false);

        const second = collect();
        client.start(second.onEvent);
        vi.advanceTimersByTime(10_000);
        expect(second.events.map((e) => e.eventId)).toEqual(['e1', 'e2', 'e3']);
    });

    it('播放中再次 start 会从头重播,不叠加定时器', () => {
        const client = new MockSseClient(SCRIPT);
        const { events, onEvent } = collect();

        client.start(onEvent);
        vi.advanceTimersByTime(100);
        client.start(onEvent);
        vi.advanceTimersByTime(100);
        // 若定时器叠加,e1 会重复出现
        expect(events.map((e) => e.eventId)).toEqual(['e1', 'e1']);
        vi.advanceTimersByTime(600);
        expect(events.map((e) => e.eventId)).toEqual(['e1', 'e1', 'e2', 'e3']);
    });

    it('倍速统一缩放事件间隔:2x 快一半,0.5x 慢一倍', () => {
        const fast = new MockSseClient(SCRIPT);
        const fastCollected = collect();
        fast.setSpeed(2);
        fast.start(fastCollected.onEvent);
        vi.advanceTimersByTime(50 + 100 + 200);
        expect(fastCollected.events).toHaveLength(3);

        const slow = new MockSseClient(SCRIPT);
        const slowCollected = collect();
        slow.setSpeed(0.5);
        slow.start(slowCollected.onEvent);
        // 0.5x 下第一条要 200ms
        vi.advanceTimersByTime(199);
        expect(slowCollected.events).toHaveLength(0);
        vi.advanceTimersByTime(1);
        expect(slowCollected.events).toHaveLength(1);
    });

    it('未 start 时 resume 不产生任何事件', () => {
        const client = new MockSseClient(SCRIPT);
        client.resume();
        expect(client.playing).toBe(false);
    });
});
