/**
 * ============================================================================
 * MessageBubble.tsx — 单条会话消息气泡
 * ============================================================================
 *
 * 按 messageId 订阅消息实体,取得 partIds 后把每个 part
 * 交给 PartRenderer 独立订阅渲染。用户消息为纯文本提问,
 * 助手消息是 text / tool / artifact 混排的 part 序列。
 *
 * @module topics/agent/agent-chat/components/MessageBubble
 */

import { memo } from 'react';

import { useRuntimeSelector } from '../../react-adapter/hooks';
import { PartRenderer } from './PartRenderer';
import { RenderBadge, useRenderCount } from './RenderBadge';

interface MessageBubbleProps {
    messageId: string;
}

/**
 * @example
 * <MessageBubble messageId="msg-assistant-1" />
 */
export const MessageBubble = memo(({ messageId }: MessageBubbleProps) => {
    const renders = useRenderCount();
    // 订阅消息实体本身(role / partIds);part 内容由 PartRenderer 各自订阅
    const message = useRuntimeSelector((s) => s.messagesById[messageId]);

    if (!message) {
        return null;
    }

    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? 'bg-primary-500 text-white'
                        : 'border border-gray-100 bg-gray-50 dark:border-slate-700 dark:bg-slate-800'
                }`}
            >
                <div
                    className={`mb-1 flex items-center gap-2 text-[10px] ${
                        isUser ? 'text-primary-100' : 'text-gray-400 dark:text-slate-500'
                    }`}
                >
                    <span>{isUser ? '用户' : 'Agent'}</span>
                    <RenderBadge label={`MessageBubble(${messageId})`} count={renders} />
                </div>
                {isUser ? (
                    <p className="text-sm leading-relaxed">
                        帮我梳理一下 useSyncExternalStore 的核心契约
                    </p>
                ) : (
                    <div className="space-y-2.5">
                        {message.partIds.map((partId) => (
                            <PartRenderer key={partId} partId={partId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';
