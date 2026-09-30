/**
 * ============================================================================
 * TopicNav.tsx — 专题页头互链横幅(共享组件)
 * ============================================================================
 *
 * 多页专题(fn-vs-class / custom-hooks / component-comm / rsc / agent)
 * 共用的页头互链条:导语 + 除当前页外的专题内链接,当前页不渲染链接。
 * 配色从专题注册表 CategoryTheme.banner 取,与分类视觉同源;
 * 各专题的 links 集中在各自的 nav.tsx,由 TopicNav.test.tsx 校验
 * 每个 to 都存在于注册表,防止路径漂移。
 *
 * @module components/TopicNav
 */

import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { getCategoryMeta } from '../config/topics';
import type { BannerTheme, CategoryKey } from '../config/topics';

export interface TopicNavLink {
    /** 目标路径,必须存在于专题注册表(TopicNav.test.tsx 防漂移) */
    to: string;
    /** 链接文字 */
    label: string;
    /** 可选前置图标 */
    icon?: ReactNode;
}

interface TopicNavProps {
    /** 导语,如「函数组件与类组件」专题三页联动: */
    title: ReactNode;
    /** 互链条目;当前页除外逐个渲染为链接 */
    links: readonly TopicNavLink[];
    /** 当前页 path,该页不渲染链接 */
    current: string;
    /** 分类 key,配色取注册表 CategoryTheme.banner;缺省回退 gray */
    category?: CategoryKey;
    /** 导语上方的补充说明(如 SPA 环境免责声明) */
    note?: ReactNode;
}

/** 未指定分类时的中性配色 */
const FALLBACK_BANNER: BannerTheme = {
    border: 'border-gray-200 dark:border-slate-700',
    bg: 'bg-gray-50/60 dark:bg-slate-900/40',
    text: 'text-gray-600 dark:text-slate-300',
    linkHover: 'hover:text-gray-900 dark:hover:text-slate-100',
};

/**
 * @example
 * <TopicNav
 *     title="「组件通信」专题三页联动:"
 *     links={COMPONENT_COMM_NAV_LINKS}
 *     current="/advanced/component-comm-guide"
 *     category="advanced"
 * />
 */
export const TopicNav = memo(({ title, links, current, category, note }: TopicNavProps) => {
    const theme = category ? getCategoryMeta(category).theme.banner : FALLBACK_BANNER;
    const others = links.filter((link) => link.to !== current);

    return (
        <div
            className={`rounded-card border px-4 py-3 text-xs leading-relaxed ${theme.border} ${theme.bg} ${theme.text}`}
        >
            {note ? <span className="mb-1 block">{note}</span> : null}
            {title}
            {others.map((link) => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`mx-1 font-medium underline underline-offset-2 ${theme.linkHover}`}
                >
                    {link.icon} {link.label}
                </Link>
            ))}
        </div>
    );
});

TopicNav.displayName = 'TopicNav';
