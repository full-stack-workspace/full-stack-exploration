/**
 * ============================================================================
 * OwnershipDemo — 一份事实 vs 多份可写副本
 * ============================================================================
 *
 * 规则 1:每份状态要有明确所有权。列表同时放进「请求缓存、全局 Store、组件 state」
 * 再靠 effect 对齐,是实现阶段最贵的隐性成本。
 *
 * @module topics/performance/governance/implement/components/OwnershipDemo
 */

import { memo, useEffect, useState } from 'react';
import { Button, Segmented } from 'antd';

type Mode = 'dup' | 'single';

export const OwnershipDemo = memo(() => {
    const [mode, setMode] = useState<Mode>('dup');
    const [queryCache, setQueryCache] = useState(12);
    const [storeCopy, setStoreCopy] = useState(12);
    const [localCopy, setLocalCopy] = useState(12);
    const [syncTicks, setSyncTicks] = useState(0);

    useEffect(() => {
        if (mode !== 'dup') {
            return;
        }
        setStoreCopy(queryCache);
        setLocalCopy(queryCache);
        setSyncTicks((n) => n + 1);
    }, [mode, queryCache]);

    const bumpCache = () => setQueryCache((n) => n + 1);
    const bumpLocalOnly = () => setLocalCopy((n) => n + 1);

    const drifted = mode === 'dup' && (localCopy !== queryCache || storeCopy !== queryCache);

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="状态所有权模式"
                value={mode}
                onChange={(v) => {
                    const next = v as Mode;
                    setMode(next);
                    setSyncTicks(0);
                    if (next === 'single') {
                        setStoreCopy(queryCache);
                        setLocalCopy(queryCache);
                    }
                }}
                options={[
                    { label: '三份可写副本 + effect 对齐', value: 'dup' },
                    { label: '单一所有权', value: 'single' },
                ]}
            />
            <div className="grid gap-2 text-xs sm:grid-cols-3">
                <p>请求缓存: {queryCache}</p>
                <p>全局 Store 副本: {mode === 'single' ? '不存放' : storeCopy}</p>
                <p>组件 state 副本: {mode === 'single' ? '不存放' : localCopy}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button size="small" onClick={bumpCache}>
                    服务端列表 +1
                </Button>
                {mode === 'dup' ? (
                    <Button size="small" onClick={bumpLocalOnly}>
                        只改组件副本
                    </Button>
                ) : null}
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                {mode === 'dup'
                    ? `effect 已对齐 ${syncTicks} 次。${drifted ? '刚改了组件副本,三份已经分叉。' : '看起来一致,但每次缓存变都要再渲染整条同步链。'}`
                    : '列表只活在请求缓存。UI 选中项、草稿、URL 筛选各管各的,不再互相 effect。'}
            </p>
        </div>
    );
});

OwnershipDemo.displayName = 'OwnershipDemo';
