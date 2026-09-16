/**
 * ============================================================================
 * RuntimeStore.ts — React 之外的 Runtime 核心 Store
 * ============================================================================
 *
 * 客户端 Agent Runtime 的状态容器:接收 RuntimeEvent(快照/SSE 增量),
 * 经纯函数 reducer 投影为不可变快照,再通知所有订阅者。
 * 这是 useSyncExternalStore 协议中的「外部可变 Store」角色。
 *
 * 功能特点:
 * - getSnapshot 引用稳定:无有效变化时永远返回同一对象引用
 * - 发布顺序保证:先替换快照,再通知订阅者(React 读到的永远是新值)
 * - eventId 幂等去重:同一事件重复到达不产生新快照
 * - 原子性:一个事件只产生一份完整新快照,订阅者看不到中间态
 *
 * @module topics/agent/runtime/RuntimeStore
 */

import { reduceRuntimeEvent } from './reducer';
import type { RuntimeEvent, RuntimeSnapshot } from './types';
import { createEmptySnapshot } from './types';

/** 订阅者回调:只表示「Store 可能变了」,不携带数据 */
export type Listener = () => void;

/**
 * Runtime Store。不 import React,可独立实例化与测试。
 *
 * @example
 * const store = new RuntimeStore();
 * const unsubscribe = store.subscribe(() => console.log(store.getSnapshot().version));
 * store.applyEvent(event);
 */
export class RuntimeStore {
    private currentSnapshot: RuntimeSnapshot;

    /** SSR / hydration 使用的初始快照(本演练为纯 CSR,仅演示协议) */
    private readonly serverSnapshot: RuntimeSnapshot;

    private readonly listeners = new Set<Listener>();

    /** 已应用事件的 eventId 集合,用于幂等去重(不属于快照,不参与渲染) */
    private readonly appliedEventIds = new Set<string>();

    constructor(initialSnapshot: RuntimeSnapshot = createEmptySnapshot()) {
        this.currentSnapshot = initialSnapshot;
        this.serverSnapshot = initialSnapshot;
    }

    /**
     * 返回当前已发布的不可变快照。
     * 契约:Store 未发生有效变化时,必须返回同一个对象引用,
     * 否则 React 的 Object.is 比较会失效并引发无限重渲染。
     */
    getSnapshot = (): RuntimeSnapshot => {
        return this.currentSnapshot;
    };

    /**
     * 返回服务端渲染与 hydration 使用的初始快照,同样要求引用稳定。
     */
    getServerSnapshot = (): RuntimeSnapshot => {
        return this.serverSnapshot;
    };

    /**
     * 注册订阅者,返回取消订阅函数。
     * listener 只负责通知「可能变了」,React 会自行再调 getSnapshot 读取数据。
     */
    subscribe = (listener: Listener): (() => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    /**
     * 把一个 RuntimeEvent 原子地投影到 Store。
     *
     * @param event 运行时事件(需携带全局唯一 eventId)
     * @returns 是否真正产生了新快照(重复/无效事件返回 false)
     */
    applyEvent = (event: RuntimeEvent): boolean => {
        // eventId 去重:同一事件无论到达多少次,只应用一次
        if (this.appliedEventIds.has(event.eventId)) {
            return false;
        }
        this.appliedEventIds.add(event.eventId);

        const nextSnapshot = reduceRuntimeEvent(this.currentSnapshot, event);
        return this.publish(nextSnapshot);
    };

    /**
     * 重置会话:回到空快照并清空去重记录,用于「重置」演示。
     */
    reset = (): void => {
        this.appliedEventIds.clear();
        this.publish(createEmptySnapshot());
    };

    /**
     * 发布新快照:先替换 currentSnapshot,再统一通知所有订阅者。
     * 顺序不可颠倒 —— 先通知后替换会让 React 在回调里读到旧快照。
     *
     * @returns 快照引用是否发生变化
     */
    private publish(nextSnapshot: RuntimeSnapshot): boolean {
        if (Object.is(nextSnapshot, this.currentSnapshot)) {
            return false;
        }
        this.currentSnapshot = nextSnapshot;
        for (const listener of this.listeners) {
            listener();
        }
        return true;
    }
}
