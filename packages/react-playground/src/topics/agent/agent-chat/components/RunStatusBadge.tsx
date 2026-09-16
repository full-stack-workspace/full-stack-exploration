/**
 * ============================================================================
 * RunStatusBadge.tsx — Run 状态徽标
 * ============================================================================
 *
 * 通过 useRuntimeSelector 只订阅 runsById[runId] 这一个切片:
 * text part 流式增长时本组件不会重渲染(RenderBadge 计数不动),
 * 只有 Run 状态迁移时才更新。
 *
 * @module topics/agent/agent-chat/components/RunStatusBadge
 */

import { memo } from 'react';
import { Tag } from 'antd';

import { useRuntimeSelector } from '../../react-adapter/hooks';
import type { RunStatus } from '../../runtime/types';
import { RenderBadge, useRenderCount } from './RenderBadge';

/** Run 状态的中文文案与 antd Tag 配色 */
const STATUS_META: Record<RunStatus, { label: string; color: string }> = {
    queued: { label: '排队中', color: 'default' },
    running: { label: '运行中', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    failed: { label: '失败', color: 'error' },
    cancelled: { label: '已取消', color: 'warning' },
};

interface RunStatusBadgeProps {
    runId: string;
}

/**
 * @example
 * <RunStatusBadge runId={DEMO_IDS.runId} />
 */
export const RunStatusBadge = memo(({ runId }: RunStatusBadgeProps) => {
    const renders = useRenderCount();
    // 精准订阅:只关心这一个 Run 实体
    const run = useRuntimeSelector((s) => s.runsById[runId]);

    return (
        <span className="inline-flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-slate-500">Run 状态</span>
            {run ? (
                <Tag color={STATUS_META[run.status].color} className="m-0">
                    {STATUS_META[run.status].label}
                </Tag>
            ) : (
                <Tag className="m-0">未开始</Tag>
            )}
            <RenderBadge label="RunStatusBadge" count={renders} />
        </span>
    );
});

RunStatusBadge.displayName = 'RunStatusBadge';
