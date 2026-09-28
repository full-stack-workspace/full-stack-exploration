/**
 * ============================================================================
 * BombWidget — 会在渲染期抛错的计数器
 * ============================================================================
 *
 * count 达到 explodeAt 时在 render 里 throw。这是错误边界能接住的那一类异常;
 * 事件处理 / 异步回调里 throw 不会走这条路径。
 *
 * @module topics/advanced/error-boundary/components/BombWidget
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

interface BombWidgetProps {
    /** 小组件标题,同时用于按钮文案与抛错信息 */
    label: string;
    /** 计数达到该值时在渲染期 throw */
    explodeAt: number;
}

/**
 * @param props.label - 小组件标题
 * @param props.explodeAt - 引爆阈值
 */
export const BombWidget = memo(({ label, explodeAt }: BombWidgetProps) => {
    const [count, setCount] = useState(0);

    if (count >= explodeAt) {
        throw new Error(`${label} 计数达到 ${explodeAt},渲染期抛出了异常`);
    }

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{label}</p>
            <p className="font-mono text-xl text-gray-800 dark:text-slate-100" aria-label={`${label}当前计数`}>
                {count}
            </p>
            <Button type="primary" size="small" onClick={() => setCount((current) => current + 1)}>
                {label} +1(到 {explodeAt} 会抛错)
            </Button>
        </div>
    );
});

BombWidget.displayName = 'BombWidget';

interface HealthyWidgetProps {
    label: string;
}

/** 对照用:永远不会抛错的计数器,用来证明边界外的 UI 不受牵连 */
export const HealthyWidget = memo(({ label }: HealthyWidgetProps) => {
    const [count, setCount] = useState(0);

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">{label}</p>
            <p className="font-mono text-xl text-gray-800 dark:text-slate-100" aria-label={`${label}当前计数`}>
                {count}
            </p>
            <Button size="small" onClick={() => setCount((current) => current + 1)}>
                {label} +1(不会抛错)
            </Button>
        </div>
    );
});

HealthyWidget.displayName = 'HealthyWidget';
