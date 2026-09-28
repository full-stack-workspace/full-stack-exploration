/**
 * ============================================================================
 * NavBanner.tsx — 函数组件与类组件专题三页互链横幅
 * ============================================================================
 *
 * guide / playground / practice 三页共用的页头提示条,
 * indigo 系配色(basics 分类主题色),站内跳转一律 react-router Link。
 *
 * @module topics/basics/fn-vs-class/components/NavBanner
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

interface NavBannerProps {
    /** 当前所在页,该页不渲染链接 */
    current: 'guide' | 'playground' | 'practice';
}

const LINKS = [
    { key: 'guide', to: '/topics/basics/fn-vs-class-guide', label: '范式梳理', icon: <BookOutlined /> },
    { key: 'playground', to: '/topics/basics/fn-vs-class-playground', label: '对照演练', icon: <AppstoreOutlined /> },
    { key: 'practice', to: '/topics/basics/fn-vs-class-practice', label: '看板实战', icon: <PartitionOutlined /> },
] as const;

/**
 * @example
 * <NavBanner current="guide" />
 */
export const NavBanner = memo(({ current }: NavBannerProps) => {
    return (
        <div className="rounded-card border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
            「函数组件与类组件」专题三页联动:
            {LINKS.filter((link) => link.key !== current).map((link) => (
                <Link
                    key={link.key}
                    to={link.to}
                    className="mx-1 font-medium underline underline-offset-2 hover:text-indigo-800 dark:hover:text-indigo-200"
                >
                    {link.icon} {link.label}
                </Link>
            ))}
        </div>
    );
});

NavBanner.displayName = 'NavBanner';
