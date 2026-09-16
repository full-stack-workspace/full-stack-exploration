/**
 * ============================================================================
 * types.ts — Agent Runtime 领域类型
 * ============================================================================
 *
 * 定义客户端 Agent Runtime 的核心领域模型与事件协议:
 * Conversation / Message / Run / MessagePart / RuntimeEvent / RuntimeSnapshot。
 *
 * 功能特点:
 * - 纯类型定义,不 import React,可在任何环境(浏览器 / Worker / Node)复用
 * - 快照采用规范化(Normalized)结构:实体放 byId 映射,关系用 id 数组表达
 * - 事件带 eventId,为「重复事件幂等去重」提供判重依据
 *
 * @module topics/agent/runtime/types
 */

/* =================================================================
 * Run — 一次 Agent 执行任务
 * ================================================================ */

/** Run 的状态机:queued → running → completed / failed / cancelled */
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface Run {
    id: string;
    status: RunStatus;
}

/* =================================================================
 * MessagePart — 消息的组成单元(text / tool / artifact 混排)
 * ================================================================ */

/** 文本增量单元:content 随 part.delta 事件流式增长 */
export interface TextPart {
    id: string;
    messageId: string;
    type: 'text';
    content: string;
    state: 'streaming' | 'completed';
}

/** 工具调用单元:started 后由 part.completed 事件写入结果摘要 */
export interface ToolPart {
    id: string;
    messageId: string;
    type: 'tool';
    toolName: string;
    state: 'started' | 'completed';
    /** 工具完成后的结果摘要,未完成时为 null */
    summary: string | null;
}

/** 产物单元:较长结构化内容,同样支持流式增长 */
export interface ArtifactPart {
    id: string;
    messageId: string;
    type: 'artifact';
    title: string;
    content: string;
    state: 'streaming' | 'completed';
}

export type MessagePart = TextPart | ToolPart | ArtifactPart;

/* =================================================================
 * Message / Conversation
 * ================================================================ */

export interface Message {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    /** partIds 随 part.started 事件逐个追加 */
    partIds: readonly string[];
}

export interface Conversation {
    id: string;
    title: string;
    /** messageIds 随 message.appended 事件逐个追加 */
    messageIds: readonly string[];
}

/* =================================================================
 * RuntimeSnapshot — 发布给 React 的不可变视图
 * ================================================================ */

/**
 * Store 的不可变快照。每次有效更新整体替换根引用,
 * 未受影响的实体/映射保持原引用(结构共享),version 单调递增。
 */
export interface RuntimeSnapshot {
    version: number;
    conversationsById: Readonly<Record<string, Conversation>>;
    messagesById: Readonly<Record<string, Message>>;
    runsById: Readonly<Record<string, Run>>;
    partsById: Readonly<Record<string, MessagePart>>;
}

/** 初始空快照;reset 时也回到这份内容(注意是同一份新对象,不复用引用) */
export const createEmptySnapshot = (): RuntimeSnapshot => ({
    version: 0,
    conversationsById: {},
    messagesById: {},
    runsById: {},
    partsById: {},
});

/* =================================================================
 * RuntimeEvent — SSE 增量事件协议
 * ================================================================ */

/**
 * 服务端推送给 Runtime Store 的增量事件。
 * 每个事件携带全局唯一 eventId,Store 据此做幂等去重。
 */
export type RuntimeEvent =
    | {
          type: 'conversation.created';
          eventId: string;
          conversation: Conversation;
      }
    | {
          type: 'run.status_changed';
          eventId: string;
          runId: string;
          status: RunStatus;
      }
    | {
          type: 'message.appended';
          eventId: string;
          message: Message;
      }
    | {
          type: 'part.started';
          eventId: string;
          part: MessagePart;
      }
    | {
          type: 'part.delta';
          eventId: string;
          partId: string;
          delta: string;
      }
    | {
          type: 'part.completed';
          eventId: string;
          partId: string;
          /** 工具类 part 完成时携带结果摘要 */
          summary?: string;
      };
