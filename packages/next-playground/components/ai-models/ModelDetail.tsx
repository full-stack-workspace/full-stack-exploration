/**
 * ============================================================================
 * Model Detail Component - AI 模型详情组件
 * ============================================================================
 *
 * 展示选中 AI 模型的详细信息。
 *
 * @module components/ai-models/ModelDetail
 */

"use client";

import { useEffect,useState } from "react";

import { cn } from "@/lib/utils";
import type { AIModel, ModelMetrics } from "@/types/ai-models";

interface ModelDetailProps {
    model: AIModel | null;
}

function generateMetrics(model: AIModel): ModelMetrics {
    const baseLatency = model.category === "语言模型" ? 50 : 100;
    const baseAccuracy = model.difficulty === "专家" ? 95 : model.difficulty === "高级" ? 88 : 80;
    return {
        latency: baseLatency + Math.floor(Math.random() * 100),
        throughput: 50 + Math.floor(Math.random() * 150),
        accuracy: baseAccuracy + Math.floor(Math.random() * 10),
        costEfficiency: 60 + Math.floor(Math.random() * 30),
    };
}

function MetricBar({ label, value, maxValue = 100, color }: { label: string; value: number; maxValue?: number; color: string }) {
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

export default function ModelDetail({ model }: ModelDetailProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

    useEffect(() => {
        if (!model) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- 模型清空时重置指标，为有意设计
            setMetrics(null);
            return;
        }
        setIsLoading(true);
         
        setMetrics(null);
        const timer = setTimeout(() => {
            setMetrics(generateMetrics(model));
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [model]);

    if (!model) {
        return (
            <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p className="mt-4 text-neutral-500 dark:text-neutral-400">从左侧选择一个模型</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">查看详细信息和性能指标</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{model.description}</p>
            <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{model.category}</span>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{model.difficulty}</span>
            </div>
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">性能指标</h3>
                {isLoading || !metrics ? (
                    <div className="space-y-3 animate-pulse">
                        {["延迟", "吞吐量", "准确性", "性价比"].map((label, i) => (
                            <div key={label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <div className="h-4 w-12 rounded bg-neutral-200 dark:bg-neutral-800" />
                                    <div className="h-4 w-8 rounded bg-neutral-200 dark:bg-neutral-800" />
                                </div>
                                <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800"><div className="h-full rounded-full bg-neutral-200 dark:bg-neutral-700" style={{ width: `${20 + i * 20  }%` }} /></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <MetricBar label="响应延迟" value={metrics.latency} maxValue={200} color="bg-blue-500" />
                        <MetricBar label="吞吐量 (tokens/s)" value={metrics.throughput} maxValue={200} color="bg-green-500" />
                        <MetricBar label="准确性评分" value={metrics.accuracy} maxValue={100} color="bg-purple-500" />
                        <MetricBar label="性价比" value={metrics.costEfficiency} maxValue={100} color="bg-amber-500" />
                    </div>
                )}
            </div>
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">技术参数</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">参数量</p><p className="font-medium text-neutral-900 dark:text-neutral-50">{model.parameters}</p></div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">上下文窗口</p><p className="font-medium text-neutral-900 dark:text-neutral-50">{model.contextWindow}</p></div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">训练数据截止</p><p className="font-medium text-neutral-900 dark:text-neutral-50">{model.trainingCutoff}</p></div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900"><p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">开源许可</p><p className="font-medium text-neutral-900 dark:text-neutral-50">{model.isOpenSource ? "MIT" : "专有"}</p></div>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">支持的功能</h3>
                <div className="flex flex-wrap gap-2">{model.capabilities.map((cap) => (<span key={cap} className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{cap}</span>))}</div>
            </div>
        </div>
    );
}