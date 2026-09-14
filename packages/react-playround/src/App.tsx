import { useState, Suspense } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Home from './pages/Home';
import Posts from './pages/Posts';
import { ShoppingCart } from './pages/ShoppingCart';
import RelayExample from './pages/RelayExample';
import Todo from './pages/Todo';
import Bookkeeping from './pages/Bookkeeping';
import './index.css';

import { Loading } from './components/Loading';

import { AppErrorBoundary } from './monitor/AppErrorBoundary';

const { Header, Sider, Content } = Layout;

// Import navigation configuration with type assertion
import {
    mainNavItems,
    sideNavItems,
} from './config/navigation';

import type { MenuProps } from 'antd';

const AppContent = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const secondaryNavItems = sideNavItems[location.pathname] || [];

    return (
        <Suspense fallback={<Loading />}>
            <Layout className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header with gradient and shadow */}
                <Header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    {/* Brand section */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                React Playground
                            </h1>
                            <p className="text-xs text-gray-400 -mt-1">Build & Experiment</p>
                        </div>
                    </div>

                    {/* Main navigation */}
                    <Menu
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={mainNavItems as MenuProps['items']}
                        className="border-0 bg-transparent flex-1 justify-end min-w-0"
                        style={{ background: 'transparent' }}
                    />
                </Header>

                <Layout className="mt-0">
                    {/* Sidebar with improved styling */}
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        className="bg-white border-r border-gray-200 shadow-sm"
                        width={220}
                        theme="light"
                        trigger={null}
                    >
                        <div className="h-full flex flex-col">
                            {/* Sidebar header */}
                            {!collapsed && (
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Navigation
                                    </h2>
                                </div>
                            )}

                            {/* Sidebar menu */}
                            <div className="flex-1 overflow-auto py-2">
                                <Menu
                                    mode="vertical"
                                    selectedKeys={[location.pathname]}
                                    items={secondaryNavItems as MenuProps['items']}
                                    className="border-0 bg-transparent px-2"
                                    defaultOpenKeys={['/']}
                                />
                            </div>

                            {/* Collapse toggle button */}
                            <div
                                className="p-3 border-t border-gray-100 flex justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setCollapsed(!collapsed)}
                            >
                                <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>
                        </div>
                    </Sider>

                    {/* Main content area */}
                    <Content className="m-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)]">
                        <div className="h-full">
                            <Suspense fallback={<Loading />}>
                                <AppErrorBoundary>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/hooks" element={<Posts />} />
                                        <Route path="/shopping-cart" element={<ShoppingCart />} />
                                        <Route path="/relay-example" element={<RelayExample />} />
                                        <Route path="/todo" element={<Todo />} />
                                        <Route path="/bookkeeping" element={<Bookkeeping />} />
                                    </Routes>
                                </AppErrorBoundary>
                            </Suspense>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Suspense>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
