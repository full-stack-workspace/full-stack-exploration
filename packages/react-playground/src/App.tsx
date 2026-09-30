/**
 * ============================================================================
 * App — 应用根组件(注册表驱动的布局与路由)
 * ============================================================================
 *
 * 布局结构:视口锁死的壳层,顶部 Header 与左侧 Sider 不随专题正文滚动;
 * 仅右侧 Content 滚动。路由、顶部导航、侧边栏均由 topics 注册表派生;
 * 品牌文案由 src/config/site.ts 派生;
 * 主题与模拟用户由 AppProviders 注入,新增专题无需改动本文件。
 *
 * 可访问性约定:品牌区不占 h1(每页仅内容区一个 h1);Header 前有
 * 「跳到主内容」skip link,落点是 Content 的 #main-content;md 以下
 * 顶栏导航收起为抽屉(Drawer),保证移动端可用。
 *
 * @module App
 */

import { Suspense, useState } from 'react';
import {
    BrowserRouter as Router,
    Link,
    Navigate,
    Route,
    Routes,
    useLocation,
    useNavigate,
    useParams,
} from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

import './index.css';

import BackToTop from './components/BackToTop';
import { BrandMark } from './components/BrandMark';
import { DocumentTitle } from './components/DocumentTitle';
import { HeaderActions } from './components/HeaderActions';
import { Loading } from './components/Loading';
import { AppProviders } from './context/AppProviders';
import { useTheme } from './context/ThemeProvider';
import { AppErrorBoundary } from './monitor/AppErrorBoundary';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { SITE_NAME, SITE_SLOGAN } from './config/site';
import { LEGACY_PREFIX_REDIRECTS, LEGACY_REDIRECTS } from './config/legacy-routes';
import {
    CATEGORIES,
    getCategoryByPath,
    getTopicsByCategory,
    TOPICS,
} from './config/topics';

const { Header, Sider, Content } = Layout;

/** 主内容区锚点 id,skip link 的落点 */
const MAIN_CONTENT_ID = 'main-content';

/* =================================================================
 * 旧路径重定向(规则集中在 config/legacy-routes.ts,含单测)
 * ================================================================ */

/**
 * 前缀通配重定向:读出 `*` 匹配的尾段拼到新裸前缀后。
 * React Router 6 按路由特异性匹配,静态的具体重定向(如 RSC 挪类)
 * 天然优先于这里的通配规则。
 */
const LegacyPrefixRedirect = ({ to }: { to: string }) => {
    const { '*': rest } = useParams();
    return <Navigate to={rest ? `${to}/${rest}` : to} replace />;
};

/* =================================================================
 * 品牌区
 * ================================================================ */

