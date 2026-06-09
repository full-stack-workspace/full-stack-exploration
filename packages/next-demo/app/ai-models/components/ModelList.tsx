"use client";

import { useEffect, useRef,useState } from "react";

import { aiModels,modelCategories } from "@/data/ai-models";
import { cn } from "@/lib/utils";
import type { AIModel, ModelCategory } from "@/types/ai-models";

import { ModelCard } from "./ModelCard";

/**
 * ============================================================================
 * ModelList Component - 模型列表组件（核心：模拟流式加载）
 * ============================================================================
 *
 * 【功能说明】
 * 负责加载和展示 AI 模型列表，支持分类筛选和关键词搜索。
 * 实现了"分块流式加载"效果，模拟真实 Streaming 场景。
 *
 * 【核心机制：Streaming 流式加载】
 *
 * 传统 SSR vs Streaming：
 * ┌─────────────────────────────────────────────────────────────┐
 * │ 传统 SSR：                                                  │
 * │   请求 → 等待所有数据 → 渲染完整HTML → 返回                  │
 * │   问题：用户等待时间长，TTFB延迟大                           │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Streaming：                                                  │
 * │   请求 → 立即返回HTML骨架 → 分块返回数据 → 逐步渲染          │
 * │   优势：TTFB快，用户更快看到内容                             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * 【分块加载策略】
 * - chunkSize = 3：每块包含 3 个模型
 * - delay = 200ms：每块加载间隔 200ms
 * - 用户可以看到列表"逐步填充"的效果
 *
 * 【数据加载流程图】
 *
 *  loadNextChunk()
 *       │
 *       ├── 计算当前块的起止索引 (start = chunkIndex * 3, end = start + 3)
 *       ├── 从 aiModels.slice(start, end) 提取 chunk 数据
 *       │
 *       ├── setModels(prev => [...prev, ...newItems])
 *       │       │
 *       │       ├── 函数式更新确保数据一致性
 *       │       └── 去重逻辑防止 React Strict Mode 重复加载
 *       │
 *       ├── chunkIndex++ 递增计数器
 *       │
 *       ├── 检查是否还有更多数据
 *       │       │
 *       │       ├── 有 → setTimeout(loadNextChunk, 200) 继续加载
 *       │       └── 无 → setIsLoading(false) 完成加载
 *       │
 *       └── 返回
 *
 * 【React 18 Strict Mode 处理】
 * 问题：开发环境下，useEffect 会执行两次（mount → unmount → mount）
 * 解决：
 *   - isMountedRef 追踪组件是否已挂载
 *   - 清理函数中设置为 false
 *   - setState 前检查 isMountedRef.current
 *   - 去重逻辑确保不会添加重复模型
 *
 * 【状态说明】
 * - models: AIModel[] - 已加载的模型列表（逐步增长）
 * - isLoading: boolean - 是否仍在加载中
 * - categoryFilter: ModelCategory | "全部" - 当前分类筛选
 * - searchQuery: string - 当前搜索关键词
 *
 * 【筛选逻辑】
 * 同时满足以下条件才显示：
 * - 分类匹配（categoryFilter === "全部" 或 model.category === categoryFilter）
 * - 搜索匹配（searchQuery 为空 或 名称/提供商包含关键词）
 *
 * 【Suspense 关联】
 * 此组件被 Suspense 边界包裹，在数据加载期间显示骨架屏 fallback。
 * 当 useEffect 初次执行时，Suspense 显示 fallback，
 * 随着 setModels 调用，列表逐步渲染，Suspense 边界内的内容"流"入页面。
 *
 * 【Props】
 * - selectedModelId?: string - 当前选中的模型 ID（用于高亮显示）
 * - onSelectModel: (model: AIModel) => void - 模型选中回调
 *
 * 【子组件】
 * - ModelCard：模型卡片组件，负责单个模型的展示
 */
