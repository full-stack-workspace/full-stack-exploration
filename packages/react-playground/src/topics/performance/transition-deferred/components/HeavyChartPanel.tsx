/**
 * ============================================================================
 * HeavyChartPanel.tsx — Tab 切换场景中被懒加载的重型面板
 * ============================================================================
 *
 * 经 React.lazy 按需加载,内部渲染 SlowList 制造二次昂贵渲染:
 * 首次进入的成本 = chunk 网络等待(Suspense 管)+ 重型渲染(transition 管)。
 *
 * @module topics/performance/transition-deferred/components/HeavyChartPanel
 */

import { memo } from 'react';

import { SlowList } from '../../lab/SlowList';

interface HeavyChartPanelProps {
    perItemCost?: number;
    itemCount?: number;
}

const HeavyChartPanel = memo(({ perItemCost = 0.2, itemCount = 3000 }: HeavyChartPanelProps) => {
    return (
        <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-slate-500">
                重型图表面板(chunk 已加载,共 {itemCount} 条数据)
            </p>
            <SlowList itemCount={itemCount} perItemCost={perItemCost} />
        </div>
    );
});

HeavyChartPanel.displayName = 'HeavyChartPanel';

export default HeavyChartPanel;
