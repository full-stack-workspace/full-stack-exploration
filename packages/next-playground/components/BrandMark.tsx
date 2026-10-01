/**
 * ============================================================================
 * BrandMark — 站点标识
 * ============================================================================
 *
 * 五根从左到右渐次升高的刻度，落在墨色方印上，最右侧一根是磷光。
 * 它是首页那把渲染尺子的缩小版：左边静、右边动，signal 标出「当前这一格」。
 * 图形与 app/icon.svg 保持一致。
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
 * @param className - 控制宽高,默认 36px
 * @example
 * <BrandMark className="h-9 w-9" />
 */
export function BrandMark({ className = "h-9 w-9" }: BrandMarkProps) {
    const rawId = useId();
    const id = rawId.replace(/:/g, "");
    const clip = `${id}-clip`;

    // 底边对齐,高度递增,最后一根用磷光标出光谱右端
    const bars = [
        { x: 5.5, h: 7, fill: "#fff", opacity: 0.38 },
        { x: 10.4, h: 10, fill: "#fff", opacity: 0.55 },
        { x: 15.3, h: 13, fill: "#fff", opacity: 0.72 },
        { x: 20.2, h: 16, fill: "#fff", opacity: 0.88 },
        { x: 25.1, h: 19, fill: "#1ECAD3", opacity: 1 },
    ];

    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            className={className}
        >
            <defs>
                <clipPath id={clip}>
                    <rect width="32" height="32" rx="7" />
                </clipPath>
            </defs>
            <g clipPath={`url(#${clip})`}>
                <rect width="32" height="32" fill="#0C1620" />
                {bars.map((bar) => (
                    <rect
                        key={bar.x}
                        x={bar.x}
                        y={25.5 - bar.h}
                        width="2.6"
                        height={bar.h}
                        rx="0.6"
                        fill={bar.fill}
                        fillOpacity={bar.opacity}
                    />
                ))}
            </g>
        </svg>
    );
}
