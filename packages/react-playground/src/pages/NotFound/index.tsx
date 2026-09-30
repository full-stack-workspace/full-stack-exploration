/**
 * ============================================================================
 * NotFound — 404 兜底页
 * ============================================================================
 *
 * 未匹配路由的落点(替代过去静默 Navigate 回首页的做法):
 * 告知用户页面不存在,并给出回首页与按分类浏览两条出路。
 * 分类入口从注册表派生,新增分类自动出现。
 *
 * @module pages/NotFound
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';

import { CATEGORIES, getTopicsByCategory } from '../../config/topics';
import { SITE_NAME } from '../../config/site';

/**
 * @example
 * <Route path="*" element={<NotFound />} />
 */
const NotFound = memo(() => {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
            <p className="bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-7xl font-bold text-transparent">
                404
            </p>
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-slate-50">
                这一页不在权衡录的条目里
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-slate-400">
                地址可能已调整或从未存在。回到首页,或直接从下面的分类挑一个专题继续练。
            </p>

            <Link
                to="/"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white shadow-card transition-colors hover:bg-primary-700"
            >
                <HomeOutlined />
                回到首页
            </Link>

            {/* 按分类浏览:注册表派生,与首页分组同源 */}
            <nav aria-label="按分类浏览" className="mt-12 w-full">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    按分类浏览
                </h2>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {CATEGORIES.map((c) => {
                        const first = getTopicsByCategory(c.key)[0];
                        return first ? (
                            <Link
                                key={c.key}
                                to={first.path}
                                className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-primary-500 dark:hover:text-primary-400"
                            >
                                {c.title}
                                <ArrowRightOutlined className="text-[10px] transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        ) : null;
                    })}
                </div>
            </nav>

            <p className="mt-12 text-xs text-gray-300 dark:text-slate-600">{SITE_NAME}</p>
        </div>
    );
});

NotFound.displayName = 'NotFound';

export default NotFound;
