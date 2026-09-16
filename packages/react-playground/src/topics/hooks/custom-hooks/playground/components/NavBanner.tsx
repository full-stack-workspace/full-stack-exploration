/**
 * ============================================================================
 * NavBanner.tsx — 自定义 Hooks 专题三页互链横幅
 * ============================================================================
 *
 * guide / playground / composition 三页共用的页头提示条,
 * violet 系配色(hooks 分类主题色),站内跳转一律 react-router Link。
 *
 * @module topics/hooks/custom-hooks/playground/components/NavBanner
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

interface NavBannerProps {
    /** 当前所在页,该页不渲染链接 */
    current: 'guide' | 'playground' | 'composition';
}

const LINKS = [
    { key: 'guide', to: '/topics/hooks/custom-hooks-guide', label: '深入梳理', icon: <BookOutlined /> },
    { key: 'playground', to: '/topics/hooks/custom-hooks-playground', label: '原子演练', icon: <AppstoreOutlined /> },
    { key: 'composition', to: '/topics/hooks/custom-hooks-composition', label: '组合实战', icon: <PartitionOutlined /> },
] as const;

/**
 * @example
 * <NavBanner current="playground" />
 */
export const NavBanner = memo(({ current }: NavBannerProps) => {
    return (
        <div className="rounded-card border border-violet-100 bg-violet-50/60 px-4 py-3 text-xs text-violet-600 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300">
            「自定义 Hooks」专题三页联动:
            {LINKS.filter((link) => link.key !== current).map((link) => (
                <Link
                    key={link.key}
                    to={link.to}
                    className="mx-1 font-medium underline underline-offset-2 hover:text-violet-700 dark:hover:text-violet-200"
                >
                    {link.icon} {link.label}
                </Link>
            ))}
        </div>
    );
});

NavBanner.displayName = 'NavBanner';
