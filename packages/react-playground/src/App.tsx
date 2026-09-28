/**
 * ============================================================================
 * App — 应用根组件(注册表驱动的布局与路由)
 * ============================================================================
 *
 * 布局结构:视口锁死的壳层,顶部 Header 与左侧 Sider 不随专题正文滚动;
 * 仅右侧 Content 滚动。路由、顶部导航、侧边栏均由 topics 注册表派生。
 * 路由、顶部导航、侧边栏均由 src/config/topics.tsx 注册表派生;
 * 主题与模拟用户由 AppProviders 注入,新增专题无需改动本文件。
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
import { Layout, Menu } from 'antd';

import './index.css';

import { BrandMark } from './components/BrandMark';
import { DocumentTitle } from './components/DocumentTitle';
import { HeaderActions } from './components/HeaderActions';
import { Loading } from './components/Loading';
import { AppProviders } from './context/AppProviders';
import { useTheme } from './context/ThemeProvider';
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
    '/topics/hooks/use-context': '/topics/advanced/context',
    '/topics/advanced/suspense': '/performance/suspense-ui',
};

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <div className="flex items-center gap-3">
        <BrandMark />
        <div className="hidden sm:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-tight">
                React Playground
            </h1>
            <p className="text-xs text-gray-400 leading-tight dark:text-slate-500">生产级工程决策</p>
        </div>
    </div>
);

/* =================================================================
 * 布局与路由
 * ================================================================ */

const AppContent = () => {
    // 用于获取当前路径
    const location = useLocation();
    // 用于编程式导航
    const navigate = useNavigate();
    // 用于控制侧边栏的折叠状态
    const [collapsed, setCollapsed] = useState(false);

    // 当前路径所属分类,决定顶部导航高亮与侧边栏内容;首页不属于任何分类
    const currentCategory = getCategoryByPath(location.pathname);
    const themeMode = useTheme();
    const siderTheme = themeMode === 'dark' ? 'dark' : 'light';

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
        <Layout className="h-screen overflow-hidden dark:bg-slate-950">
            <DocumentTitle />
            {/* 顶部 Header:品牌 + 分类导航;壳层锁死视口后不再随内容滚走 */}
            <Header className="z-50 flex shrink-0 items-center gap-8 border-b border-gray-200 bg-white/90 px-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                <Brand />
                <Menu
                    mode="horizontal"
                    selectedKeys={[currentCategory ? currentCategory.basePath : '/']}
                    items={topNavItems}
                    onClick={handleTopNavClick}
                    className="border-0 bg-transparent flex-1 min-w-0"
                    style={{ background: 'transparent' }}
                />
                <HeaderActions />
            </Header>

            <Layout className="min-h-0 flex-1 overflow-hidden">
                {/* 侧边栏:仅在专题分类内显示,高度跟视口走,菜单过长时在栏内滚动 */}
                {currentCategory && (
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        className="h-full overflow-hidden border-r border-gray-200 dark:border-slate-800"
                        width={220}
                        theme={siderTheme}
                    >
                        <div className="flex h-full min-h-0 flex-col">
                            {!collapsed && (
                                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-slate-500">
                                        {currentCategory.title}
                                    </h2>
                                    <p className="mt-1 text-xs text-gray-300 dark:text-slate-600">
                                        {currentCategory.subtitle}
                                    </p>
                                </div>
                            )}
                            <div className="min-h-0 flex-1 overflow-y-auto py-2">
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

                {/* 主内容区:唯一跟着专题正文滚动的区域 */}
                <Content className="min-h-0 overflow-y-auto bg-gray-50 dark:bg-slate-950">
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
        <AppProviders>
            <Router>
                <AppContent />
            </Router>
        </AppProviders>
    );
};

export default App;
