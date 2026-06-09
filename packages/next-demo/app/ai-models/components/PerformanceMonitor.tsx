"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { PerformanceEvent } from "@/types/ai-models";

/**
 * ============================================================================
 * PerformanceMonitor Component - 性能监控组件
 * ============================================================================
 *
 * 【功能说明】
 * 实时追踪和展示组件生命周期事件，用于演示 Streaming 和渲染机制。
 * 帮助开发者理解页面加载过程中各个阶段的时序关系。
 *
 * 【设计目标】
 * - 可视化展示组件挂载、数据加载、渲染完成的时间线
 * - 模拟真实场景中的性能事件序列
 * - 提供"Streaming 工作原理"的实时反馈
 *
 * 【核心概念：事件类型】
 *
 * | 事件类型        | 图标 | 颜色   | 含义                           |
 * |---------------|------|--------|-------------------------------|
 * | component_mount | ⚡   | 蓝色   | 组件挂载到 DOM                  |
 * | data_fetch     | 📡   | 绿色   | 开始获取数据                    |
 * | render         | ✅   | 紫色   | 组件渲染完成                    |
 * | error          | ❌   | 红色   | 发生错误                        |
 *
 * 【模拟事件序列（时间线）】
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ 时间    │ 事件                        │ 说明                    │
 * ├─────────┼──────────────────────────────┼────────────────────────┤
 * │ 0ms     │ component_mount (Header)    │ Header 组件挂载         │
 * │ 50ms    │ render (Header)             │ Header 渲染完成         │
 * │ 100ms   │ component_mount (ModelList) │ ModelList 组件挂载      │
 * │         │                              │ （此时 Suspense 显示中） │
 * │ 150ms   │ data_fetch (ModelList)      │ 开始加载模型数据        │
 * │ 450ms   │ render (ModelList)         │ 第一批数据渲染完成      │
 * │ 500ms   │ render (Streaming 完成)     │ 流式加载全部完成        │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * 【计时机制】
 * - startTimeRef：记录组件首次渲染时间（Date.now()）
 * - setInterval 每 100ms 更新 elapsedTime
 * - 清理函数清除 interval，防止内存泄漏
 *
 * 【事件序列设计意图】
 * 帮助理解 Streaming 的实际工作流程：
 * 1. Server Component 先返回静态 HTML（Header 部分）
 * 2. Client Components 水合后挂载（ModelList 挂载）
 * 3. useEffect 触发数据获取（data_fetch）
 * 4. 数据分块加载，逐步渲染（多次 render）
 * 5. 最终所有内容流式呈现在页面（Streaming 完成）
 *
 * 【状态说明】
 * - events: PerformanceEvent[] - 存储所有性能事件
 * - isLoading: boolean - 是否还有事件在进行中
 * - elapsedTime: number - 页面加载以来的总时间（毫秒）
 */
