"use client";

import { Suspense, useState } from "react";
import type { AIModel } from "@/types/ai-models";
import { ModelList } from "./ModelList";
import { ModelDetail } from "./ModelDetail";
import { PerformanceMonitor } from "./PerformanceMonitor";

/**
 * ============================================================================
 * Suspense Fallback Components - Suspense 骨架屏组件
 * ============================================================================
 *
 * 【功能说明】
 * 为 Suspense 边界提供骨架屏占位内容，在异步数据加载期间展示。
 * 骨架屏与实际组件结构相似，确保布局稳定，减少布局跳动。
 *
 * 【设计原则】
 * 1. 结构相似：骨架屏结构与实际渲染内容保持一致
 * 2. 动画效果：使用 animate-pulse 提供加载中视觉反馈
 * 3. 布局稳定：占位空间与实际内容相同，避免页面跳动
 *
 * 【组件列表】
 * - ModelListSkeleton：ModelList 的骨架屏
 * - ModelDetailSkeleton：ModelDetail 的骨架屏
 */

/**
 * ModelListSkeleton - 模型列表骨架屏
 *
 * 【用途】
 * 在 ModelList 组件数据加载期间显示占位符。
 *
 * 【结构设计】
 * - 6 个卡片网格布局（与 ModelList 实际布局一致）
 * - 每个卡片包含：
 *   - 图标占位（w-12 h-12 灰色方块）
 *   - 标题占位（h-5 w-24 灰色条）
 *   - 副标题占位（h-4 w-16 灰色条）
 *
 * 【样式】
 * - 使用 animate-pulse 脉冲动画模拟加载效果
 * - 响应式布局：1列 → 2列 → 3列
 */
function ModelListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900 animate-pulse"
                >
                    <div className="flex items-start gap-3">
                        {/*
                         * 图标占位
                         * - 尺寸：w-12 h-12（48x48）
                         * - 圆角：rounded-xl
                         * - 颜色：bg-neutral-200 / bg-neutral-800（暗色）
                         */}
                        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="flex-1">
                            {/*
                             * 标题占位
                             * - 宽度：w-24（约 96px）
                             * - 高度：h-5（约 20px）
                             */}
                            <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 mb-2" />
                            {/*
                             * 副标题占位
                             * - 宽度：w-16（约 64px）
                             * - 高度：h-4（约 16px）
                             */}
                            <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * ModelDetailSkeleton - 模型详情骨架屏
 *
 * 【用途】
 * 在 ModelDetail 组件数据加载期间显示占位符。
 *
 * 【结构设计】
 * - 与 ModelDetail 实际布局结构相似
 * - 包含：
 *   - 头部：图标占位 + 标题占位
 *   - 内容区：多行列占位
 *
 * 【样式】
 * - 使用 animate-pulse 脉冲动画
 * - 容器样式与 ModelDetail 实际容器一致
 */
