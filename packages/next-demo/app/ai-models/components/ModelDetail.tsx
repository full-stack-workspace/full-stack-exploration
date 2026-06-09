"use client";

import { useEffect,useState } from "react";

import { cn } from "@/lib/utils";
import type { AIModel, ModelMetrics } from "@/types/ai-models";

import { MetricBar } from "./MetricBar";

/**
 * ============================================================================
 * ModelDetail Component - 模型详情组件
 * ============================================================================
 *
 * 【功能说明】
 * 展示选中模型的详细信息，包括：
 * - 基本信息（名称、提供商、发布时间）
 * - 描述文本
 * - 性能指标（延迟、吞吐量、准确性、性价比）
 * - 技术参数（参数量、上下文窗口、训练数据截止日期）
 * - 能力标签列表
 *
 * 【核心机制：延迟加载】
 *
 * 当用户选择新模型时，详情区域不会立即显示完整内容，
 * 而是模拟真实场景中的数据获取延迟：
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ 用户点击模型卡片                                            │
 * │       ↓                                                    │
 * │ 切换选中状态 (selectedModel 变化)                           │
 * │       ↓                                                    │
 * │ ModelDetail 接收新的 model prop                              │
 * │       ↓                                                    │
 * │ useEffect 触发，isLoading = true（显示骨架屏）              │
 * │       ↓                                                    │
 * │ 等待 500ms（模拟 API 请求）                                 │
 * │       ↓                                                    │
 * │ 生成 metrics 数据，isLoading = false                        │
 * │       ↓                                                    │
 * │ 显示实际指标内容                                            │
 * └──────────────────────────────────────────────────────────────┘
 *
 * 【性能指标生成规则】
 *
 * | 指标       | 计算方式                                      |
 * |------------|----------------------------------------------|
 * | 延迟       | 语言模型：50-150ms，其他：100-200ms          |
 * | 准确性     | 专家级：95-105，高级：88-98，其他：80-90     |
 * | 吞吐量     | 50-200 随机                                  |
 * | 性价比     | 60-90 随机                                   |
 *
 * 【空状态处理】
 * 当 model 为 null 时，显示提示信息引导用户选择模型。
 * 使用虚线边框和垂直居中布局，暗示这是一个"占位"区域。
 *
 * 【Suspense 关联】
 * 此组件被 Suspense 边界包裹，但主要数据（model）来自父组件状态。
 * 内部的 metrics 数据通过 useEffect 延迟加载，展示 Suspense 嵌套效果。
 *
 * 【Props】
 * - model: AIModel | null - 当前选中的模型，null 时显示空状态
 *
 * 【子组件】
 * - MetricBar：用于展示各项性能指标的进度条
 */
