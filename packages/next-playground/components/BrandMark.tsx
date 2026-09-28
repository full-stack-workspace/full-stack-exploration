/**
 * ============================================================================
 * BrandMark — 站点标识
 * ============================================================================
 *
 * 顶栏与浏览器图标共用的标记:蓝紫渐变圆角方印上,左侧一枚播放键,
 * 右侧三根渐次升高的信号条——「按下播放,内容分段流出」,
 * 对应本站的核心主题:渲染光谱与流式体验。图形与 app/icon.svg 保持一致。
 *
 * @module components/BrandMark
 */

import { useId } from "react";

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
export function BrandMark({ className = "h-10 w-10" }: BrandMarkProps) {
    // useId 保证同页多个标记的 gradient/clipPath id 不冲突
    const rawId = useId();
    const id = rawId.replace(/:/g, "");
    const bg = `${id}-bg`;
    const clip = `${id}-clip`;

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className={`${className} drop-shadow-[0_6px_10px_rgba(37,99,235,0.28)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]`}
        >
            <defs>
                <linearGradient id={bg} x1="3" y1="1" x2="29" y2="31" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="0.45" stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
                <clipPath id={clip}>
                    <rect width="32" height="32" rx="8" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
                <rect width="32" height="32" fill={`url(#${bg})`} />
                {/* 顶部高光 */}
                <ellipse cx="9" cy="-4" rx="16" ry="12" fill="#fff" fillOpacity="0.16" />
                {/* 播放键 */}
                <path
                    d="M8.2 9.1v13.8c0 .95 1.03 1.54 1.85 1.03l10.4-6.9a1.2 1.2 0 0 0 0-2.06l-10.4-6.9a1.2 1.2 0 0 0-1.85 1.03Z"
                    fill="#fff"
                />
                {/* 流式信号条:渐次升高,表示分段到达 */}
                <rect x="21.8" y="12" width="2.4" height="8" rx="1.2" fill="#fff" fillOpacity="0.75" />
                <rect x="25.4" y="9" width="2.4" height="14" rx="1.2" fill="#fff" fillOpacity="0.9" />
                <rect x="29" y="6" width="2.4" height="20" rx="1.2" fill="#fff" />
            </g>
        </svg>
    );
}
