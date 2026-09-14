/**
 * @file TodoComposer.tsx
 *
 * @description 新任务输入区域组件，包含：
 *   - 文本输入框（支持 Enter 快捷键提交）
 *   - 添加按钮
 *   - 优先级 tag 选择器（高 / 中 / 低）
 *
 * 组件本身不持有任何状态，所有数据与回调均通过 props 由父组件
 * （Todo/index.tsx）提供，保持单向数据流。
 */
import React from 'react';
import { PRIORITIES, PRIORITY_CONFIG, type Priority } from './types';

interface Props {
    /** 当前输入框的文本值 */
    value: string;
    /** 当前选中的优先级 */
    priority: Priority;
    /** 输入框内容变化时的回调 */
    onChange: (value: string) => void;
    /** 切换优先级时的回调 */
    onPriorityChange: (p: Priority) => void;
    /** 点击添加或按下 Enter 时的回调 */
    onAdd: () => void;
}

const TodoComposer: React.FC<Props> = ({
    value,
    priority,
    onChange,
    onPriorityChange,
    onAdd,
}) => (
    <>
        {/* 输入框 + 添加按钮 */}
        <div className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAdd()}
                placeholder="输入新任务，回车添加…"
                className="flex-1 rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 transition-all"
            />
            <button
                type="button"
                onClick={onAdd}
                disabled={!value.trim()}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 text-sm sm:text-base font-medium text-white shadow-md shadow-sky-200 hover:from-sky-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                添加
            </button>
        </div>

        {/* 优先级 tag 选择器：点击对应 tag 设置新任务的优先级 */}
        <div className="flex items-center gap-2 mt-3 mb-4">
            <span className="text-xs text-slate-400 mr-0.5">优先级</span>
            {PRIORITIES.map(p => {
                const cfg = PRIORITY_CONFIG[p];
                const active = priority === p;
                return (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPriorityChange(p)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                            active ? cfg.tagActive : cfg.tag
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/70' : cfg.dot}`}
                        />
                        {cfg.label}
                    </button>
                );
            })}
        </div>
    </>
);

export default TodoComposer;
