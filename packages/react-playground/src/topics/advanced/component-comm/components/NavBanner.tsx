/**
 * ============================================================================
 * NavBanner.tsx — 组件通信专题三页互链横幅
 * ============================================================================
 *
 * guide / playground / practice 三页共用的页头提示条,
 * sky 系配色(advanced 分类主题色),站内跳转一律 react-router Link。
 *
 * @module topics/advanced/component-comm/components/NavBanner
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

interface NavBannerProps {
    /** 当前所在页,该页不渲染链接 */
    current: 'guide' | 'playground' | 'practice';
}

const LINKS = [
    { key: 'guide', to: '/topics/advanced/component-comm-guide', label: '决策梳理', icon: <BookOutlined /> },
    { key: 'playground', to: '/topics/advanced/component-comm-playground', label: '模式演练', icon: <AppstoreOutlined /> },
    { key: 'practice', to: '/topics/advanced/component-comm-practice', label: '工作台实战', icon: <PartitionOutlined /> },
] as const;

/**
 * @example
 * <NavBanner current="guide" />
 */
export const NavBanner = memo(({ current }: NavBannerProps) => {
    return (
        <div className="rounded-card border border-sky-100 bg-sky-50/60 px-4 py-3 text-xs text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
            「组件通信」专题三页联动:
            {LINKS.filter((link) => link.key !== current).map((link) => (
                <Link
                    key={link.key}
                    to={link.to}
                    className="mx-1 font-medium underline underline-offset-2 hover:text-sky-800 dark:hover:text-sky-200"
                >
                    {link.icon} {link.label}
                </Link>
            ))}
        </div>
    );
});

NavBanner.displayName = 'NavBanner';
