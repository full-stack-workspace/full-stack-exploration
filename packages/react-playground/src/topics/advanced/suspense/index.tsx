/**
 * ============================================================================
 * Suspense — 进阶专题
 * ============================================================================
 *
 * 演示 React.lazy + Suspense 的代码分割与加载态声明:
 * 人为延迟 1.5s 加载一个"重组件",观察 fallback 的展示与替换过程。
 *
 * @module topics/advanced/suspense
 */

import { lazy, Suspense, useState } from 'react';
import type { ComponentType } from 'react';
import { Button } from 'antd';
import { Spin } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

// 人为加 1.5s 延迟,模拟大体积 chunk 的网络加载过程
const HeavyPanel = lazy(
    () =>
        new Promise<{ default: ComponentType }>((resolve) => {
            setTimeout(() => {
                import('./HeavyPanel').then((m) => resolve({ default: m.default }));
            }, 1500);
        }),
);

const SuspenseTopic = () => {
    const [loadKey, setLoadKey] = useState(0);

    return (
        <TopicPage
            title="Suspense"
            description="用声明式的 fallback 处理异步加载态,配合 React.lazy 实现代码分割"
        >
            <TopicSection
                title="懒加载一个重组件"
                note="点击加载后,组件代码经过 1.5s 模拟网络延迟才到达:期间 Suspense 渲染 fallback,到达后无缝替换"
            >
                <div className="space-y-4">
                    <Button
                        type="primary"
                        onClick={() => setLoadKey((k) => k + 1)}
                    >
                        {loadKey === 0 ? '加载重组件' : '重新加载'}
                    </Button>
                    {loadKey > 0 && (
                        // key 变化会强制重新挂载,便于反复观察加载过程
                        <Suspense
                            key={loadKey}
                            fallback={
                                <div className="flex items-center gap-2 rounded-card border border-dashed border-primary-200 bg-primary-50 p-6 text-primary-600">
                                    <Spin size="small" />
                                    <span>chunk 加载中(模拟 1.5s 网络延迟)...</span>
                                </div>
                            }
                        >
                            <HeavyPanel />
                        </Suspense>
                    )}
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default SuspenseTopic;
