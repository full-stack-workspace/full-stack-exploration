/**
 * ============================================================================
 * Home — 首页(分类分组的专题导航 Hub)
 * ============================================================================
 *
 * 页面结构:Hero 区(品牌渐变 + 数据概览 + 分类快捷入口)
 * + 按分类分组的专题卡片网格。数据完全来自 config/topics 注册表,
 * 新专题注册后自动出现在对应分组中,本文件无需改动。
 *
 * @module pages/Home
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

import { TopicCard } from '../../components/TopicCard';
import {
    CATEGORIES,
    getTopicsByCategory,
    TOPICS,
} from '../../config/topics';

/* =================================================================
 * Hero 区
 * ================================================================ */

const Hero = memo(() => {
    const doneCount = TOPICS.filter((t) => (t.status ?? 'done') === 'done').length;

    const stats = [
        { value: CATEGORIES.length, label: '专题分类' },
        { value: TOPICS.length, label: '演示专题' },
        { value: doneCount, label: '已完成' },
    ];

    return (
        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-primary-50/80 via-white to-violet-50/60 px-8 py-12 shadow-card sm:px-12">
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">
                    React Playground
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                    React{' '}
                    <span className="bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">
                        专题练习场
                    </span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
                    按专题组织的 React 学习与演练站点:从核心语法、Hooks 到进阶能力,
                    再到贴近业务的综合应用,每个专题都可交互、可对照源码。
                </p>

                {/* 数据概览 */}
                <div className="mt-8 flex gap-8">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                {s.value}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">{s.label}</div>
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
                                className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-4 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-600"
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
 * 分类分组
 * ================================================================ */

const Home = memo(() => {
    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <Hero />

            <div className="mt-12 space-y-12">
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
                                    <h2 className="text-lg font-semibold leading-tight text-gray-800">
                                        {category.title}
                                    </h2>
                                    <p className="text-xs text-gray-400">{category.subtitle}</p>
                                </div>
                                <span className="ml-auto rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
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
