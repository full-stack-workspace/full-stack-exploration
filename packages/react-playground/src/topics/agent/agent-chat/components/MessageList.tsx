/**
 * ============================================================================
 * MessageList.tsx — 会话消息列表
 * ============================================================================
 *
 * 只订阅会话的 messageIds(id 数组切片),消息逐条追加时才重渲染;
 * 每条消息内部的流式更新由 MessageBubble / PartRenderer 各自承担,
 * 不会连坐刷新整个列表。
 *
 * @module topics/agent/agent-chat/components/MessageList
 */

import { memo } from 'react';

import { useRuntimeSelector } from '../../react-adapter/hooks';
import { MessageBubble } from './MessageBubble';
import { RenderBadge, useRenderCount } from './RenderBadge';

/** 会话尚未创建时的稳定空数组兜底(避免每次渲染生成新引用) */
const EMPTY_IDS: readonly string[] = [];

interface MessageListProps {
    conversationId: string;
}

/**
 * @example
 * <MessageList conversationId={DEMO_IDS.conversationId} />
 */
export const MessageList = memo(({ conversationId }: MessageListProps) => {
    const renders = useRenderCount();
    // 只订阅 id 列表:数组引用不变(无新消息)时本组件不重渲染
    const messageIds = useRuntimeSelector(
        (s) => s.conversationsById[conversationId]?.messageIds ?? EMPTY_IDS,
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    {messageIds.length === 0 ? '会话尚未开始' : `${messageIds.length} 条消息`}
                </span>
                <RenderBadge label="MessageList" count={renders} />
            </div>
            {messageIds.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400 dark:border-slate-700 dark:text-slate-500">
                    点击上方「发起 Run」,观察 SSE 事件流如何驱动这份会话
                </div>
            ) : (
                messageIds.map((messageId) => (
                    <MessageBubble key={messageId} messageId={messageId} />
                ))
            )}
        </div>
    );
});

MessageList.displayName = 'MessageList';
