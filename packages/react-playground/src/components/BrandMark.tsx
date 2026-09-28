/**
 * ============================================================================
 * BrandMark — 站点标识
 * ============================================================================
 *
 * 顶栏与浏览器图标共用的标记:靛色圆角方印上叠着两页,后页从左上露出一角,
 * 前页写着两行。表示把判断写成可对照的一页。图形与 public/favicon.svg 保持一致。
 *
 * @module components/BrandMark
 */

import { useId } from 'react';

interface BrandMarkProps {
    /** 额外类名,用来控制尺寸 */
    className?: string;
}

/**
 * 站点品牌标记。
 *
 * @param className - 控制宽高,默认 40px
 * @example
 * <BrandMark className="h-10 w-10" />
 */
export function BrandMark({ className = 'h-10 w-10' }: BrandMarkProps) {
    const rawId = useId();
    const id = rawId.replace(/:/g, '');
    const bg = `${id}-bg`;
    const clip = `${id}-clip`;

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className={`${className} drop-shadow-[0_6px_10px_rgba(67,56,202,0.28)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]`}
        >
            <defs>
                <linearGradient id={bg} x1="3" y1="1" x2="29" y2="31" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#A5B4FC" />
                    <stop offset="0.42" stopColor="#6366F1" />
                    <stop offset="1" stopColor="#312E81" />
                </linearGradient>
                <clipPath id={clip}>
                    <rect width="32" height="32" rx="8" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
                <rect width="32" height="32" fill={`url(#${bg})`} />
                <ellipse cx="8" cy="-4" rx="16" ry="12" fill="#fff" fillOpacity="0.14" />
                <rect x="5.2" y="5.5" width="14.6" height="15.6" rx="3" fill="#E0E7FF" />
                <rect x="12" y="11" width="14.6" height="15.6" rx="3" fill="#fff" />
                <rect x="14.5" y="14.5" width="9.4" height="1.8" rx="0.9" fill="#3730A3" />
                <rect x="14.5" y="18" width="6.2" height="1.8" rx="0.9" fill="#6366F1" />
            </g>
        </svg>
    );
}
