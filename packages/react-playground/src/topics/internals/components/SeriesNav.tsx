/**
 * ============================================================================
 * SeriesNav — 内部机制十页的页头互链
 * ============================================================================
 *
 * cyan 配色对齐本分类。当前页是纯文本,其余用 Link。
 *
 * @module topics/internals/components/SeriesNav
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { INTERNALS_SERIES, type InternalsTopicKey } from '../series';

interface SeriesNavProps {
    current: InternalsTopicKey;
}

export const SeriesNav = memo(({ current }: SeriesNavProps) => {
    return (
        <nav
            aria-label="内部机制系列导航"
            className="rounded-card space-y-3 border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-xs text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100"
        >
            {INTERNALS_SERIES.map((series) => (
                <div key={series.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="shrink-0 font-semibold text-cyan-800 dark:text-cyan-200">
                        {series.title}
                    </span>
                    {series.links.map((link) =>
                        link.key === current ? (
                            <span
                                key={link.key}
                                className="rounded-full bg-cyan-200/80 px-2 py-0.5 font-medium text-cyan-950 dark:bg-cyan-800/80 dark:text-cyan-50"
                            >
                                {link.label}
                            </span>
                        ) : (
                            <Link
                                key={link.key}
                                to={link.to}
                                className="rounded-full px-2 py-0.5 underline underline-offset-2 hover:text-cyan-950 dark:hover:text-cyan-50"
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
