/**
 * ============================================================================
 * MockSseClient.ts — 模拟服务端 SSE 事件源
 * ============================================================================
 *
 * 按剧本(ScriptStep 序列)用定时器逐条推送 RuntimeEvent,
 * 模拟真实 SSE 长连接的流式到达过程。扮演「服务端事件源」角色,
 * 本身不了解 Store,只负责把事件交给回调。
 *
 * 功能特点:
 * - start / pause / resume / cancel / reset 完整生命周期
 * - 0.5x / 1x / 2x 倍速:统一缩放每条事件的间隔
 * - 纯 TS,不 import React;通过注入回调与 Store / UI 解耦
 *
 * @module topics/agent/runtime/MockSseClient
 */

import type { RuntimeEvent } from './types';
import type { ScriptStep } from './script';

/** 事件到达回调:由调用方(页面)把事件转交给 RuntimeStore.applyEvent */
export type EventHandler = (event: RuntimeEvent) => void;

/** 剧本自然播完时的回调(取消不算播完) */
export type FinishHandler = () => void;

/** 播放速率档位 */
export type PlaybackSpeed = 0.5 | 1 | 2;

/**
 * 模拟 SSE Client。
 *
 * @example
 * const client = new MockSseClient(DEMO_SCRIPT);
 * client.start(
 *     (event) => store.applyEvent(event),
 *     () => console.log('剧本播完'),
 * );
 */
export class MockSseClient {
    private readonly script: readonly ScriptStep[];

    /** 下一条待推送事件的下标 */
    private cursor = 0;

    private speed: PlaybackSpeed = 1;

    private timer: ReturnType<typeof setTimeout> | null = null;

    private onEvent: EventHandler | null = null;

    private onFinish: FinishHandler | null = null;

    constructor(script: readonly ScriptStep[]) {
        this.script = script;
    }

    /** 是否正在推送中(暂停视为不在推送) */
    get playing(): boolean {
        return this.timer !== null;
    }

    /** 剧本是否还有未推送的事件 */
    get hasNext(): boolean {
        return this.cursor < this.script.length;
    }

    /**
     * 从头开始推送剧本。若已有播放中的定时器会先停掉。
     *
     * @param onEvent 每条事件到达时调用
     * @param onFinish 剧本自然播完时调用
     */
    start = (onEvent: EventHandler, onFinish?: FinishHandler): void => {
        this.clearTimer();
        this.cursor = 0;
        this.onEvent = onEvent;
        this.onFinish = onFinish ?? null;
        this.scheduleNext();
    };

    /** 暂停推送,保留当前进度,可 resume 继续 */
    pause = (): void => {
        this.clearTimer();
    };

    /** 从暂停处继续推送(未 start 过或已播完时不生效) */
    resume = (): void => {
        if (this.onEvent && this.hasNext && this.timer === null) {
            this.scheduleNext();
        }
    };

    /** 取消本次推送:停掉定时器并清空回调,进度保留给 reset */
    cancel = (): void => {
        this.clearTimer();
        this.onEvent = null;
        this.onFinish = null;
    };

    /** 重置进度到剧本开头(配合 RuntimeStore.reset 重放) */
    reset = (): void => {
        this.clearTimer();
        this.cursor = 0;
        this.onEvent = null;
        this.onFinish = null;
    };

    /**
     * 调整播放速率,后续事件间隔按 delay / speed 计算。
     */
    setSpeed = (speed: PlaybackSpeed): void => {
        this.speed = speed;
    };

    /** 排定下一条事件:间隔 = 剧本 delay / 当前倍速 */
    private scheduleNext(): void {
        if (!this.hasNext || this.onEvent === null) {
            return;
        }
        const step = this.script[this.cursor];
        this.timer = setTimeout(() => {
            this.timer = null;
            this.cursor += 1;
            this.onEvent?.(step.event);
            if (this.hasNext) {
                this.scheduleNext();
            } else {
                // 自然播完:通知结束后清空回调
                const finish = this.onFinish;
                this.onEvent = null;
                this.onFinish = null;
                finish?.();
            }
        }, step.delay / this.speed);
    }

    private clearTimer(): void {
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}
