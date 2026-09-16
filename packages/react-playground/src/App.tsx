/**
 * ============================================================================
 * App — 应用根组件(注册表驱动的布局与路由)
 * ============================================================================
 *
 * 布局结构:顶部 Header(品牌 + 分类导航) / 左侧 Sider(当前分类的专题列表)
 * / 右侧 Content(专题内容)。路由、顶部导航、侧边栏均由
 * src/config/topics.tsx 注册表派生,新增专题无需改动本文件。
 *
 * @module App
 */

import { Suspense, useState } from 'react';
import {
    BrowserRouter as Router,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from 'react-router-dom';
import { ConfigProvider, Layout, Menu } from 'antd';

import './index.css';

import { Loading } from './components/Loading';
import { AppErrorBoundary } from './monitor/AppErrorBoundary';
import Home from './pages/Home';
import {
    CATEGORIES,
    getCategoryByPath,
    getTopicsByCategory,
    TOPICS,
} from './config/topics';

const { Header, Sider, Content } = Layout;

/* =================================================================
 * 旧路径重定向表(信息架构调整前的地址,保持可访问)
 * ================================================================ */

const LEGACY_REDIRECTS: Record<string, string> = {
    '/todo': '/apps/todo',
    '/bookkeeping': '/apps/bookkeeping',
    '/shopping-cart': '/apps/shopping-cart',
    '/relay-example': '/topics/advanced/relay',
};

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md shadow-primary-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div className="hidden sm:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-tight">
                React Playground
            </h1>
            <p className="text-xs text-gray-400 leading-tight">专题练习场</p>
        </div>
    </div>
);

/* =================================================================
 * 布局与路由
 * ================================================================ */

const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    // 当前路径所属分类,决定顶部导航高亮与侧边栏内容;首页不属于任何分类
    const currentCategory = getCategoryByPath(location.pathname);

    // 顶部导航:首页 + 各分类;点击分类时跳到该分类的第一个专题
    const topNavItems = [
        { key: '/', label: '首页' },
        ...CATEGORIES.map((c) => ({ key: c.basePath, label: c.title })),
    ];

    const handleTopNavClick = ({ key }: { key: string }) => {
        if (key === '/') {
            navigate('/');
            return;
        }
        const category = CATEGORIES.find((c) => c.basePath === key);
        const firstTopic = category && getTopicsByCategory(category.key)[0];
        if (firstTopic) {
            navigate(firstTopic.path);
        }
    };

    // 侧边栏:当前分类下的专题列表
    const sideNavItems = currentCategory
        ? getTopicsByCategory(currentCategory.key).map((t) => ({
              key: t.path,
              label: t.title,
          }))
        : [];

    return (
        <Layout className="min-h-screen">
            {/* 顶部 Header:品牌 + 分类导航 */}
            <Header className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 flex items-center gap-8 sticky top-0 z-50 shadow-sm">
                <Brand />
                <Menu
                    mode="horizontal"
                    selectedKeys={[currentCategory ? currentCategory.basePath : '/']}
                    items={topNavItems}
                    onClick={handleTopNavClick}
                    className="border-0 bg-transparent flex-1 min-w-0"
                    style={{ background: 'transparent' }}
                />
            </Header>

            <Layout>
                {/* 侧边栏:仅在专题分类内显示 */}
                {currentCategory && (
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        className="bg-white border-r border-gray-200"
                        width={220}
                        theme="light"
                    >
                        <div className="h-full flex flex-col">
                            {!collapsed && (
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {currentCategory.title}
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-300">
                                        {currentCategory.subtitle}
                                    </p>
                                </div>
                            )}
                            <div className="flex-1 overflow-auto py-2">
                                <Menu
                                    mode="inline"
                                    selectedKeys={[location.pathname]}
                                    items={sideNavItems}
                                    onClick={({ key }) => navigate(key)}
                                    className="border-0 bg-transparent"
                                />
                            </div>
                        </div>
                    </Sider>
                )}

                {/* 主内容区 */}
                <Content className="bg-gray-50">
                    <div className={currentCategory ? 'p-6' : ''}>
                        <Suspense fallback={<Loading />}>
                            <AppErrorBoundary>
                                <Routes>
                                    <Route path="/" element={<Home />} />

                                    {/* 分类入口:重定向到该分类第一个专题 */}
                                    {CATEGORIES.map((c) => {
                                        const first = getTopicsByCategory(c.key)[0];
                                        return first ? (
                                            <Route
                                                key={c.basePath}
                                                path={c.basePath}
                                                element={<Navigate to={first.path} replace />}
                                            />
                                        ) : null;
                                    })}

                                    {/* 注册表驱动的专题路由 */}
                                    {TOPICS.map((t) => (
                                        <Route
                                            key={t.path}
                                            path={t.path}
                                            element={<t.element />}
                                        />
                                    ))}

                                    {/* 旧路径重定向 */}
                                    {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
                                        <Route
                                            key={from}
                                            path={from}
                                            element={<Navigate to={to} replace />}
                                        />
                                    ))}

                                    {/* 兜底 */}
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </AppErrorBoundary>
                        </Suspense>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

const App = () => {
    return (
        // antd 主题 token 与 tailwind.config.js 的设计 token 对齐
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#4f46e5',
                    borderRadius: 8,
                },
            }}
        >
            <Router>
                <AppContent />
            </Router>
        </ConfigProvider>
    );
};

export default App;
