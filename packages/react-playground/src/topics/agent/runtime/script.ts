/**
 * ============================================================================
 * script.ts — 演示剧本:一次 Agent 问答的事件序列
 * ============================================================================
 *
 * 预编排一次完整 Agent Run 的 SSE 事件序列,供 MockSseClient 逐条回放。
 * 剧本内容:用户提问 → Run 启动 → 助手消息流式输出(text 逐 token 增长)
 * → 工具调用(started → completed)→ artifact 产物面板 → Run 完成。
 *
 * 功能特点:
 * - 每个事件携带 delay(1x 倍速下的间隔毫秒数),倍速由 Client 统一缩放
 * - 刻意插入一条「重复 eventId 事件」与一条「非法状态迁移事件」,
 *   用于演示 reducer 幂等去重后「不产生新快照、不触发渲染」
 *
 * @module topics/agent/runtime/script
 */

import type { Message, RuntimeEvent } from './types';

/** 剧本的一步:事件 + 距上一步的间隔(1x 倍速毫秒数) */
export interface ScriptStep {
    event: RuntimeEvent;
    delay: number;
}

/** 演示用的固定实体 id,UI 组件据此做 Selector 订阅 */
export const DEMO_IDS = {
    conversationId: 'conv-1',
    runId: 'run-1',
    userMessageId: 'msg-user-1',
    assistantMessageId: 'msg-assistant-1',
    textPartId: 'part-text-1',
    toolPartId: 'part-tool-1',
    artifactPartId: 'part-artifact-1',
} as const;

/** 流式文本的完整答案,delta 事件把它切成若干「token」逐段推送 */
const ANSWER_TOKENS = [
    '好的,',
    '我来梳理一下 ',
    'useSyncExternalStore ',
    '的核心契约:\n\n',
    '1. Store 在 React 之外,',
    '通过 subscribe 通知变化;\n',
    '2. getSnapshot 必须',
    '引用稳定;\n',
    '3. 更新走不可变快照,',
    '配合结构共享,',
    'Selector 才能精准订阅。',
] as const;

/** artifact 产物的完整内容,同样分段流式推送 */
const ARTIFACT_TOKENS = [
    '# Runtime Store 协议清单\n\n',
    '- getSnapshot(): 返回缓存的不可变快照\n',
    '- subscribe(fn): 注册通知,返回取消函数\n',
    '- 发布顺序:先换快照,再通知\n',
    '- 无效事件:返回原引用,不通知\n',
] as const;

/* ---- 剧本构建辅助 ---- */

let eventSeq = 0;
/** 生成剧本内自增的事件 id(重置会话后重放同一剧本,eventId 也一致) */
const eid = () => `evt-${++eventSeq}`;

/** 把一段文本切成连续的 part.delta 事件步 */
const deltaSteps = (partId: string, tokens: readonly string[], delay: number): ScriptStep[] =>
    tokens.map((delta) => ({
        delay,
        event: { type: 'part.delta', eventId: eid(), partId, delta },
    }));

const userMessage: Message = {
    id: DEMO_IDS.userMessageId,
    conversationId: DEMO_IDS.conversationId,
    role: 'user',
    partIds: [],
};

const assistantMessage: Message = {
    id: DEMO_IDS.assistantMessageId,
    conversationId: DEMO_IDS.conversationId,
    role: 'assistant',
    partIds: [],
};

/**
 * 演示剧本。注意其中两处「陷阱」事件:
 * - 重复事件:与上一条 text delta 完全相同的 eventId 再次到达(网络重发场景),
 *   应被 eventId 去重,文本不变(事件日志标灰)
 * - 非法迁移:Run 已完成又收到 running(乱序/过期事件),应被状态机拒绝
 */
export const DEMO_SCRIPT: readonly ScriptStep[] = (() => {
    const continuedTextSteps = deltaSteps(DEMO_IDS.textPartId, ANSWER_TOKENS.slice(4), 260);
    // 取最后一个 delta 事件作为「网络重发」的重复样本
    const duplicatedDeltaEvent = continuedTextSteps[continuedTextSteps.length - 1].event;

    return [
    {
        delay: 200,
        event: {
            type: 'conversation.created',
            eventId: eid(),
            conversation: {
                id: DEMO_IDS.conversationId,
                title: 'useSyncExternalStore 演练会话',
                messageIds: [],
            },
        },
    },
    {
        delay: 300,
        event: { type: 'message.appended', eventId: eid(), message: userMessage },
    },
    {
        delay: 300,
        event: {
            type: 'run.status_changed',
            eventId: eid(),
            runId: DEMO_IDS.runId,
            status: 'queued',
        },
    },
    {
        delay: 500,
        event: {
            type: 'run.status_changed',
            eventId: eid(),
            runId: DEMO_IDS.runId,
            status: 'running',
        },
    },
    {
        delay: 300,
        event: { type: 'message.appended', eventId: eid(), message: assistantMessage },
    },

    /* ---- text part:流式输出 ---- */
    {
        delay: 300,
        event: {
            type: 'part.started',
            eventId: eid(),
            part: {
                id: DEMO_IDS.textPartId,
                messageId: DEMO_IDS.assistantMessageId,
                type: 'text',
                content: '',
                state: 'streaming',
            },
        },
    },
    ...deltaSteps(DEMO_IDS.textPartId, ANSWER_TOKENS.slice(0, 4), 260),

    /* ---- tool part:调用工具 ---- */
    {
        delay: 400,
        event: {
            type: 'part.started',
            eventId: eid(),
            part: {
                id: DEMO_IDS.toolPartId,
                messageId: DEMO_IDS.assistantMessageId,
                type: 'tool',
                toolName: 'search_docs',
                state: 'started',
                summary: null,
            },
        },
    },
    {
        delay: 900,
        event: {
            type: 'part.completed',
            eventId: eid(),
            partId: DEMO_IDS.toolPartId,
            summary: '检索到 3 篇相关文档(react.dev / reactwg)',
        },
    },

    /* ---- text part 继续流式输出 ---- */
    ...continuedTextSteps,
    {
        // 陷阱 1:同一 eventId 的 delta 事件再次到达,应被幂等去重(事件日志标灰,RenderBadge 不动)
        delay: 260,
        event: duplicatedDeltaEvent,
    },
    {
        delay: 260,
        event: { type: 'part.completed', eventId: eid(), partId: DEMO_IDS.textPartId },
    },

    /* ---- artifact part:产物面板 ---- */
    {
        delay: 400,
        event: {
            type: 'part.started',
            eventId: eid(),
            part: {
                id: DEMO_IDS.artifactPartId,
                messageId: DEMO_IDS.assistantMessageId,
                type: 'artifact',
                title: 'runtime-store-protocol.md',
                content: '',
                state: 'streaming',
            },
        },
    },
    ...deltaSteps(DEMO_IDS.artifactPartId, ARTIFACT_TOKENS, 300),
    {
        delay: 300,
        event: { type: 'part.completed', eventId: eid(), partId: DEMO_IDS.artifactPartId },
    },

    /* ---- Run 收尾 ---- */
    {
        delay: 500,
        event: {
            type: 'run.status_changed',
            eventId: eid(),
            runId: DEMO_IDS.runId,
            status: 'completed',
        },
    },
    {
        // 陷阱 2:Run 已完成却又收到 running,非法迁移应被拒绝(事件日志标灰)
        delay: 600,
        event: {
            type: 'run.status_changed',
            eventId: eid(),
            runId: DEMO_IDS.runId,
            status: 'running',
        },
    },
    ];
})();
