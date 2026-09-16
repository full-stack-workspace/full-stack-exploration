/**
 * ============================================================================
 * PartRenderer.tsx — 消息 Part 渲染器
 * ============================================================================
 *
 * 按 part 类型分发渲染:text 流式文本(带打字光标)、
 * tool 工具调用卡片(started → completed)、artifact 产物面板。
 * 每个 PartRenderer 实例只通过 Selector 订阅自己那个 partId,
 * 其他 part 更新时引用不变、跳过重渲染。
 *
 * @module topics/agent/agent-chat/components/PartRenderer
 */

import { memo } from 'react';
import { Spin, Tag } from 'antd';
import { FileTextOutlined, ToolOutlined } from '@ant-design/icons';

import { useRuntimeSelector } from '../../react-adapter/hooks';
import type { ArtifactPart, TextPart, ToolPart } from '../../runtime/types';
import { RenderBadge, useRenderCount } from './RenderBadge';

/** 流式进行中的打字光标 */
const StreamingCursor = () => (
    <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-rose-400 align-middle" />
);

/* =================================================================
 * 各类型 Part 的子视图
 * ================================================================ */

const TextPartView = ({ part }: { part: TextPart }) => (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-slate-300">
        {part.content}
        {part.state === 'streaming' && <StreamingCursor />}
    </p>
);

const ToolPartView = ({ part }: { part: ToolPart }) => (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300">
            <ToolOutlined />
            <span className="font-mono">{part.toolName}</span>
            {part.state === 'started' ? (
                <Tag color="processing" className="m-0">
                    <Spin size="small" className="mr-1" />
                    调用中
                </Tag>
            ) : (
                <Tag color="success" className="m-0">
                    已完成
                </Tag>
            )}
        </div>
        {part.state === 'completed' && part.summary && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">{part.summary}</p>
        )}
    </div>
);

const ArtifactPartView = ({ part }: { part: ArtifactPart }) => (
    <div className="overflow-hidden rounded-lg border border-indigo-200 dark:border-indigo-900">
        <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
            <FileTextOutlined />
            <span className="font-mono">{part.title}</span>
            {part.state === 'streaming' && (
                <Tag color="processing" className="m-0">
                    生成中
                </Tag>
            )}
        </div>
        <pre className="whitespace-pre-wrap bg-white p-3 font-mono text-xs leading-relaxed text-gray-600 dark:bg-slate-950 dark:text-slate-400">
            {part.content}
            {part.state === 'streaming' && <StreamingCursor />}
        </pre>
    </div>
);

/* =================================================================
 * PartRenderer — 按 partId 精准订阅的分发组件
 * ================================================================ */

interface PartRendererProps {
    partId: string;
}

/**
 * @example
 * <PartRenderer partId="part-text-1" />
 */
export const PartRenderer = memo(({ partId }: PartRendererProps) => {
    const renders = useRenderCount();
    // 只订阅本 part 实体:其他 part 流式更新时引用不变,本组件不重渲染
    const part = useRuntimeSelector((s) => s.partsById[partId]);

    if (!part) {
        return null;
    }

    return (
        <div className="relative">
            <div className="absolute -top-2 right-0">
                <RenderBadge label={`PartRenderer(${partId})`} count={renders} />
            </div>
            {part.type === 'text' && <TextPartView part={part} />}
            {part.type === 'tool' && <ToolPartView part={part} />}
            {part.type === 'artifact' && <ArtifactPartView part={part} />}
        </div>
    );
});

PartRenderer.displayName = 'PartRenderer';
