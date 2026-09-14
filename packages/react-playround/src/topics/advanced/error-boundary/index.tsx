/**
 * ============================================================================
 * Error Boundary — 进阶专题
 * ============================================================================
 *
 * 演示错误边界的工作机制:子组件渲染期间抛出的错误被边界捕获,
 * 只替换边界内的 UI,而不拖垮整棵组件树;支持重置恢复。
 *
 * @module topics/advanced/error-boundary
 */

import { Component, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

/* =================================================================
 * 演示用错误边界(支持 onReset 恢复,比全局 AppErrorBoundary 更轻)
 * ================================================================ */

interface DemoBoundaryProps {
    children: ReactNode;
    /** 重置回调:清除错误态并重新挂载子树 */
    onReset: () => void;
}

interface DemoBoundaryState {
    error: Error | null;
}

class DemoErrorBoundary extends Component<DemoBoundaryProps, DemoBoundaryState> {
    state: DemoBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): DemoBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('DemoErrorBoundary caught:', error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <Alert
                    type="error"
                    message="这个分区崩溃了"
                    description={this.state.error.message}
                    action={
                        <Button
                            size="small"
                            danger
                            onClick={() => {
                                this.setState({ error: null });
                                this.props.onReset();
                            }}
                        >
                            重置恢复
                        </Button>
                    }
                />
            );
        }
        return this.props.children;
    }
}

/* =================================================================
 * 会"爆炸"的组件
 * ================================================================ */

const BombedCounter = ({ explodeAt }: { explodeAt: number }) => {
    const [count, setCount] = useState(0);

    // 渲染期间抛错:只有错误边界能捕获渲染期的异常
    if (count >= explodeAt) {
        throw new Error(`计数达到 ${explodeAt},渲染期抛出了异常`);
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-700">{count}</span>
            <Button type="primary" onClick={() => setCount((c) => c + 1)}>
                +1(到 {explodeAt} 会抛错)
            </Button>
        </div>
    );
};

/* =================================================================
 * 专题页
 * ================================================================ */

const ErrorBoundaryTopic = () => {
    // 通过 key 重新挂载子树,配合边界重置实现"恢复"效果
    const [resetKey, setResetKey] = useState(0);

    return (
        <TopicPage
            title="Error Boundary"
            description="错误边界捕获子树渲染期的异常,只降级局部 UI,页面其余部分不受影响"
        >
            <TopicSection
                title="局部崩溃,局部降级"
                note="把计数加到 3:组件抛错后只有边界内的区域被替换为错误提示,页头、说明文字等其他区域保持正常"
            >
                <DemoErrorBoundary onReset={() => setResetKey((k) => k + 1)}>
                    <BombedCounter key={resetKey} explodeAt={3} />
                </DemoErrorBoundary>
            </TopicSection>

            <TopicSection
                title="为什么需要 class 组件?"
                note="截至 React 19,错误边界仍只能通过 class 组件的 getDerivedStateFromError / componentDidCatch 实现;函数组件暂无等价 API,本应用全局边界见 src/monitor/AppErrorBoundary.tsx"
            >
                <p className="text-sm text-gray-600">
                    本页使用的是一个支持重置的轻量边界(DemoErrorBoundary),实现就在当前专题目录的
                    index.tsx 中,可以直接阅读源码。
                </p>
            </TopicSection>
        </TopicPage>
    );
};

export default ErrorBoundaryTopic;