const Brand = () => (
    <Link
        to="/"
        aria-label="回到首页"
        className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
        <BrandMark />
        {/* 品牌名用 div 而非 h1:全站每页只在内容区保留一个 h1 */}
        <div className="hidden sm:block">
            <div className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-tight">
                {SITE_NAME}
            </div>
            <p className="text-xs text-gray-400 leading-tight dark:text-slate-500">{SITE_SLOGAN}</p>
        </div>
    </Link>
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
    const [siderBroken, setSiderBroken] = useState(false);
    // 移动端抽屉导航的开关
    const [navDrawerOpen, setNavDrawerOpen] = useState(false);

    // 当前路径所属分类,决定顶部导航高亮与侧边栏内容;首页不属于任何分类
    const currentCategory = getCategoryByPath(location.pathname);
    const themeMode = useTheme();
    const siderTheme = themeMode === 'dark' ? 'dark' : 'light';

    // 顶部导航:首页 + 各分类;点击分类时跳到该分类的第一个专题
    const topNavItems = [
        { key: '/', label: '首页' },
        ...CATEGORIES.map((c) => ({ key: c.basePath, label: c.title })),
    ];

    const navigateTo = (path: string) => {
        navigate(path);
        setNavDrawerOpen(false);
    };

    const handleTopNavClick = ({ key }: { key: string }) => {
        if (key === '/') {
            navigateTo('/');
            return;
        }
        const category = CATEGORIES.find((c) => c.basePath === key);
        const firstTopic = category && getTopicsByCategory(category.key)[0];
        if (firstTopic) {
            navigateTo(firstTopic.path);
        }
    };

    // 侧边栏:当前分类下的专题列表
    const sideNavItems = currentCategory
        ? getTopicsByCategory(currentCategory.key).map((t) => ({
              key: t.path,
              label: t.title,
          }))
        : [];

    // 移动端抽屉导航:完整「分类 → 专题」两级,注册表派生;分类分组仅作容器不可跳转
    const drawerNavItems = [
        { key: '/', label: '首页' },
        ...CATEGORIES.map((c) => ({
            key: c.key,
            label: c.title,
            children: getTopicsByCategory(c.key).map((t) => ({
                key: t.path,
                label: t.title,
            })),
        })),
    ];

    return (
        <Layout className="h-screen overflow-hidden dark:bg-slate-950">
            <DocumentTitle />
            {/* skip link:键盘/读屏用户可跳过重复导航直达主内容,默认视觉隐藏,聚焦时浮现 */}
            <a
                href={`#${MAIN_CONTENT_ID}`}
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:shadow-lg"
            >
                跳到主内容
            </a>
            {/* 顶部 Header:品牌 + 分类导航;壳层锁死视口后不再随内容滚走 */}
            <Header className="z-50 flex shrink-0 items-center gap-8 border-b border-gray-200 bg-white/90 px-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                <Brand />
                {/* md 以下顶栏 Menu 折叠成省略号不可用,收起为抽屉导航 */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[currentCategory ? currentCategory.basePath : '/']}
                    items={topNavItems}
                    onClick={handleTopNavClick}
                    className="border-0 bg-transparent flex-1 min-w-0 max-md:hidden"
                    style={{ background: 'transparent' }}
                />
                <Button
                    type="text"
                    aria-label="打开导航菜单"
                    icon={<MenuOutlined />}
                    onClick={() => setNavDrawerOpen(true)}
                    className="md:hidden"
                />
                <HeaderActions />
            </Header>

            {/* 移动端抽屉:两级导航(分类 → 专题) */}
            <Drawer
                placement="left"
                width={300}
                open={navDrawerOpen}
                onClose={() => setNavDrawerOpen(false)}
                title={
                    <span className="flex items-center gap-2">
                        <BrandMark className="h-6 w-6" />
                        {SITE_NAME}
                    </span>
                }
            >
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={currentCategory ? [currentCategory.key] : []}
                    items={drawerNavItems}
                    onClick={({ key }) => navigateTo(key)}
                    className="border-0"
                />
            </Drawer>

            <Layout className="min-h-0 flex-1 overflow-hidden">
                {/* 侧边栏:仅在专题分类内显示,高度跟视口走,菜单过长时在栏内滚动 */}
                {currentCategory && (
                    // lg 以下收起:长题在 220px 侧栏里会被挤成一字一行
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={setCollapsed}
                        breakpoint="lg"
                        onBreakpoint={(broken) => {
                            setSiderBroken(broken);
                            setCollapsed(broken);
                        }}
                        collapsedWidth={siderBroken ? 0 : 80}
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

                {/* 主内容区:唯一跟着专题正文滚动的区域;id 是 skip link 的落点 */}
                <Content
                    id={MAIN_CONTENT_ID}
                    tabIndex={-1}
                    className="min-h-0 overflow-y-auto bg-gray-50 dark:bg-slate-950"
                >
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

                                    {/* 旧路径重定向:具体规则(静态路由,特异性高于下方通配) */}
                                    {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
                                        <Route
                                            key={from}
                                            path={from}
                                            element={<Navigate to={to} replace />}
                                        />
                                    ))}

                                    {/* 旧路径通配迁移:/topics/<key>/* → /<key>/* */}
                                    {LEGACY_PREFIX_REDIRECTS.map(({ from, to }) => (
                                        <Route
                                            key={from}
                                            path={`${from}/*`}
                                            element={<LegacyPrefixRedirect to={to} />}
                                        />
                                    ))}

                                    {/* 兜底:404 页,不再是静默跳回首页 */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </AppErrorBoundary>
                        </Suspense>
                    </div>
                </Content>

                {/* 回到顶部:监听 Content 滚动,超过阈值才出现在右下角 */}
                <BackToTop targetId={MAIN_CONTENT_ID} />
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
