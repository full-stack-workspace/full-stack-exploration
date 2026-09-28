/**
 * ============================================================================
 * SeriesNav — 性能优化三条系列的页头互链
 * ============================================================================
 *
 * amber 系配色对齐性能分类主题。当前页高亮为纯文本,其余用 Link。
 *
 * @module topics/performance/components/SeriesNav
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { PERFORMANCE_SERIES, type PerformanceTopicKey } from '../series';

interface SeriesNavProps {
    current: PerformanceTopicKey;
}

export const SeriesNav = memo(({ current }: SeriesNavProps) => {
    return (
        <nav
            aria-label="性能优化系列导航"
            className="rounded-card space-y-3 border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        >
            {PERFORMANCE_SERIES.map((series) => (
                <div key={series.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-300">
                        {series.title}
                    </span>
                    {series.links.map((link) =>
                        link.key === current ? (
                            <span
                                key={link.key}
                                className="rounded-full bg-amber-200/80 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-800/70 dark:text-amber-50"
                            >
                                {link.label}
                            </span>
                        ) : (
                            <Link
                                key={link.key}
                                to={link.to}
                                className="rounded-full px-2 py-0.5 underline underline-offset-2 hover:text-amber-950 dark:hover:text-amber-50"
                            >
                                {link.label}
                            </Link>
                        ),
                    )}
                </div>
            ))}
        </nav>
    );
});

SeriesNav.displayName = 'SeriesNav';
