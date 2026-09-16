/**
 * ============================================================================
 * LazyDocPanel.tsx — 场景 0 中被懒加载的「文档面板」chunk
 * ============================================================================
 *
 * 迁移自旧 Suspense 专题的 HeavyPanel:仅用于演示 React.lazy
 * 按需加载与形似骨架,无实际业务含义。
 *
 * @module topics/performance/suspense-ui/components/LazyDocPanel
 */

import { memo } from 'react';

const LazyDocPanel = memo(() => {
    return (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
                文档面板加载完成
            </h3>
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                这段内容来自一个独立 chunk,经过 1.5s 模拟网络延迟后才渲染出来。
            </p>
        </div>
    );
});

LazyDocPanel.displayName = 'LazyDocPanel';

export default LazyDocPanel;
