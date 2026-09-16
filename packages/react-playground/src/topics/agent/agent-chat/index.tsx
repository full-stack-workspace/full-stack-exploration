/**
 * ============================================================================
 * Agent 对话运行时 — 综合演示页(/agent/agent-chat)
 * ============================================================================
 *
 * 完整演练「SSE 事件流 → Runtime Store → useSyncExternalStore → UI」链路:
 * MockSseClient 按剧本逐条推送 RuntimeEvent,RuntimeStore 投影为不可变快照,
 * UI 各组件经 Selector 精准订阅自己关心的切片。
 *
 * 功能特点:
 * - 控制条:发起 / 暂停 / 继续 / 倍速 / 取消 / 重置
 * - 会话视图:用户提问 + Agent 回答(text 流式 / 工具卡片 / artifact 面板)
 * - 事件日志:实时显示每条事件的应用结果与快照版本(被去重事件标灰)
 * - 渲染角标:每个组件挂 RenderBadge,实证 Selector 精准订阅
 *
 * @module topics/agent/agent-chat
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOutlined } from '@ant-design/icons';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { RuntimeProvider } from '../react-adapter/RuntimeProvider';
import { useRuntimeStore } from '../react-adapter/hooks';
import { MockSseClient } from '../runtime/MockSseClient';
import type { PlaybackSpeed } from '../runtime/MockSseClient';
import { DEMO_IDS, DEMO_SCRIPT } from '../runtime/script';
import { ControlBar } from './components/ControlBar';
import type { PlaybackPhase } from './components/ControlBar';
import { EventLogPanel } from './components/EventLogPanel';
import type { EventLogEntry } from './components/EventLogPanel';
import { MessageList } from './components/MessageList';
import { RunStatusBadge } from './components/RunStatusBadge';

/* =================================================================
 * AgentChatPanel — 组装区(持有播放状态,负责「发命令」)
 * ================================================================ */

const AgentChatPanel = () => {
    const store = useRuntimeStore();

    const [phase, setPhase] = useState<PlaybackPhase>('idle');
    const [speed, setSpeed] = useState<PlaybackSpeed>(1);
    const [eventLog, setEventLog] = useState<readonly EventLogEntry[]>([]);

    // Client 与日志序号走 ref:不随渲染重建,回调内也能读到最新值
    const clientRef = useRef<MockSseClient | null>(null);
    const logSeqRef = useRef(0);
    if (clientRef.current === null) {
        clientRef.current = new MockSseClient(DEMO_SCRIPT);
    }

    // 卸载时停掉定时器,避免组件销毁后仍向 Store 推事件
    useEffect(() => {
        const client = clientRef.current;
        return () => client?.cancel();
    }, []);

    /* ---- 命令回调:全部 useCallback 稳定化,保证 memo 子组件不被连坐 ---- */

    const handleStart = useCallback(() => {
        const client = clientRef.current;
        if (!client) {
            return;
        }
        logSeqRef.current = 0;
        setEventLog([]);
        client.setSpeed(speed);
        client.start(
            (event) => {
                // 事件 → Store:返回值即「是否产生新快照」
                const applied = store.applyEvent(event);
                const entry: EventLogEntry = {
                    seq: ++logSeqRef.current,
                    eventId: event.eventId,
                    type: event.type,
                    applied,
                    versionAfter: store.getSnapshot().version,
                };
                setEventLog((prev) => [...prev, entry]);
            },
            () => setPhase('finished'),
        );
        setPhase('playing');
    }, [store, speed]);

    const handlePause = useCallback(() => {
        clientRef.current?.pause();
        setPhase('paused');
    }, []);

    const handleResume = useCallback(() => {
        clientRef.current?.resume();
        setPhase('playing');
    }, []);

    const handleSpeedChange = useCallback((next: PlaybackSpeed) => {
        clientRef.current?.setSpeed(next);
        setSpeed(next);
    }, []);

    const handleCancel = useCallback(() => {
        clientRef.current?.cancel();
        // 取消是显式命令:向 Store 补一条 cancelled 事件(若 Run 处于非终态才会生效)
        store.applyEvent({
            type: 'run.status_changed',
            eventId: `evt-manual-cancel-${Date.now()}`,
            runId: DEMO_IDS.runId,
            status: 'cancelled',
        });
        setPhase('idle');
    }, [store]);

    const handleReset = useCallback(() => {
        clientRef.current?.reset();
        store.reset();
        logSeqRef.current = 0;
        setEventLog([]);
        setPhase('idle');
    }, [store]);

    /* ---- render ---- */

    return (
        <>
            <TopicSection
                title="控制台"
                note="发起一次模拟 Agent Run:MockSseClient 按剧本推送 SSE 事件,RuntimeStore 投影为不可变快照;剧本刻意混入重复/非法事件,观察事件日志中的灰色条目"
            >
                <div className="space-y-4">
                    <ControlBar
                        phase={phase}
                        speed={speed}
                        onStart={handleStart}
                        onPause={handlePause}
                        onResume={handleResume}
                        onSpeedChange={handleSpeedChange}
                        onCancel={handleCancel}
                        onReset={handleReset}
                    />
                    <RunStatusBadge runId={DEMO_IDS.runId} />
                </div>
            </TopicSection>

            <div className="grid gap-6 lg:grid-cols-2">
                <TopicSection
                    title="会话视图"
                    note="每个气泡 / part 各自通过 Selector 订阅;流式输出期间观察渲染角标 —— 只有正在更新的 part 计数增长"
                >
                    <MessageList conversationId={DEMO_IDS.conversationId} />
                </TopicSection>
                <TopicSection
                    title="事件日志"
                    note="每条进入 Store 的事件及其应用结果;灰色删除线 = 被幂等去重或非法迁移拒绝,不产生新快照、不触发渲染"
                >
                    <EventLogPanel entries={eventLog} />
                </TopicSection>
            </div>
        </>
    );
};

/* =================================================================
 * 页面根组件 — TopicPage 骨架 + RuntimeProvider 注入
 * ================================================================ */

const AgentChatTopic = memo(() => {
    return (
        <RuntimeProvider>
            <TopicPage
                title="Agent 对话运行时"
                description="模拟 SSE 事件流驱动 React 之外的 Runtime Store,UI 经 useSyncExternalStore 精准订阅 —— 角标 ×N 为各组件渲染次数"
            >
                <div className="rounded-card border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    <BookOutlined className="mr-1.5" />
                    本页是「useSyncExternalStore 深入梳理」的配套演练,原理解析与架构说明见
                    <Link
                        to="/agent/use-sync-external-store"
                        className="mx-1 font-medium underline underline-offset-2 hover:text-rose-700 dark:hover:text-rose-200"
                    >
                        梳理页
                    </Link>
                    。
                </div>
                <AgentChatPanel />
            </TopicPage>
        </RuntimeProvider>
    );
});

AgentChatTopic.displayName = 'AgentChatTopic';

export default AgentChatTopic;
