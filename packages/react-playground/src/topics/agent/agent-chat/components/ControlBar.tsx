/**
 * ============================================================================
 * ControlBar.tsx — 演示控制台
 * ============================================================================
 *
 * 发起 / 暂停继续 / 倍速 / 取消 / 重置一次 Agent Run 的模拟播放。
 * 所有按钮只是「发命令」:操作 MockSseClient 与 RuntimeStore,
 * 自身不订阅快照数据(RenderBadge 计数可证明它不随事件流重渲染)。
 *
 * @module topics/agent/agent-chat/components/ControlBar
 */

import { memo } from 'react';
import { Button, Segmented, Space } from 'antd';
import {
    CaretRightOutlined,
    CloseOutlined,
    PauseOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';

import type { PlaybackSpeed } from '../../runtime/MockSseClient';
import { RenderBadge, useRenderCount } from './RenderBadge';

/** 播放阶段:未开始 / 推送中 / 已暂停 / 剧本播完 */
export type PlaybackPhase = 'idle' | 'playing' | 'paused' | 'finished';

/** 倍速档位选项 */
const SPEED_OPTIONS: { label: string; value: PlaybackSpeed }[] = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
];

interface ControlBarProps {
    phase: PlaybackPhase;
    speed: PlaybackSpeed;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onSpeedChange: (speed: PlaybackSpeed) => void;
    onCancel: () => void;
    onReset: () => void;
}

/**
 * @example
 * <ControlBar phase={phase} speed={speed} onStart={...} ... />
 */
export const ControlBar = memo(
    ({ phase, speed, onStart, onPause, onResume, onSpeedChange, onCancel, onReset }: ControlBarProps) => {
        const renders = useRenderCount();
        const streaming = phase === 'playing' || phase === 'paused';

        return (
            <div className="flex flex-wrap items-center gap-3">
                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={onStart}
                        disabled={streaming}
                    >
                        发起 Run
                    </Button>
                    {phase === 'playing' ? (
                        <Button icon={<PauseOutlined />} onClick={onPause}>
                            暂停
                        </Button>
                    ) : (
                        <Button
                            icon={<CaretRightOutlined />}
                            onClick={onResume}
                            disabled={phase !== 'paused'}
                        >
                            继续
                        </Button>
                    )}
                    <Button danger icon={<CloseOutlined />} onClick={onCancel} disabled={!streaming}>
                        取消 Run
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={onReset}>
                        重置会话
                    </Button>
                </Space>
                <Segmented
                    options={SPEED_OPTIONS}
                    value={speed}
                    onChange={(value) => onSpeedChange(value as PlaybackSpeed)}
                />
                <RenderBadge label="ControlBar" count={renders} />
            </div>
        );
    },
);

ControlBar.displayName = 'ControlBar';
