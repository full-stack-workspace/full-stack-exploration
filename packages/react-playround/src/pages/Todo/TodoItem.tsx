/**
 * @file TodoItem.tsx
 *
 * @description A component for displaying a todo item
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    PRIORITIES,
    PRIORITY_CONFIG,
    type Priority,
    type TodoItem,
} from './types';

interface Props {
    item: TodoItem;
    onToggle: () => void;
    onDelete: () => void;
    onEdit: (text: string) => void;
    onPriorityChange: (priority: Priority) => void;
}

const TodoItemComponent: React.FC<Props> = ({
    item,
    onToggle,
    onDelete,
    onEdit,
    onPriorityChange,
}) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(item.text);
    const inputRef = useRef<HTMLInputElement>(null);
    const cfg = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    const startEdit = () => {
        setDraft(item.text);
        setEditing(true);
    };

    const commitEdit = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== item.text) {onEdit(trimmed);}
        else {setDraft(item.text);}
        setEditing(false);
    };

    const cancelEdit = () => {
        setDraft(item.text);
        setEditing(false);
    };

    const cyclePriority = () => {
        const next = PRIORITIES[(PRIORITIES.indexOf(item.priority) + 1) % PRIORITIES.length];
        onPriorityChange(next);
    };

    return (
        <li
            className={`group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 shadow-sm hover:shadow-md transition-all ${cfg.row}`}
        >
            {/* Checkbox */}
            <button
                type="button"
                onClick={onToggle}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white text-transparent hover:border-sky-400'
                }`}
                aria-label={item.completed ? '标记为未完成' : '标记为已完成'}
            >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </button>

            {/* Priority badge — click to cycle */}
            <button
                type="button"
                onClick={cyclePriority}
                className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold border transition-all ${cfg.tagActive}`}
                title="点击切换优先级"
            >
                <span className="w-1 h-1 rounded-full bg-white/70" />
                {cfg.label}
            </button>

            {/* Text / Inline edit */}
            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {commitEdit();}
                        if (e.key === 'Escape') {cancelEdit();}
                    }}
                    className="flex-1 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-sm sm:text-base text-slate-700 outline-none focus:ring-2 focus:ring-sky-300 transition-all"
                />
            ) : (
                <span
                    onDoubleClick={startEdit}
                    className={`flex-1 text-sm sm:text-base break-words cursor-default select-none transition-colors ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}
                    title="双击编辑"
                >
                    {item.text}
                </span>
            )}

            {/* Edit pencil button */}
            {!editing && (
                <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-sky-50 hover:text-sky-500 transition-all"
                    aria-label="编辑任务"
                >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </button>
            )}

            {/* Delete */}
            <button
                type="button"
                onClick={onDelete}
                className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-all"
                aria-label="删除任务"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </li>
    );
};

export default React.memo(TodoItemComponent);
