/**
 * ============================================================================
 * StockCard — 股价工具调用的渲染产物
 * ============================================================================
 *
 * 模型返回 { tool: "stock", payload } 时渲染此卡片:
 * 价格、涨跌幅与近十日迷你走势图(内联 SVG,零依赖)。
 *
 * @module topics/ai-native/generative-ui/components/StockCard
 */

import { cn } from "@/lib/utils";

import type { StockPayload } from "../types";

/** 由点位数组生成 SVG polyline 坐标(归一化到 100×32 画布) */
function toPolyline(points: number[]): string {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const span = max - min || 1;
    return points
        .map((p, i) => {
            const x = (i / (points.length - 1)) * 100;
            // y 轴翻转:值越大越靠上
            const y = 32 - ((p - min) / span) * 28 - 2;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
}

export function StockCard({ payload }: { payload: StockPayload }) {
    const up = payload.changePct >= 0;
    return (
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:border-neutral-800/60 dark:bg-neutral-900">
            <div className="flex items-baseline justify-between">
                <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        {payload.name}
                        <span className="ml-2 font-mono text-xs text-neutral-400">{payload.symbol}</span>
                    </p>
                    <p className="mt-1 font-mono text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                        {payload.price.toFixed(2)}
                    </p>
                </div>
                <span
                    className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        up
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
                    )}
                >
                    {up ? "+" : ""}
                    {payload.changePct.toFixed(2)}%
                </span>
            </div>
            <svg viewBox="0 0 100 32" className="mt-3 h-12 w-full" preserveAspectRatio="none">
                <polyline
                    points={toPolyline(payload.points)}
                    fill="none"
                    strokeWidth="2"
                    className={up ? "stroke-emerald-500" : "stroke-rose-500"}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">近 10 个交易日收盘走势</p>
        </div>
    );
}
