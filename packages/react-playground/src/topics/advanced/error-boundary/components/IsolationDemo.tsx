/**
 * ============================================================================
 * IsolationDemo — 局部崩溃,局部降级
 * ============================================================================
 *
 * 左右两个小组件:左边会在渲染期引爆,右边永远安全。
 * 左边被自己的边界接住后,右边与页头说明文字都应继续可交互。
 *
 * @module topics/advanced/error-boundary/components/IsolationDemo
 */

import { memo, useState } from 'react';

import { BombWidget, HealthyWidget } from './BombWidget';
import { DemoErrorBoundary } from './DemoErrorBoundary';

export const IsolationDemo = memo(() => {
    const [resetKey, setResetKey] = useState(0);

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <DemoErrorBoundary name="左侧面板" onReset={() => setResetKey((key) => key + 1)}>
                <BombWidget key={resetKey} label="小组件 A" explodeAt={3} />
            </DemoErrorBoundary>
            <div className="rounded-card border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                    边界外 · 右侧对照
                </p>
                <HealthyWidget label="小组件 B" />
            </div>
        </div>
    );
});

IsolationDemo.displayName = 'IsolationDemo';
