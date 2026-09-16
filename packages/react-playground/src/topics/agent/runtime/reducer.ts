/**
 * ============================================================================
 * reducer.ts — Runtime 事件投影(纯函数)
 * ============================================================================
 *
 * 把一个 RuntimeEvent 投影到当前快照上,产出下一份不可变快照。
 * 与 React useReducer 的 reducer 同构:(previous, event) => next。
 *
 * 功能特点:
 * - 纯函数:无副作用、无定时器、不依赖外部状态,可单测
 * - 不可变更新 + 结构共享:未受影响的实体/映射复用原引用
 * - 幂等与合法性校验:重复/无效事件原样返回 previous(引用不变),
 *   Store 层据此判定「不产生新快照、不通知订阅者」
 *
 * @module topics/agent/runtime/reducer
 */

import type { RunStatus, RuntimeEvent, RuntimeSnapshot } from './types';

/* =================================================================
 * Run 状态机 — 合法迁移表
 * ================================================================ */

/**
 * 每个状态允许迁移到的下一状态集合。
 * 终态(completed / failed / cancelled)不可再迁移;
 * 同状态重复事件与非法迁移(如 running 完成后又变回 running)都会被拒绝。
 */
const ALLOWED_TRANSITIONS: Readonly<Record<RunStatus, readonly RunStatus[]>> = {
    queued: ['running', 'cancelled'],
    running: ['completed', 'failed', 'cancelled'],
    completed: [],
    failed: [],
    cancelled: [],
};

/* =================================================================
 * reduceRuntimeEvent — 事件投影主函数
 * ================================================================ */

/**
 * 将单个事件投影到快照上。
 *
 * @param previous 当前不可变快照
 * @param event 待投影的运行时事件
 * @returns 有效事件返回新快照(version + 1);无效/重复事件返回 previous 原引用
 *
 * @example
 * const next = reduceRuntimeEvent(snapshot, {
 *     type: 'part.delta', eventId: 'e1', partId: 'p1', delta: '你好',
 * });
 */
export function reduceRuntimeEvent(
    previous: RuntimeSnapshot,
    event: RuntimeEvent,
): RuntimeSnapshot {
    switch (event.type) {
        case 'conversation.created': {
            // 幂等:会话已存在则忽略
            if (previous.conversationsById[event.conversation.id]) {
                return previous;
            }
            return {
                ...previous,
                version: previous.version + 1,
                conversationsById: {
                    ...previous.conversationsById,
                    [event.conversation.id]: event.conversation,
                },
            };
        }

        case 'run.status_changed': {
            const previousRun = previous.runsById[event.runId];
            const previousStatus: RunStatus | null = previousRun ? previousRun.status : null;

            // 合法性:首次出现只允许 queued;其后必须命中迁移表(同状态视为重复事件,天然被拒)
            const allowed: readonly RunStatus[] =
                previousStatus === null ? ['queued'] : ALLOWED_TRANSITIONS[previousStatus];
            if (!allowed.includes(event.status)) {
                return previous;
            }

            return {
                ...previous,
                version: previous.version + 1,
                runsById: {
                    ...previous.runsById,
                    [event.runId]: { id: event.runId, status: event.status },
                },
            };
        }

        case 'message.appended': {
            const { message } = event;
            // 幂等:消息已存在则忽略
            if (previous.messagesById[message.id]) {
                return previous;
            }
            const conversation = previous.conversationsById[message.conversationId];
            if (!conversation) {
                return previous;
            }
            // 原子更新:消息实体与会话的 messageIds 在同一份新快照中一起落地
            return {
                ...previous,
                version: previous.version + 1,
                messagesById: { ...previous.messagesById, [message.id]: message },
                conversationsById: {
                    ...previous.conversationsById,
                    [message.conversationId]: {
                        ...conversation,
                        messageIds: [...conversation.messageIds, message.id],
                    },
                },
            };
        }

        case 'part.started': {
            const { part } = event;
            // 幂等:part 已存在则忽略
            if (previous.partsById[part.id]) {
                return previous;
            }
            const message = previous.messagesById[part.messageId];
            if (!message) {
                return previous;
            }
            return {
                ...previous,
                version: previous.version + 1,
                partsById: { ...previous.partsById, [part.id]: part },
                messagesById: {
                    ...previous.messagesById,
                    [part.messageId]: { ...message, partIds: [...message.partIds, part.id] },
                },
            };
        }

        case 'part.delta': {
            const previousPart = previous.partsById[event.partId];
            // 只有流式中的 text / artifact 接受增量
            if (
                !previousPart ||
                previousPart.type === 'tool' ||
                previousPart.state !== 'streaming'
            ) {
                return previous;
            }
            // 结构共享:只有该 part 与 partsById 换引用,其余实体原样复用
            return {
                ...previous,
                version: previous.version + 1,
                partsById: {
                    ...previous.partsById,
                    [event.partId]: { ...previousPart, content: previousPart.content + event.delta },
                },
            };
        }

        case 'part.completed': {
            const previousPart = previous.partsById[event.partId];
            if (!previousPart) {
                return previous;
            }
            if (previousPart.type === 'tool') {
                // 幂等:工具已完成则忽略(含重复 completed)
                if (previousPart.state === 'completed') {
                    return previous;
                }
                return {
                    ...previous,
                    version: previous.version + 1,
                    partsById: {
                        ...previous.partsById,
                        [event.partId]: {
                            ...previousPart,
                            state: 'completed',
                            summary: event.summary ?? '',
                        },
                    },
                };
            }
            if (previousPart.state !== 'streaming') {
                return previous;
            }
            return {
                ...previous,
                version: previous.version + 1,
                partsById: {
                    ...previous.partsById,
                    [event.partId]: { ...previousPart, state: 'completed' },
                },
            };
        }
    }
}
