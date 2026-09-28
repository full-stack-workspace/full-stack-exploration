/**
 * ============================================================================
 * NestedGranularityDemo — 细粒度 vs 粗粒度边界
 * ============================================================================
 *
 * 同一对会爆炸的小组件,切换「每个组件自己的边界」与「整块一块边界」。
 * 细粒度:A 崩了 B 还在;粗粒度:A 一崩整块被 fallback 替换。
 *
 * @module topics/advanced/error-boundary/components/NestedGranularityDemo
 */

import { memo, useState } from 'react';
import { Switch } from 'antd';

import { BombWidget } from './BombWidget';
import { DemoErrorBoundary } from './DemoErrorBoundary';

type Granularity = 'fine' | 'coarse';

export const NestedGranularityDemo = memo(() => {
    const [mode, setMode] = useState<Granularity>('fine');
    const [keyA, setKeyA] = useState(0);
    const [keyB, setKeyB] = useState(0);
    const [coarseKey, setCoarseKey] = useState(0);

    const remountAll = () => {
        setKeyA((key) => key + 1);
        setKeyB((key) => key + 1);
        setCoarseKey((key) => key + 1);
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch
                    size="small"
                    aria-label="细粒度边界"
                    checked={mode === 'fine'}
                    onChange={(checked) => {
                        setMode(checked ? 'fine' : 'coarse');
                        remountAll();
                    }}
                />
                细粒度(每个小组件自己的边界;关闭则整块一块边界)
            </label>
            {mode === 'fine' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                    <DemoErrorBoundary name="面板 A" onReset={() => setKeyA((key) => key + 1)}>
                        <BombWidget key={keyA} label="面板 A" explodeAt={2} />
                    </DemoErrorBoundary>
                    <DemoErrorBoundary name="面板 B" onReset={() => setKeyB((key) => key + 1)}>
                        <BombWidget key={keyB} label="面板 B" explodeAt={2} />
                    </DemoErrorBoundary>
                </div>
            ) : (
                <DemoErrorBoundary name="整块面板" onReset={() => setCoarseKey((key) => key + 1)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <BombWidget key={`a-${coarseKey}`} label="面板 A" explodeAt={2} />
                        <BombWidget key={`b-${coarseKey}`} label="面板 B" explodeAt={2} />
                    </div>
                </DemoErrorBoundary>
            )}
        </div>
    );
});

NestedGranularityDemo.displayName = 'NestedGranularityDemo';
