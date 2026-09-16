/**
 * ============================================================================
 * TabSwitchDemo.tsx — 场景二:Tab 切换(三件套协作演示)
 * ============================================================================
 *
 * React.lazy + Suspense + startTransition 协作的第一个完整样本:
 * - 同步模式:点击重型 Tab 后整页冻住(昂贵渲染阻塞交互);
 * - 协作模式:startTransition 保持当前 Tab 可交互(isPending 徽标),
 *   目标 Tab 首次进入时 Suspense 骨架接管 chunk 加载等待;
 *   后续再切换时 chunk 已缓存,transition 只负责调度 ——
 *   「transition 管更新时机、Suspense 管资源等待」各司其职。
 *
 * @module topics/performance/transition-deferred/components/TabSwitchDemo
 */

import { memo, Suspense, lazy, useState, useTransition } from 'react';
import type { ComponentType } from 'react';
import { Segmented, Tag } from 'antd';

const HeavyChartPanel = lazy(
    () =>
        // 人为 800ms 延迟,模拟大体积 chunk 的网络加载
        new Promise<{ default: ComponentType<{ perItemCost?: number; itemCount?: number }> }>(
            (resolve) => {
                setTimeout(() => {
                    import('./HeavyChartPanel').then((m) => resolve({ default: m.default }));
                }, 800);
            },
        ),
);

/** Tab key */
type TabKey = 'overview' | 'chart' | 'settings';

const TAB_OPTIONS: { label: string; value: TabKey }[] = [
    { label: '概览', value: 'overview' },
    { label: '重型图表(lazy chunk)', value: 'chart' },
    { label: '设置', value: 'settings' },
];

/** 形似骨架:与重型面板最终布局同构,避免加载完成时的布局位移 */
const ChartSkeleton = () => (
    <div className="animate-pulse space-y-2" aria-label="图表骨架">
        <div className="h-3 w-40 rounded bg-gray-200 dark:bg-slate-700" />
        <div className="h-48 rounded-lg bg-gray-100 dark:bg-slate-800" />
    </div>
);

const LightPanel = ({ text }: { text: string }) => (
    <div className="rounded-lg border border-gray-100 p-6 text-sm text-gray-500 dark:border-slate-800 dark:text-slate-400">
        {text}
    </div>
);

interface TabSwitchDemoProps {
    /** 慢渲染强度,测试传 0 */
    perItemCost?: number;
    itemCount?: number;
}

/**
 * @example
 * <TabSwitchDemo />
 */
export const TabSwitchDemo = memo(({ perItemCost = 0.2, itemCount = 3000 }: TabSwitchDemoProps) => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [cooperative, setCooperative] = useState(true);
    const [isPending, startTransition] = useTransition();

    const handleSelect = (tab: TabKey) => {
        if (cooperative) {
            // 非紧急:内容渲染让位,当前 Tab 保持可交互
            startTransition(() => setActiveTab(tab));
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Segmented
                    options={[
                        { label: '同步切换(整页冻住)', value: false },
                        { label: '协作切换(lazy + Suspense + transition)', value: true },
                    ]}
                    value={cooperative}
                    onChange={(v) => setCooperative(v as boolean)}
                />
                {isPending && <Tag color="processing">切换调度中(isPending),当前 Tab 仍可交互</Tag>}
            </div>

            <Segmented
                options={TAB_OPTIONS}
                value={activeTab}
                onChange={(v) => handleSelect(v as TabKey)}
            />

            <div className={isPending ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                <Suspense fallback={<ChartSkeleton />}>
                    {activeTab === 'overview' && (
                        <LightPanel text="概览面板:轻量内容,渲染开销可忽略" />
                    )}
                    {activeTab === 'chart' && (
                        <HeavyChartPanel perItemCost={perItemCost} itemCount={itemCount} />
                    )}
                    {activeTab === 'settings' && (
                        <LightPanel text="设置面板:轻量内容,渲染开销可忽略" />
                    )}
                </Suspense>
            </div>
        </div>
    );
});

TabSwitchDemo.displayName = 'TabSwitchDemo';
