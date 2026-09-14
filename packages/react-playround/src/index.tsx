import React from 'react';
import ReactDOM from 'react-dom/client';
import { RelayEnvironmentProvider } from 'react-relay';
import App from './App';
import { environment } from './relay/Environment';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
    // 创建根节点来调用 render 方法，能启动 React 的并行渲染机制
    const root = ReactDOM.createRoot(rootEl);
    root.render(
        // 开启严格模式，帮助发现潜在问题
        <React.StrictMode>
            {/* 提供 Relay 环境上下文 */}
            <RelayEnvironmentProvider environment={environment}>
                <App />
            </RelayEnvironmentProvider>
        </React.StrictMode>,
    );
}
