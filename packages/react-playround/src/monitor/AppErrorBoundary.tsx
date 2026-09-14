/**
 * @file AppErrorBoundary
 *
 * @description 应用错误边界组件，用于捕获应用级别的错误并展示错误信息
 *  目前 React 只能通过 Class component 来创建 Error Boundary
 *
 * @example
 * <AppErrorBoundary>
 *     <AppContent />
 * </AppErrorBoundary>
 */

import React from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    // 可选：用于记录错误信息到日志服务
    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        console.error('AppErrorBoundary caught an error:', error, info);
        // 可以将错误信息上报到日志服务
    }

    // 重新加载页面
    private handleReload = (): void => {
        window.location.reload();
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Result
                        status="error"
                        title="页面出错了"
                        subTitle="很抱歉，页面遇到了意外错误，请尝试刷新页面或联系管理员。"
                        extra={[
                            <Button
                                key="reload"
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleReload}
                                className="h-10 px-6"
                            >
                                刷新页面
                            </Button>,
                        ]}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