function ModelDetailSkeleton() {
    return (
        <div className="p-6 rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900 animate-pulse">
            <div className="space-y-4">
                {/*
                 * 头部区域
                 * - 图标：w-16 h-16 圆形占位
                 * - 标题：h-6 w-32 占位
                 * - 副标题：h-4 w-20 占位
                 */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div>
                        <div className="h-6 w-32 rounded bg-neutral-200 dark:bg-neutral-800 mb-2" />
                        <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ============================================================================
 * AIModelsContent Component - AI 模型广场主容器组件
 * ============================================================================
 *
 * 【功能说明】
 * AI 模型广场页面的主内容组件，负责：
 * - 组织页面整体布局（Header、主体内容、监控区域）
 * - 管理全局状态（选中的模型）
 * - 配置 Suspense 边界
 *
 * 【架构位置】
 * 本组件是页面核心的 Client Component，承上启下：
 * - page.tsx（Server Component）导入并渲染本组件
 * - 本组件负责渲染所有子组件
 *
 * 【组件层级】
 *
 *  AIModelsContent（Client Component）
 *       │
 *       ├── Header Section（静态 JSX）
 *       │       └── 页面标题和描述
 *       │
 *       ├── Main Content（使用 Suspense）
 *       │       │
 *       │       ├── ModelList（Client Component）
 *       │       │       └── ModelCard
 *       │       │
 *       │       └── ModelDetail（Client Component）
 *       │               └── MetricBar
 *       │
 *       └── Performance Monitor Section
 *               └── PerformanceMonitor
 *
 * 【状态管理】
 *
 * selectedModel 状态：
 * - 类型：AIModel | null
 * - 初始值：null（无选中）
 * - 用途：记录当前用户选中的模型，传递给 ModelDetail 显示
 *
 * detailKey 状态：
 * - 类型：number
 * - 初始值：0
 * - 用途：强制刷新 ModelDetail 组件
 *
 * 【为什么需要 detailKey】
 *
 * 问题场景：
 * - 用户选中模型 A，显示 A 的详情
 * - 用户再次选中模型 A（相同模型）
 * - React 可能会优化掉相同的 props 更新
 * - 导致 useEffect 不执行，详情不刷新
 *
 * 解决方案：
 * - detailKey 每次选择时递增
 * - 改变 key 强制 React 卸载旧组件、挂载新组件
 * - 确保 useEffect 一定执行
 *
 * 【Suspense 边界配置】
 *
 * 边界 1：ModelList
 * - fallback：ModelListSkeleton（6 个占位卡片）
 * - 作用：数据加载期间显示占位符，保持布局稳定
 *
 * 边界 2：ModelDetail
 * - fallback：ModelDetailSkeleton（详情区域占位符）
 * - 作用：详情加载时保持布局稳定
 *
 * 【Streaming 机制关联】
 *
 * 整体页面采用 Streaming 架构：
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │ Server Component (page.tsx)                                 │
 * │    │                                                       │
 * │    ├── 立即返回：静态 HTML（Header 内容）                   │
 * │    │                                                       │
 * │    └── 异步：Suspense 边界内的内容                          │
 * │            │                                               │
 * │            ├── ModelList 加载中 → 显示 ModelListSkeleton    │
 * │            │                                               │
 * │            └── ModelList 数据就绪 → 显示实际列表              │
 * └──────────────────────────────────────────────────────────────┘
 *
 * 【Props】
 * 本组件无 props，作为根 Client Component 使用
 */
export function AIModelsContent() {
    /*
     * selectedModel 状态：当前选中的模型
     *
     * 管理方式：
     * - 初始为 null（无模型选中）
     * - 用户点击模型卡片时通过 onSelectModel 更新
     * - 传递给 ModelDetail 用于显示详情
     */
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

    /*
     * detailKey 状态：ModelDetail 的渲染 key
     *
     * 用途：
     * - 用于强制刷新 ModelDetail 组件
     * - 当 detailKey 变化时，React 会认为这是"新"组件
     * - 触发组件卸载（unmount）再挂载（mount）
     *
     * 触发时机：
     * - handleSelectModel 被调用时
     * - detailKey +1 递增
     */
    const [detailKey, setDetailKey] = useState(0);

    /*
     * handleSelectModel：处理模型选择
     *
     * 【调用时机】
     * 用户在 ModelList 中点击某个模型卡片
     *
     * 【执行逻辑】
     * 1. 调用 setSelectedModel(model) 更新选中状态
     * 2. 调用 setDetailKey(k => k + 1) 递增 key
     *
     * 【为什么两个都要更新】
     * - selectedModel：ModelDetail 需要知道显示哪个模型
     * - detailKey：确保 ModelDetail 组件重新挂载（刷新状态）
     */
    const handleSelectModel = (model: AIModel) => {
        setSelectedModel(model);
        setDetailKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/*
             * =========================================================================
             * Header Section - 页面头部区域
             * =========================================================================
             *
             * 【内容】
             * - 页面标题：AI 模型广场
             * - 页面描述：探索最新的人工智能模型
             *
             * 【样式设计】
             * - 渐变背景（from-primary-50/50 to-white）
             * - 背景装饰：模糊渐变圆形（增加视觉效果）
             * - 响应式内边距：py-16 sm:py-24
             *
             * 【Streaming 说明】
             * 这部分内容在 Server Component 中直接渲染，
             * 随页面首次请求立即返回，不经过 Suspense。
             */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/50 to-white py-16 sm:py-24">
                {/*
                 * 背景装饰
                 * - 绝对定位，z-10 -1
                 * - 渐变模糊圆形，营造光晕效果
                 */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary-100/30 to-transparent rounded-full blur-3xl" />
                </div>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4">AI 模型广场</h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">探索最新的人工智能模型，比较它们的性能和特点</p>
                    </div>
                </div>
            </section>

            {/*
             * =========================================================================
             * Main Content Section - 主体内容区域
             * =========================================================================
             *
             * 【布局】
             * - lg:grid-cols-5：大屏幕下左侧3列（列表），右侧2列（详情）
             * - 响应式：小屏幕下单列显示
             *
             * 【Suspense 边界 1：ModelList】
             * fallback：ModelListSkeleton（6 个占位卡片）
             * content：ModelList 组件（带流式加载）
             *
             * 【Suspense 边界 2：ModelDetail】
             * fallback：ModelDetailSkeleton（详情区域占位符）
             * content：ModelDetail 组件（带延迟加载）
             */}
            <section className="bg-white py-12 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-5">
                        {/*
                         * 模型列表区域（左侧，跨 3 列）
                         *
                         * Suspense 边界作用：
                         * - 当 ModelList 组件加载时，显示 ModelListSkeleton
                         * - 当 ModelList 数据逐步加载时，逐步更新
                         */}
                        <div className="lg:col-span-3">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">模型列表</h2>
                            {/*
                             * Suspense 边界
                             *
                             * fallback：
                             * - 使用 ModelListSkeleton 组件
                             * - 6 个占位卡片，模拟 ModelCard 布局
                             * - animate-pulse 脉冲动画
                             */}
                            <Suspense fallback={<ModelListSkeleton />}>
                                <ModelList selectedModelId={selectedModel?.id} onSelectModel={handleSelectModel} />
                            </Suspense>
                        </div>

                        {/*
                         * 模型详情区域（右侧，跨 2 列）
                         *
                         * 【key 变化机制】
                         * detailKey 改变时，div 会卸载旧组件、挂载新组件
                         * 确保 ModelDetail 能正确响应新的 model prop
                         */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">模型详情</h2>
                            {/*
                             * Suspense 边界
                             *
                             * fallback：
                             * - 使用 ModelDetailSkeleton 组件
                             * - 模拟 ModelDetail 头部布局
                             * - animate-pulse 脉冲动画
                             */}
                            <Suspense fallback={<ModelDetailSkeleton />}>
                                {/*
                                 * key 属性用于强制刷新
                                 * 当 detailKey 变化时，React 会认为这是一个"新"组件
                                 */}
                                <div key={detailKey} className="p-6 rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900">
                                    <ModelDetail model={selectedModel} />
                                </div>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </section>

            {/*
             * =========================================================================
             * Performance Monitor Section - 性能监控区域
             * =========================================================================
             *
             * 【设计意图】
             * 帮助用户理解 Streaming 机制，通过可视化事件流
             *
             * 【三个卡片】
             * 1. PerformanceMonitor：实时事件追踪（交互式组件）
             * 2. Streaming 说明：静态文本介绍
             * 3. Suspense 说明：静态文本介绍
             */}
            <section className="bg-white py-12 border-t border-neutral-200/60 dark:bg-neutral-900 dark:border-neutral-800/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-6">实时监控</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/*
                         * 性能监控组件
                         */}
                        <PerformanceMonitor />

                        {/*
                         * Streaming 说明卡片
                         */}
                        <div className="p-6 rounded-2xl border border-neutral-200/60 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:border-neutral-800/60 dark:from-green-900/20 dark:to-emerald-900/20">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">📡</div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Streaming</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">页面以流式方式返回浏览器。Server Component 先发送静态 HTML，Suspense 边界内的内容异步加载，逐步更新页面。</p>
                                </div>
                            </div>
                        </div>

                        {/*
                         * Suspense 说明卡片
                         */}
                        <div className="p-6 rounded-2xl border border-neutral-200/60 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:border-neutral-800/60 dark:from-purple-900/20 dark:to-violet-900/20">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">⚛️</div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-2">Suspense</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">React 的 Suspense 组件用于包裹异步操作。在数据加载期间显示 fallback UI，加载完成后自动替换为实际内容。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
