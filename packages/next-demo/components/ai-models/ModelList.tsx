/**
 * ============================================================================
 * Model List Component - AI 模型列表组件
 * ============================================================================
 *
 * 展示 AI 模型列表的组件，支持流式加载和交互式筛选。
 *
 * 功能特点：
 * - 流式加载：使用 async generator 逐步展示模型
 * - 分类筛选：按模型类型筛选
 * - 难度筛选：按难度等级筛选
 * - 搜索功能：按名称或提供商搜索
 * - 选中状态：点击模型可查看详情
 *
 * Streaming 演示：
 * - 模型数据分批次加载，每批 3 个模型
 * - 每批加载时有 200ms 延迟，演示流式效果
 * - 已加载的模型立即显示，无需等待全部数据
 *
 * @module components/ai-models/ModelList
 */

"use client";

import { useEffect,useState } from "react";

import { aiModels,modelCategories } from "@/data/ai-models";
import { cn } from "@/lib/utils";
import type { AIModel, ModelCategory } from "@/types/ai-models";

interface ModelListProps {
    selectedModelId?: string;
    onSelectModel: (model: AIModel) => void;
}

function ModelCard({
    model,
    isSelected,
    onClick,
}: {
    model: AIModel;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 rounded-xl border transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5",
                "focus:outline-none focus:ring-2 focus:ring-primary-500/50",
                isSelected
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                    : "border-neutral-200/60 bg-white hover:border-primary-200/60 dark:border-neutral-800/60 dark:bg-neutral-900 hover:dark:border-primary-800/60"
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0",
                        model.color
                    )}
                >
                    {model.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                            {model.name}
                        </h3>
                        {model.isOpenSource && (
                            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                开源
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        {model.provider}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {model.category}
                </span>
                <span
                    className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        model.difficulty === "专家" || model.difficulty === "高级"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : model.difficulty === "中级"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    )}
                >
                    {model.difficulty}
                </span>
            </div>
        </button>
    );
}

function ModelListSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900 animate-pulse"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                        <div className="flex-1">
                            <div className="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800 mb-2" />
                            <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <div className="h-5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-5 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ModelList({ selectedModelId, onSelectModel }: ModelListProps) {
    const [models, setModels] = useState<AIModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<ModelCategory | "全部">("全部");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadModels = async () => {
            setIsLoading(true);
            const chunkSize = 3;
            const delay = 200;

            for (let i = 0; i < aiModels.length; i += chunkSize) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                setModels((prev) => [...prev, ...aiModels.slice(i, i + chunkSize)]);
            }
            setIsLoading(false);
        };

        loadModels();
    }, []);

    const filteredModels = models.filter((model) => {
        const matchesCategory = categoryFilter === "全部" || model.category === categoryFilter;
        const matchesSearch =
            !searchQuery ||
            model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.provider.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <input
                        type="search"
                        placeholder="搜索模型或提供商..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-primary-600"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <div className="flex flex-wrap gap-2">
                    {modelCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setCategoryFilter(category as ModelCategory | "全部")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                categoryFilter === category
                                    ? "bg-primary-600 text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {isLoading ? (
                    <span className="animate-pulse">正在加载模型...</span>
                ) : (
                    <span>
                        共 {filteredModels.length} 个模型
                        {categoryFilter !== "全部" && ` (${categoryFilter})`}
                        {searchQuery && ` - 搜索: "${searchQuery}"`}
                    </span>
                )}
            </div>

            {isLoading && models.length === 0 ? (
                <ModelListSkeleton />
            ) : filteredModels.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredModels.map((model) => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isSelected={selectedModelId === model.id}
                            onClick={() => onSelectModel(model)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-neutral-500 dark:text-neutral-400">未找到匹配的模型</p>
                </div>
            )}
        </div>
    );
}