/**
 * ============================================================================
 * SeriesNav — 原理与架构十页的页头互链
 * ============================================================================
 *
 * fuchsia 配色对齐本分类。当前页是纯文本,其余用 Link。
 *
 * @module topics/architecture/components/SeriesNav
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { ARCHITECTURE_SERIES, type ArchitectureTopicKey } from '../series';

interface SeriesNavProps {
    current: ArchitectureTopicKey;
}

export const SeriesNav = memo(({ current }: SeriesNavProps) => {
    return (
        <nav
            aria-label="原理与架构系列导航"
            className="rounded-card space-y-3 border border-fuchsia-100 bg-fuchsia-50/70 px-4 py-3 text-xs text-fuchsia-900 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-100"
        >
            {ARCHITECTURE_SERIES.map((series) => (
                <div key={series.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="shrink-0 font-semibold text-fuchsia-800 dark:text-fuchsia-200">
                        {series.title}
                    </span>
                    {series.links.map((link) =>
                        link.key === current ? (
                            <span
                                key={link.key}
                                className="rounded-full bg-fuchsia-200/80 px-2 py-0.5 font-medium text-fuchsia-950 dark:bg-fuchsia-800/80 dark:text-fuchsia-50"
                            >
                                {link.label}
                            </span>
                        ) : (
                            <Link
                                key={link.key}
                                to={link.to}
                                className="rounded-full px-2 py-0.5 underline underline-offset-2 hover:text-fuchsia-950 dark:hover:text-fuchsia-50"
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
