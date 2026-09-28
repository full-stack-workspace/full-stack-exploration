/**
 * ============================================================================
 * NavBanner — RSC 专题两页互链
 * ============================================================================
 *
 * 梳理页与边界示意共用。indigo 对齐 React 基础分类。
 * 练习场没有 Server 运行时,两页都不执行真正的 RSC。
 *
 * @module topics/basics/rsc/components/NavBanner
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

interface NavBannerProps {
    current: 'guide' | 'boundary';
}

const LINKS = [
    { key: 'guide', to: '/topics/basics/rsc-guide', label: '深度梳理' },
    { key: 'boundary', to: '/topics/basics/rsc-boundary', label: '边界示意' },
] as const;

export const NavBanner = memo(({ current }: NavBannerProps) => {
    return (
        <div className="rounded-card border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
            本练习场是浏览器里的 <code className="font-mono">createRoot</code> 应用,没有 RSC
            运行时。下面是规则与流程,不是服务端组件在执行。
            <span className="mt-1 block">
                {LINKS.filter((link) => link.key !== current).map((link) => (
                    <Link
                        key={link.key}
                        to={link.to}
                        className="mr-3 font-medium underline underline-offset-2 hover:text-indigo-950 dark:hover:text-indigo-50"
                    >
                        {link.label}
                    </Link>
                ))}
            </span>
        </div>
    );
});

NavBanner.displayName = 'RscNavBanner';
