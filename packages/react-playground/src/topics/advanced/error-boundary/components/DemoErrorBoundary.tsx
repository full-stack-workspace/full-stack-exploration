/**
 * ============================================================================
 * DemoErrorBoundary — 专题演示用错误边界
 * ============================================================================
 *
 * 比全局 AppErrorBoundary 更轻:分区名写进 fallback、支持重置、
 * 可选 onCatch 方便演示页记录「边界确实介入了」。
 *
 * 截至 React 19,错误边界仍只能用 class 组件实现。
 *
 * @module topics/advanced/error-boundary/components/DemoErrorBoundary
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from 'antd';

interface DemoBoundaryProps {
    children: ReactNode;
    /** 分区名,写进 fallback 与虚线框,用来对照嵌套粒度 */
    name: string;
    /** 重置回调:通常用来换 key 重挂子树 */
    onReset?: () => void;
    /** 捕获后的旁路通知(演示日志),不替代 componentDidCatch 上报 */
    onCatch?: (error: Error) => void;
}

interface DemoBoundaryState {
    error: Error | null;
}

/**
 * 演示用错误边界:getDerivedStateFromError 切 fallback,
 * componentDidCatch 打日志;重置时先清错误态,再交给父级决定是否重挂子树。
 */
export class DemoErrorBoundary extends Component<DemoBoundaryProps, DemoBoundaryState> {
    static displayName = 'DemoErrorBoundary';

    state: DemoBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): DemoBoundaryState {
        // Render 阶段:只能返回下一份 state,禁止副作用
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Commit 阶段:这里才能打日志 / 上报
        console.error(`[${this.props.name}] caught:`, error, info.componentStack);
        this.props.onCatch?.(error);
    }

    private handleReset = (): void => {
        this.setState({ error: null });
        this.props.onReset?.();
    };

    render(): ReactNode {
        const { name, children } = this.props;
        const { error } = this.state;

        if (error) {
            return (
                <div
                    data-testid={`boundary-fallback-${name}`}
                    className="space-y-3 rounded-card border border-red-200 bg-red-50 p-3 dark:border-red-900/70 dark:bg-red-950/40"
                    role="alert"
                >
                    <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{name} 捕获了异常</p>
                        <p className="mt-1 text-xs leading-relaxed text-red-600/80 dark:text-red-400/80">{error.message}</p>
                    </div>
                    <Button size="small" danger onClick={this.handleReset}>
                        重置「{name}」
                    </Button>
                </div>
            );
        }

        return (
            <div
                data-testid={`boundary-frame-${name}`}
                className="rounded-card border border-dashed border-sky-200 bg-sky-50/40 p-3 dark:border-sky-900 dark:bg-sky-950/20"
            >
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-sky-500">
                    Error Boundary · {name}
                </p>
                {children}
            </div>
        );
    }
}
