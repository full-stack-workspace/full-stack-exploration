/**
 * ============================================================================
 * NavBanner.tsx — 性能优化专题三页互链横幅
 * ============================================================================
 *
 * transition-deferred / suspense-ui / render-scheduling-guide 三页共用,
 * amber 系配色(performance 分类主题色),站内跳转一律 react-router Link。
 *
 * @module topics/performance/transition-deferred/components/NavBanner
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BookOutlined, ExperimentOutlined, LayoutOutlined } from '@ant-design/icons';

interface NavBannerProps {
    /** 当前所在页,该页不渲染链接 */
    current: 'transition-deferred' | 'suspense-ui' | 'guide';
}

const LINKS = [
    { key: 'transition-deferred', to: '/performance/transition-deferred', label: 'transition × deferred 演练', icon: <ExperimentOutlined /> },
    { key: 'suspense-ui', to: '/performance/suspense-ui', label: 'Suspense 骨架演练', icon: <LayoutOutlined /> },
    { key: 'guide', to: '/performance/render-scheduling-guide', label: '渲染调度梳理', icon: <BookOutlined /> },
] as const;

/**
 * @example
 * <NavBanner current="transition-deferred" />
 */
export const NavBanner = memo(({ current }: NavBannerProps) => {
    return (
        <div className="rounded-card border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            「性能优化 · 渲染调度」专题三页联动:
            {LINKS.filter((link) => link.key !== current).map((link) => (
                <Link
                    key={link.key}
                    to={link.to}
                    className="mx-1 font-medium underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-200"
                >
                    {link.icon} {link.label}
                </Link>
            ))}
        </div>
    );
});

NavBanner.displayName = 'NavBanner';
