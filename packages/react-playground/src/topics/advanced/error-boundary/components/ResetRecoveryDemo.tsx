/**
 * ============================================================================
 * ResetRecoveryDemo — 只清错误态 vs 同时撤掉抛错条件
 * ============================================================================
 *
 * 抛错条件在父级 props 上(armed=true → 子组件 render 必炸)。
 * 左边重置只清边界 state,armed 仍为 true,下一拍立刻再 throw。
 * 右边重置时把 armed 设回 false,子树才能真正恢复。
 *
 * 内部 state 导致的 throw 不适合做这组对照:fallback 期间子树已经卸载,
 * 重置时会挂上全新实例,本地 count 本来就会归零。
 *
 * @module topics/advanced/error-boundary/components/ResetRecoveryDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

import { DemoErrorBoundary } from './DemoErrorBoundary';

interface PropsBombProps {
    /** 为 true 时在渲染期 throw,模拟父级仍传入非法数据 */
    armed: boolean;
    label: string;
}

const PropsBomb = memo(({ armed, label }: PropsBombProps) => {
    if (armed) {
        throw new Error(`${label}:父级仍传入 armed=true,渲染期抛错`);
    }

    return (
        <p className="text-sm text-gray-600 dark:text-slate-300" aria-label={`${label}状态`}>
            {label} 正常(armed=false)
        </p>
    );
});

PropsBomb.displayName = 'PropsBomb';

export const ResetRecoveryDemo = memo(() => {
    const [leftArmed, setLeftArmed] = useState(false);
    const [rightArmed, setRightArmed] = useState(false);

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                    只清错误态,不撤抛错条件
                </p>
                <Button
                    size="small"
                    danger
                    disabled={leftArmed}
                    onClick={() => setLeftArmed(true)}
                >
                    用 props 引爆左栏
                </Button>
                <DemoErrorBoundary name="只清错误态">
                    <PropsBomb armed={leftArmed} label="左栏" />
                </DemoErrorBoundary>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    引爆后点重置:父级 armed 仍是 true,子树一挂上就再 throw,fallback 几乎不消失。
                </p>
            </div>
            <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    重置时同时把 armed 设回 false
                </p>
                <Button
                    size="small"
                    danger
                    disabled={rightArmed}
                    onClick={() => setRightArmed(true)}
                >
                    用 props 引爆右栏
                </Button>
                <DemoErrorBoundary name="撤掉抛错条件" onReset={() => setRightArmed(false)}>
                    <PropsBomb armed={rightArmed} label="右栏" />
                </DemoErrorBoundary>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    引爆后点重置:边界清错误态,父级也撤回引爆 props,子树可以正常渲染。
                </p>
            </div>
        </div>
    );
});

ResetRecoveryDemo.displayName = 'ResetRecoveryDemo';