export function PerformanceMonitor() {
    /*
     * events 状态：存储所有性能事件
     *
     * 结构：
     * {
     *   type: PerformanceEvent["type"];  // 事件类型
     *   component: string;               // 组件/事件名称
     *   timestamp: number;              // 相对时间戳（毫秒）
     *   duration?: number;              // 持续时间（毫秒，可选）
     * }
     */
    const [events, setEvents] = useState<PerformanceEvent[]>([]);

    /*
     * isLoading 状态：是否还有事件在进行中
     *
     * 何时变为 false：
     * - 所有模拟事件都触发完成后
     * - 用于控制状态指示器的显示
     */
    const [isLoading, setIsLoading] = useState(true);

    /*
     * elapsedTime 状态：页面加载以来的总时间（毫秒）
     *
     * 更新方式：
     * - 通过 setInterval 每 100ms 更新一次
     * - 基于 startTimeRef 计算时间差
     */
    const [elapsedTime, setElapsedTime] = useState(0);

    /*
     * startTime：记录组件首次渲染时刻
     *
     * 使用 useState 惰性初始化器确保 Date.now() 仅在首次渲染时调用一次，
     * 后续重渲染复用初始值，满足 React 纯函数渲染规则。
     */
    const [startTime] = useState(() => Date.now());

    /*
     * useEffect 1：定时更新已用时间
     *
     * 机制：
     * - setInterval 每 100ms 执行一次
     * - 计算当前时间与 startTime 的差值
     * - 更新 elapsedTime 触发重新渲染
     *
     * 清理函数：
     * - clearInterval 清除定时器
     * - 防止组件卸载后继续执行
     */
    useEffect(() => {
        const interval = setInterval(() => { setElapsedTime(Date.now() - startTime); }, 100);
        return () => clearInterval(interval);
    }, []);

    /*
     * useEffect 2：模拟性能事件序列
     *
     * 【执行时机】
     * 组件首次挂载时执行（依赖数组为空）
     *
     * 【事件序列】
     * 使用 setTimeout 在不同时间点添加事件：
     * - 0ms: Header 挂载
     * - 50ms: Header 渲染完成
     * - 100ms: ModelList 挂载
     * - 150ms: ModelList 开始获取数据
     * - 450ms: ModelList 渲染完成
     * - 500ms: Streaming 完成，停止 loading
     *
     * 【定时器管理】
     * - timers 数组存储所有 setTimeout ID
     * - 清理函数调用 clearTimeout 清除所有定时器
     * - 防止组件卸载后事件继续触发
     */
    useEffect(() => {
        const timers: Array<ReturnType<typeof setTimeout>> = [];

        // 0ms: 组件挂载事件
        timers.push(setTimeout(() => setEvents((prev) => [...prev, { type: "component_mount", component: "Header", timestamp: 0 }]), 0));

        // 50ms: Header 渲染完成
        timers.push(setTimeout(() => setEvents((prev) => [...prev, { type: "render", component: "Header", timestamp: 50, duration: 50 }]), 50));

        // 100ms: ModelList 组件挂载
        timers.push(setTimeout(() => setEvents((prev) => [...prev, { type: "component_mount", component: "ModelList", timestamp: 100 }]), 100));

        // 150ms: ModelList 开始数据获取
        timers.push(setTimeout(() => setEvents((prev) => [...prev, { type: "data_fetch", component: "ModelList - 获取数据", timestamp: 150, duration: 250 }]), 150));

        // 450ms: ModelList 渲染完成
        timers.push(setTimeout(() => setEvents((prev) => [...prev, { type: "render", component: "ModelList", timestamp: 450, duration: 50 }]), 450));

        // 500ms: 流式加载完成
        timers.push(setTimeout(() => {
            setIsLoading(false);
            setEvents((prev) => [...prev, { type: "render", component: "Streaming 完成", timestamp: 500, duration: 0 }]);
        }, 500));

        // 清理函数：清除所有定时器
        return () => timers.forEach(clearTimeout);
    }, []);

    /*
     * eventTypeConfig：事件类型配置
     *
     * 作用：
     * - 为每种事件类型定义显示样式
     * - color: Tailwind 背景色类名
     * - label: 中文标签
     * - icon: Emoji 图标
     *
     * 使用 Record 类型确保类型安全
     */
    const eventTypeConfig: Record<PerformanceEvent["type"], { color: string; label: string; icon: string }> = {
        component_mount: { color: "bg-blue-500", label: "组件挂载", icon: "⚡" },
        data_fetch: { color: "bg-green-500", label: "数据获取", icon: "📡" },
        render: { color: "bg-purple-500", label: "渲染完成", icon: "✅" },
        error: { color: "bg-red-500", label: "错误", icon: "❌" },
    };

    return (
        <div className="space-y-4">
            {/*
             * 标题行
             * - 左侧：标题"性能监控"
             * - 右侧：状态指示器（加载中/就绪）
             */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">性能监控</h3>
                <div className="flex items-center gap-2">
                    {/*
                     * 状态指示器
                     * - 加载中：黄色脉冲圆点 + "加载中..."
                     * - 就绪：绿色圆点 + "就绪"
                     */}
                    <div className={cn("w-2 h-2 rounded-full", isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500")} />
                    <span className="text-sm text-neutral-600">{isLoading ? "加载中..." : "就绪"}</span>
                </div>
            </div>

            {/*
             * 统计卡片
             *
             * 布局：2 列网格
             * - 已用时间：显示页面加载以来的总时间
             * - 事件数量：已记录的事件总数
             */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                    <p className="text-xs text-neutral-500 mb-1">已用时间</p>
                    <p className="text-2xl font-bold">{elapsedTime}<span className="text-sm font-normal text-neutral-400 ml-1">ms</span></p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                    <p className="text-xs text-neutral-500 mb-1">事件数量</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                </div>
            </div>

            {/*
             * Streaming 原理提示
             *
             * 蓝色背景的信息卡片
             * 用于向用户解释页面如何流式返回
             */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-400 mb-1">Streaming 工作原理</p>
                        <p className="text-blue-700 dark:text-blue-300 text-xs">页面以流式方式返回，Server Component 先发送静态 HTML，然后 Suspense 边界内的 Client Components 异步加载并逐步更新。</p>
                    </div>
                </div>
            </div>

            {/*
             * 事件时间线
             *
             * 特点：
             * - 按时间顺序显示所有事件
             * - max-h-48 限制最大高度，可滚动
             * - 每个事件显示图标、类型、名称、耗时
             *
             * 渲染逻辑：
             * - 如果没有事件，显示"等待事件..."
             * - 否则 map 遍历事件数组渲染
             */}
            <div className="max-h-48 overflow-y-auto space-y-0.5">
                {events.length === 0 ? <p className="text-sm text-neutral-400 py-4 text-center">等待事件...</p> : events.map((event, i) => {
                    const config = eventTypeConfig[event.type];
                    return (
                        <div key={i} className="flex items-start gap-3 py-2">
                            {/*
                             * 事件类型图标
                             * - 圆形背景，颜色根据事件类型变化
                             * - shrink-0 防止图标被压缩
                             */}
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0", config.color)}>{config.icon}</div>
                            <div>
                                {/*
                                 * 事件标签和耗时
                                 * - 标签 + 耗时（如果有）
                                 */}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{config.label}</span>
                                    <span className="text-xs text-neutral-500">{event.duration ? `${event.duration}ms` : ""}</span>
                                </div>
                                {/*
                                 * 组件/事件名称
                                 */}
                                <p className="text-sm text-neutral-500">{event.component}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
