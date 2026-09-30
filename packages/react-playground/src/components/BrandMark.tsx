/**
 * ============================================================================
 * BrandMark — 站点标识
 * ============================================================================
 *
 * 顶栏、抽屉导航与浏览器图标共用的标记。图形语义贴合「权衡录 · 对照取舍」:
 * 靛色圆角擂台内两页相向而立(浅色 vs 白色),中线处一枚琥珀色星火,
 * 表示两条技术路线在此对照、分出取舍。造型全部是大色块,16px favicon 可辨。
 * 图形与 public/favicon.svg 保持一致。
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
                {/* 对阵双方:两页相向微倾,浅色为守方、白色为攻方 */}
                <rect
                    x="5"
                    y="8.5"
                    width="9"
                    height="15"
                    rx="2.4"
                    fill="#C7D2FE"
                    transform="rotate(-9 9.5 16)"
                />
                <rect
                    x="18"
                    y="8.5"
                    width="9"
                    height="15"
                    rx="2.4"
                    fill="#fff"
                    transform="rotate(9 22.5 16)"
                />
                {/* 中线星火:对照分出胜负的一瞬 */}
                <rect
                    x="13.7"
                    y="13.7"
                    width="4.6"
                    height="4.6"
                    rx="1.1"
                    fill="#FBBF24"
                    transform="rotate(45 16 16)"
                />
            </g>
        </svg>
    );
}