export function ModelList({ selectedModelId, onSelectModel }: { selectedModelId?: string; onSelectModel: (model: AIModel) => void }) {
    /*
     * models 状态：存储已加载的模型
     * - 初始为空数组
     * - 随着 useEffect 分块加载逐步添加
     * - 模拟从服务器逐步获取数据的场景
     */
    const [models, setModels] = useState<AIModel[]>([]);

    /*
     * isLoading 状态：标记加载是否完成
     * - 用于显示"正在加载模型..."提示
     * - 加载完成后显示实际数量
     */
    const [isLoading, setIsLoading] = useState(true);

    /*
     * categoryFilter 状态：当前选中的分类筛选
     * - "全部"表示显示所有分类
     * - 其他值如"语言模型"、"多模态"等进行筛选
     */
    const [categoryFilter, setCategoryFilter] = useState<ModelCategory | "全部">("全部");

    /*
     * searchQuery 状态：搜索框的当前值
     * - 用于过滤模型名称或提供商
     * - 实时响应用户输入
     */
    const [searchQuery, setSearchQuery] = useState("");

    /*
     * isMountedRef：组件挂载状态引用
     *
     * 为什么使用 ref 而不是 state：
     * - ref 变化不会触发重新渲染
     * - 适合存储副作用相关的临时状态
     * - 在 cleanup 函数中设置为 false
     * - 防止组件卸载后更新状态导致内存泄漏
     */
    const isMountedRef = useRef(true);

    /*
     * useEffect：实现分块流式加载
     *
     * 【执行时机】
     * 组件首次挂载到 DOM 后执行（Client Component 水合完成后）
     *
     * 【工作流程】
     * 1. 设置 isMountedRef.current = true
     * 2. 初始化 chunkIndex = 0（当前块索引）
     * 3. 调用 loadNextChunk() 开始加载
     *
     * 【loadNextChunk 递归函数详解】
     *
     * function loadNextChunk() {
     *     // 1. 检查组件是否已卸载
     *     if (!isMountedRef.current) return;
     *
     *     // 2. 计算当前块的起止位置
     *     const start = chunkIndex * 3;  // 0, 3, 6, 9, ...
     *     const end = start + 3;           // 3, 6, 9, 12, ...
     *
     *     // 3. 提取这一块的数据
     *     const chunk = aiModels.slice(start, end);
     *
     *     // 4. 如果有数据，更新状态
     *     if (chunk.length > 0) {
     *         setModels(prev => {
     *             // 函数式更新，获取最新状态
     *             // 去重：检查哪些 ID 还不存在
     *             const existingIds = new Set(prev.map(m => m.id));
     *             const newItems = chunk.filter(m => !existingIds.has(m.id));
     *             return [...prev, ...newItems];
     *         });
     *
     *         chunkIndex++;
     *
     *         // 5. 继续加载或完成
     *         if (chunkIndex * 3 < aiModels.length) {
     *             setTimeout(loadNextChunk, 200);  // 200ms 后继续
     *         } else {
     *             setIsLoading(false);  // 全部加载完成
     *         }
     *     } else {
     *         setIsLoading(false);
     *     }
     * }
     *
     * 【清理函数】
     * return () => { isMountedRef.current = false; };
     * 组件卸载时将标志设置为 false，防止后续状态更新。
     */
    useEffect(() => {
        isMountedRef.current = true;
        let chunkIndex = 0;
        const chunkSize = 3;
        const delay = 200;

        const loadNextChunk = () => {
            if (!isMountedRef.current) {return;}

            const start = chunkIndex * chunkSize;
            const end = start + chunkSize;
            const chunk = aiModels.slice(start, end);

            if (chunk.length > 0) {
                setModels((prev) => {
                    if (!isMountedRef.current) {return prev;}
                    const existingIds = new Set(prev.map((m) => m.id));
                    const newItems = chunk.filter((m) => !existingIds.has(m.id));
                    return [...prev, ...newItems];
                });

                chunkIndex++;

                if (chunkIndex * chunkSize < aiModels.length) {
                    setTimeout(loadNextChunk, delay);
                } else {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        loadNextChunk();

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    /*
     * filteredModels：过滤后的模型列表
     *
     * 【筛选条件】
     * 1. 分类匹配：categoryFilter === "全部" 或 model.category === categoryFilter
     * 2. 搜索匹配：searchQuery 为空（显示全部）或名称/提供商包含关键词
     *
     * 【大小写不敏感】
     * 使用 toLowerCase() 统一大小写进行匹配
     *
     * 【性能优化】
     * - 使用 Array.filter 返回新数组，不修改原数组
     * - 条件简洁，易于阅读
     */
    const filteredModels = models.filter((model) => {
        const matchesCategory = categoryFilter === "全部" || model.category === categoryFilter;
        const matchesSearch = !searchQuery || model.name.toLowerCase().includes(searchQuery.toLowerCase()) || model.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-4">
            {/*
             * 搜索和筛选区域
             * - 左侧：搜索输入框
             * - 右侧：分类筛选按钮组
             */}
            <div className="flex flex-wrap items-center gap-3">
                {/*
                 * 搜索输入框
                 * - 使用绝对定位的搜索图标
                 * - flex-1 min-w-[200px]：最小宽度 200px，自适应扩展
                 * - max-w-md：最大宽度 280px
                 */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <input
                        type="search"
                        placeholder="搜索模型或提供商..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary-300 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900"
                    />
                    {/*
                     * 搜索图标（绝对定位）
                     * - left-3 top-1/2 -translate-y-1/2：垂直居中
                     * - h-4 w-4：图标尺寸
                     */}
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/*
                 * 分类筛选按钮组
                 * - 使用 modelCategories 数据动态渲染
                 * - 当前选中的分类高亮显示
                 */}
                <div className="flex flex-wrap gap-2">
                    {modelCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setCategoryFilter(category as ModelCategory | "全部")}
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                categoryFilter === category ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/*
             * 加载状态/结果数量显示
             * - 加载中：显示"正在加载模型..."（带脉冲动画）
             * - 加载完成：显示过滤后的模型数量
             */}
            <div className="text-sm text-neutral-500">
                {isLoading ? <span className="animate-pulse">正在加载模型...</span> : <span>共 {filteredModels.length} 个模型</span>}
            </div>

            {/*
             * 模型卡片网格
             * - 响应式布局：1列 → 2列 → 3列
             * - 如果有过滤结果，显示卡片网格
             * - 否则显示"未找到匹配的模型"提示
             */}
            {filteredModels.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredModels.map((model) => (
                        <ModelCard key={model.id} model={model} isSelected={selectedModelId === model.id} onClick={() => onSelectModel(model)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-neutral-500">未找到匹配的模型</p>
                </div>
            )}
        </div>
    );
}