export function ModelDetail({ model }: { model: AIModel | null }) {
    /*
     * isLoading 状态：控制 metrics 加载动画
     *
     * 何时变为 true：
     * - model prop 发生变化时
     *
     * 何时变为 false：
     * - 500ms 延迟后，metrics 数据生成完毕
     *
     * 作用：
     * - 控制显示骨架屏动画还是实际指标内容
     */
    const [isLoading, setIsLoading] = useState(false);

    /*
     * metrics 状态：存储性能指标数据
     *
     * 结构：
     * {
     *   latency: number;      // 响应延迟 (ms)
     *   throughput: number;   // 吞吐量 (tokens/s)
     *   accuracy: number;     // 准确性评分
     *   costEfficiency: number; // 性价比
     * }
     *
     * 何时重置为 null：
     * - model prop 发生变化时
     * - 确保切换模型时不会显示旧模型的指标
     */
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

    /*
     * useEffect：监听 model 变化，加载性能指标
     *
     * 【触发条件】
     * model prop 发生变化（用户选择了不同的模型）
     *
     * 【依赖数组】
     * [model] - 只有 model 变化时才执行
     *
     * 【执行流程】
     * 1. 如果 model 为 null，清空 metrics 并返回
     * 2. 设置 isLoading = true（显示加载动画）
     * 3. 清空 metrics（重置旧数据）
     * 4. 设置 500ms 延迟（模拟网络请求）
     * 5. 生成基于模型属性的 metrics 数据
     * 6. 设置 isLoading = false（隐藏加载动画）
     *
     * 【清理函数】
     * 清除定时器，防止组件卸载后设置状态（内存泄漏防护）
     */
    useEffect(() => {
        if (!model) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- 模型清空时重置指标，为有意设计
            setMetrics(null);
            return;
        }
        setIsLoading(true);
         
        setMetrics(null);
        const timer = setTimeout(() => {
            // 根据模型属性生成不同的基础值
            // 语言模型通常延迟更低
            const baseLatency = model.category === "语言模型" ? 50 : 100;
            // 专家级模型准确性更高
            const baseAccuracy = model.difficulty === "专家" ? 95 : model.difficulty === "高级" ? 88 : 80;
            setMetrics({
                latency: baseLatency + Math.floor(Math.random() * 100),
                throughput: 50 + Math.floor(Math.random() * 150),
                accuracy: baseAccuracy + Math.floor(Math.random() * 10),
                costEfficiency: 60 + Math.floor(Math.random() * 30),
            });
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [model]);

    /*
     * 空状态：未选择模型时显示
     *
     * 设计考量：
     * - 使用虚线边框暗示这是一个"占位"性质区域
     * - 居中显示提示文本，引导用户操作
     * - 避免使用骨架屏（因为没有可展示的内容）
     */
    if (!model) {
        return (
            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8">
                <div className="text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">从左侧选择一个模型</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">查看详细信息和性能指标</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/*
             * 模型头部信息
             * - 左侧：图标 + 名称 + 开源标签
             * - 右侧：提供商 + 发布日期
             */}
            <div className="flex items-start gap-4">
                <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shrink-0", model.color)}>{model.icon}</div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{model.name}</h2>
                        {model.isOpenSource && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">开源</span>}
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400">{model.provider} · {model.releaseDate}</p>
                </div>
            </div>

            {/*
             * 模型描述
             */}
            <p className="text-neutral-600 dark:text-neutral-400">{model.description}</p>

            {/*
             * 分类和难度标签
             */}
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{model.category}</span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{model.difficulty}</span>
            </div>

            {/*
             * 性能指标区域
             *
             * 展示逻辑：
             * - isLoading 为 true 或 metrics 为 null：显示骨架屏
             * - 否则：显示四个 MetricBar
             *
             * 骨架屏与实际内容结构相似，确保切换时布局稳定
             */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">性能指标</h3>
                {isLoading || !metrics ? (
                    /*
                     * 加载骨架屏
                     *
                     * 设计考量：
                     * - 与实际 MetricBar 相同结构（label + bar）
                     * - 使用 animate-pulse 动画模拟加载效果
                     * - 骨架宽度递增（20%, 40%, 60%, 80%）增加视觉层次
                     */
                    <div className="space-y-3 animate-pulse">
                        {["延迟", "吞吐量", "准确性", "性价比"].map((label, i) => (
                            <div key={label} className="space-y-1">
                                <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-neutral-200 dark:bg-neutral-700" style={{ width: `${20 + i * 20  }%` }} /></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /*
                     * 实际指标内容
                     *
                     * 四个 MetricBar 展示不同维度的性能：
                     * - 响应延迟：越低越好（蓝色）
                     * - 吞吐量：越高越好（绿色）
                     * - 准确性：越高越好（紫色）
                     * - 性价比：越高越好（琥珀色）
                     */
                    <div className="space-y-4">
                        <MetricBar label="响应延迟 (ms)" value={metrics.latency} maxValue={200} color="bg-blue-500" />
                        <MetricBar label="吞吐量 (tokens/s)" value={metrics.throughput} maxValue={200} color="bg-green-500" />
                        <MetricBar label="准确性评分" value={metrics.accuracy} maxValue={100} color="bg-purple-500" />
                        <MetricBar label="性价比" value={metrics.costEfficiency} maxValue={100} color="bg-amber-500" />
                    </div>
                )}
            </div>

            {/*
             * 技术参数网格
             *
             * 布局：2x2 网格
             * 内容：
             * - 参数量：模型权重数量
             * - 上下文窗口：最大输入 token 数
             * - 训练数据截止：训练数据的截止日期
             * - 开源许可：MIT 或专有
             */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 mb-1">参数量</p><p className="font-medium">{model.parameters}</p></div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 mb-1">上下文窗口</p><p className="font-medium">{model.contextWindow}</p></div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 mb-1">训练数据截止</p><p className="font-medium">{model.trainingCutoff}</p></div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 mb-1">开源许可</p><p className="font-medium">{model.isOpenSource ? "MIT" : "专有"}</p></div>
            </div>

            {/*
             * 模型能力标签
             *
             * 特点：
             * - 横向排列，自动换行
             * - 每个能力一个标签
             * - 来自 model.capabilities 数组
             */}
            <div className="flex flex-wrap gap-2">{model.capabilities.map((cap) => (<span key={cap} className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{cap}</span>))}</div>
        </div>
    );
}
