/**
 * ============================================================================
 * IntervalDemo.tsx — useInterval 演示
 * ============================================================================
 *
 * 秒表:开始 / 暂停 / 调速 / 归零。生产要点:「回调 ref 模式」让
 * interval 永远调用最新闭包 —— 下方「步长」随时可改,计数每次都按
 * 最新步长累加,而计时节拍不会因回调变化而重置。
 *
 * @module topics/hooks/custom-hooks/playground/components/IntervalDemo
 */

import { memo, useState } from 'react';
import { Button, Segmented, Space } from 'antd';
import { CaretRightOutlined, PauseOutlined, ReloadOutlined } from '@ant-design/icons';

import { useInterval, useToggle } from '../../lib';

/** 调速档位(毫秒) */
const SPEED_OPTIONS = [
    { label: '0.5s', value: 500 },
    { label: '1s', value: 1000 },
    { label: '2s', value: 2000 },
];

export const IntervalDemo = memo(() => {
    const [count, setCount] = useState(0);
    const [step, setStep] = useState(1);
    const [delay, setDelay] = useState(1000);
    const [running, { toggle: toggleRunning, setFalse: stop }] = useToggle(false);

    // 回调内联书写也能读到最新 step:useInterval 内部走回调 ref
    useInterval(() => setCount((c) => c + step), running ? delay : null);

    return (
        <div className="space-y-3">
            <div className="text-3xl font-bold tabular-nums text-gray-800 dark:text-slate-100">
                {count}
            </div>
            <Space wrap>
                <Button
                    type="primary"
                    icon={running ? <PauseOutlined /> : <CaretRightOutlined />}
                    onClick={toggleRunning}
                >
                    {running ? '暂停' : '开始'}
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        stop();
                        setCount(0);
                    }}
                >
                    归零
                </Button>
                <Segmented options={SPEED_OPTIONS} value={delay} onChange={(v) => setDelay(v as number)} />
                <Segmented
                    options={[1, 5, 10]}
                    value={step}
                    onChange={(v) => setStep(v as number)}
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    步长 +{step}(运行中改步长,下一拍立即生效,节拍不重置)
                </span>
            </Space>
        </div>
    );
});

IntervalDemo.displayName = 'IntervalDemo';
