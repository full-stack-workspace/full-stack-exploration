/**
 * ============================================================================
 * PreviousDemo.tsx — usePrevious 演示
 * ============================================================================
 *
 * 计数器对比「当前值 / 上一次的值」。生产要点:ref 跨渲染存活且修改
 * 不触发渲染,配合「提交后才写入」的 effect,天然拿到上一帧的值 ——
 * 这是所有「与上一次比较」需求(变化方向、差异动画)的基础件。
 *
 * @module topics/hooks/custom-hooks/playground/components/PreviousDemo
 */

import { memo, useState } from 'react';
import { Button, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

import { usePrevious } from '../../lib';

export const PreviousDemo = memo(() => {
    const [count, setCount] = useState(0);
    const previousCount = usePrevious(count);

    // 变化方向:只有同时知道「现在」与「上一次」才能推导
    const trend =
        previousCount === undefined
            ? '—'
            : count > previousCount
              ? '↑ 上升'
              : count < previousCount
                ? '↓ 下降'
                : '= 持平';

    return (
        <div className="space-y-3">
            <Space>
                <Button icon={<MinusOutlined />} onClick={() => setCount((c) => c - 1)} />
                <Button icon={<PlusOutlined />} onClick={() => setCount((c) => c + 1)} />
            </Space>
            <div className="flex gap-6 text-sm">
                <div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">当前值</div>
                    <div className="text-2xl font-bold text-gray-800 dark:text-slate-100">{count}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">上一次的值</div>
                    <div className="text-2xl font-bold text-gray-400 dark:text-slate-500">
                        {previousCount ?? '—'}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">变化方向</div>
                    <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{trend}</div>
                </div>
            </div>
        </div>
    );
});

PreviousDemo.displayName = 'PreviousDemo';
