/**
 * @file TodoFilterBar.tsx
 *
 * @description 任务列表筛选栏组件，包含：
 *   - 筛选 tab 切换（全部 / 待完成 / 已完成）
 *   - 任务数量统计徽章
 *
 * 局部的 CountBadge 组件复用了两个数量徽章的相同结构，
 * 避免颜色配置不同但 DOM 结构重复的写法。
 */
import React from 'react';
import { FILTER_OPTIONS, type FilterType } from './types';

/* ---- 局部子组件（不导出） ---- */

interface CountBadgeProps {
    /** Tailwind 色板前缀，用于构成 bg-{color}-50 / text-{color}-700 等类名 */
    color: 'sky' | 'emerald';
    count: number;
    label: string;
}

/**
 * 带彩色圆点的数量徽章。
 * 颜色通过 `color` prop 切换，避免两处相同结构重复书写。
 */
const CountBadge: React.FC<CountBadgeProps> = ({ color, count, label }) => {
    const styles = {
        sky: {
            wrap: 'bg-sky-50 text-sky-700 border-sky-100',
            dot: 'bg-sky-500',
        },
        emerald: {
            wrap: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            dot: 'bg-emerald-500',
        },
    } as const;

    const { wrap, dot } = styles[color];

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${wrap}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {count} {label}
        </span>
    );
};

/* ---- 主组件 ---- */

interface Props {
    filter: FilterType;
    remainingCount: number;
    completedCount: number;
    onFilterChange: (f: FilterType) => void;
}

const TodoFilterBar: React.FC<Props> = ({
    filter,
    remainingCount,
    completedCount,
    onFilterChange,
}) => (
    <>
        {/* 筛选 tab 切换 */}
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs sm:text-sm">
            {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onFilterChange(key)}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                        filter === key
                            ? 'bg-white text-sky-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {label}
                </button>
            ))}
        </div>

        {/* 任务数量徽章 */}
        <div className="inline-flex items-center gap-2 text-xs sm:text-sm">
            <CountBadge color="sky" count={remainingCount} label="待完成" />
            <CountBadge color="emerald" count={completedCount} label="已完成" />
        </div>
    </>
);

export default TodoFilterBar;
