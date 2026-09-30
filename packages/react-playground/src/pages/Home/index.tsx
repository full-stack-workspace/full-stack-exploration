/**
 * ============================================================================
 * Home — 首页(分类分组的专题导航 Hub)
 * ============================================================================
 *
 * 页面结构:Hero 区(品牌渐变 + 数据概览 + 主 CTA + 分类快捷入口)
 * + 「三页系列」直达区(梳理 → 演练 → 实战的站点招牌结构)
 * + 按分类分组的专题卡片网格。数据完全来自 config/topics 注册表与
 * config/site 品牌源,新专题注册后自动出现在对应分组中,本文件无需改动。
 *
 * @module pages/Home
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, RocketOutlined } from '@ant-design/icons';

import { TopicCard } from '../../components/TopicCard';
import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_EN, SITE_SLOGAN } from '../../config/site';
import {
    CATEGORIES,
    getTopicByPath,
    getTopicsByCategory,
    TOPICS,
} from '../../config/topics';

/* =================================================================
 * 三页系列:梳理 → 对照演练 → 实战,站点最强结构的首页直达
 * ================================================================ */

interface SeriesMeta {
    /** 系列名(卡片标题) */
    name: string;
    /** 一句话卖点 */
    blurb: string;
    /** 三页路径,顺序固定为 梳理 → 演练 → 实战 */
    paths: [string, string, string];
}

const SERIES_STEP_LABELS = ['梳理', '对照演练', '实战'] as const;

const SERIES: SeriesMeta[] = [
    {
        name: '函数组件与类组件',
        blurb: 'UI = f(state):新范式为什么更适合生产与并发',
        paths: [
            '/basics/fn-vs-class-guide',
            '/basics/fn-vs-class-playground',
            '/basics/fn-vs-class-practice',
        ],
    },
    {
        name: '自定义 Hooks',
        blurb: '从 8 个原子 Hook 分层组合出领域 Hook',
        paths: [
            '/hooks/custom-hooks-guide',
            '/hooks/custom-hooks-playground',
            '/hooks/custom-hooks-composition',
        ],
    },
    {
        name: '组件通信',
        blurb: '四问定通道,再把工单工作台拆到各自该在的通道',
        paths: [
            '/advanced/component-comm-guide',
            '/advanced/component-comm-playground',
            '/advanced/component-comm-practice',
        ],
    },
];

/* =================================================================
 * Hero 区
 * ================================================================ */

const Hero = memo(() => {
    // 统计全部从注册表派生,专题数随注册表自动更新
    const stats = [
        { value: CATEGORIES.length, label: '知识领域' },
        { value: TOPICS.length, label: '工程专题' },
        { value: SERIES.length, label: '三页系列' },
    ];

    return (
        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-primary-50/80 via-white to-violet-50/60 px-8 py-12 shadow-card sm:px-12 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-violet-950/40">
            {/* 装饰层:浅色柔光斑 + 淡点阵纹理,保持画面轻盈 */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(rgba(99,102,241,0.12) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }}
            />

            <div className="relative">
                {/* 眉题:英文副标,与 og 图同一口径 */}
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
                    {SITE_NAME_EN}
                </p>
                <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl dark:text-slate-50">
                    {SITE_NAME}
                    <span className="mt-1 block bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">
                        {SITE_SLOGAN}
                    </span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base dark:text-slate-400">
                    {SITE_DESCRIPTION}
                </p>

                {/* 主 CTA:锚点滚到分类区;次 CTA 直达三页系列 */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a
                        href="#categories"
                        className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 text-sm font-medium text-white shadow-card transition-colors hover:bg-primary-700"
                    >
                        <RocketOutlined />
                        开始练习
                    </a>
                    <a
                        href="#series"
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-6 py-2.5 text-sm font-medium text-gray-600 backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:text-primary-400"
                    >
                        三页系列直达
                        <ArrowRightOutlined className="text-xs" />
                    </a>
                </div>

                {/* 数据概览:数字与中文标签分层排版,避免直拼 */}
                <div className="mt-8 flex gap-8">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <div className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-slate-50">
                                {s.value}
                            </div>
                            <div className="mt-1 text-xs text-gray-400 dark:text-slate-500">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* 分类快捷入口 */}
                <div className="mt-8 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => {
                        const first = getTopicsByCategory(c.key)[0];
                        return first ? (
                            <Link
                                key={c.key}
                                to={first.path}
                                className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:text-primary-400"
                            >
                                {c.title}
                                <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        ) : null;
                    })}
                </div>
            </div>
        </section>
    );
});

Hero.displayName = 'Hero';

/* =================================================================
 * 三页系列直达区
 * ================================================================ */

const SeriesSection = memo(() => {
    return (
        <section id="series" className="mt-12 scroll-mt-6">
            <div className="mb-5">
                <h2 className="text-lg font-semibold leading-tight text-gray-800 dark:text-slate-100">
                    三页系列
                </h2>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    梳理 → 对照演练 → 实战:同一主题三页打透,这是本站的标准深度
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {SERIES.map((series) => (
                    <div
                        key={series.name}
                        className="flex flex-col rounded-card border border-gray-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h3 className="font-semibold text-gray-800 dark:text-slate-100">
                            {series.name}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                            {series.blurb}
                        </p>
                        <div className="mt-4 space-y-1.5">
                            {series.paths.map((path, i) => {
                                const topic = getTopicByPath(path);
                                if (!topic) {
                                    return null;
                                }
                                return (
                                    <Link
                                        key={path}
                                        to={path}
                                        className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400"
                                    >
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                                            {i + 1}
                                        </span>
                                        {SERIES_STEP_LABELS[i]}
                                        <ArrowRightOutlined className="ml-auto text-[10px] text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
});

SeriesSection.displayName = 'SeriesSection';

/* =================================================================
 * 分类分组
 * ================================================================ */

const Home = memo(() => {
    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <Hero />
            <SeriesSection />

            <div id="categories" className="mt-12 space-y-12 scroll-mt-6">
                {CATEGORIES.map((category) => {
                    const topics = getTopicsByCategory(category.key);
                    if (topics.length === 0) {
                        return null;
                    }
                    return (
                        <section key={category.key}>
                            {/* 分组标题:分类图标 + 名称 + 描述 + 数量 */}
                            <div className="mb-5 flex items-center gap-3">
                                <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${category.theme.iconChip}`}
                                >
                                    {category.theme.icon}
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold leading-tight text-gray-800 dark:text-slate-100">
                                        {category.title}
                                    </h2>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">{category.subtitle}</p>
                                </div>
                                <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                                    {topics.length} 个专题
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {topics.map((topic) => (
                                    <TopicCard key={topic.path} topic={topic} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
});

Home.displayName = 'Home';

export default Home;
