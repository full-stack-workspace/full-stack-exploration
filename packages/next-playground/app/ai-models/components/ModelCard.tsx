"use client";

import { cn } from "@/lib/utils";
import type { AIModel } from "@/types/ai-models";

/**
 * ============================================================================
 * ModelCard Component - 模型卡片组件
 * ============================================================================
 *
 * 【功能说明】
 * 展示单个 AI 模型的基本信息卡片，是模型列表中的最小展示单元。
 *
 * 【设计目标】
 * - 快速展示模型关键信息（名称、提供商、分类、难度）
 * - 支持选中状态的高亮反馈
 * - 提供点击交互用于选择模型
 *
 * 【Props】
 * - model: AIModel 类型，包含模型的完整信息（名称、图标、分类等）
 * - isSelected: boolean，表示当前卡片是否被选中（影响边框和背景样式）
 * - onClick: () => void，选中卡片时触发的回调函数
 *
 * 【可访问性设计】
 * - 使用 <button> 元素而非 <div>，支持键盘导航和屏幕阅读器
 * - 完整的点击区域（w-full）提升点击体验
 *
 * 【样式策略】
 * - 选中状态：primary 色系边框和背景，表示当前激活
 * - 非选中状态：neutral 色系边框，hover 时显示 primary 色调
 * - 难度等级颜色编码：
 *   - 红色系：专家/高级
 *   - 黄色系：中级
 *   - 绿色系：初级
 *
 * 【Streaming 关联】
 * - 此组件是流式加载的最终展示单元
 * - 随着 ModelList 分块加载数据，更多卡片会逐步"流入"页面
 * - 每个卡片独立，不依赖其他组件状态
 *
 * 【复用建议】
 * - 可直接在其他页面引入，无需修改
 * - Props 接口保持稳定，扩展性良好
 */
export function ModelCard({ model, isSelected, onClick }: { model: AIModel; isSelected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-300 hover:shadow-lg",
                isSelected
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                    : "border-neutral-200/60 bg-white hover:border-primary-200/60 dark:border-neutral-800/60 dark:bg-neutral-900 hover:dark:border-primary-800/60"
            )}
        >
            <div className="flex items-start gap-3">
                {/*
                 * 模型图标容器
                 * - 使用 gradient 背景增加视觉效果
                 * - shrink-0 防止图标随内容缩小
                 * - model.color 是动态类名（如 "from-blue-500 to-cyan-500"）
                 */}
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0", model.color)}>
                    {model.icon}
                </div>
                {/*
                 * 模型信息区域
                 * - flex-1 min-w-0 确保文本可以被截断
                 * - 开源标签仅在 model.isOpenSource 为 true 时显示
                 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">{model.name}</h3>
                        {model.isOpenSource && (
                            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">开源</span>
                        )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{model.provider}</p>
                </div>
            </div>
            {/*
             * 标签区域
             * - 展示模型分类和难度等级
             * - 难度等级颜色根据等级动态变化
             */}
            <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">{model.category}</span>
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full",
                    model.difficulty === "专家" || model.difficulty === "高级" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    model.difficulty === "中级" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                )}>{model.difficulty}</span>
            </div>
        </button>
    );
}
