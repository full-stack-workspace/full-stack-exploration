"use client";

import { cn } from "@/lib/utils";

/**
 * ============================================================================
 * MetricBar Component - 指标条组件
 * ============================================================================
 *
 * 【功能说明】
 * 展示单个性能指标的进度条，包括标签、数值和可视化条形。
 * 用于 ModelDetail 中展示模型的各项性能指标。
 *
 * 【设计目标】
 * - 直观展示指标的当前值和最大值之间的比例关系
 * - 通过颜色区分不同类型的指标
 * - 动画过渡效果使数值变化更平滑
 *
 * 【Props】
 * - label: string - 指标名称（如"响应延迟"、"吞吐量"）
 * - value: number - 当前数值
 * - maxValue: number - 最大值（用于计算百分比），默认 100
 * - color: string - 进度条颜色类名（如 "bg-blue-500"）
 *
 * 【百分比计算逻辑】
 * Math.min((value / maxValue) * 100, 100)
 *
 * - 除以最大值得到比例
 * - 乘以 100 转换为百分比
 * - 使用 Math.min 限制最大 100%（防止超出）
 *
 * 【样式设计】
 * - 外层容器：深色背景轨道（bg-neutral-100）
 * - 内层进度条：圆角、渐变色、transition 动画
 * - 标签和数值左右分布（flex justify-between）
 *
 * 【复用建议】
 * - 纯展示组件，无业务逻辑依赖
 * - 可直接在其他页面引入用于展示任意指标
 * - 颜色通过 props 控制，高度解耦
 */
export function MetricBar({ label, value, maxValue = 100, color }: { label: string; value: number; maxValue?: number; color: string }) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-50">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percentage  }%` }} />
            </div>
        </div>
    );
}
