/**
 * ============================================================================
 * Panel — Signal Lab 共享表面
 * ============================================================================
 *
 * 首页分类地图与专题 TopicSection 共用同一块表面:
 * 冷纸底、mist 描边、圆角 xl。hover 时轻抬并亮出磷光边。
 *
 * @module components/ui/Panel
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelProps {
    children: ReactNode;
    className?: string;
    /** 交互卡:hover 轻抬 + signal 描边 */
    hover?: boolean;
}

/**
 * 站点统一卡片表面。
 *
 * @param hover - 是否启用悬浮反馈(首页地图格、可点卡)
 * @example
 * <Panel className="p-6">内容</Panel>
 */
export function Panel({ children, className, hover = false }: PanelProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-mist bg-panel shadow-card dark:border-neutral-800 dark:bg-panel-night",
                hover &&
                    "transition-[transform,border-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 hover:border-signal/50 hover:shadow-card-hover motion-reduce:hover:translate-y-0",
                className,
            )}
        >
            {children}
        </div>
    );
}
