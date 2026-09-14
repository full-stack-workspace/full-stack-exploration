/**
 * @file index.tsx
 *
 * @description 待办事项页面根组件，负责：
 *   - 持有全局状态（任务列表、筛选、清空确认）
 *   - 提供所有业务操作（增删改、切换完成状态、全选、清除等）
 *   - 组织 TodoComposer / TodoItem / 筛选栏 / 底部操作区的布局
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import TodoComposer from './TodoComposer';
import TodoFilterBar from './TodoFilterBar';
import TodoItemComponent from './TodoItem';
import {
    TODO_STORAGE_KEY,
    type FilterType,
    type Priority,
    type TodoItem,
} from './types';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * 空态展示的两种 variant 配置：
 *   - empty    : 列表中完全没有任务
 *   - filtered : 有任务但当前筛选条件下没有匹配项
 */
const EMPTY_STATE_CONFIG = {
    empty: {
        iconPath:
            'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        title: '任务清单是空的',
        subtitle: '在上方输入框添加你的第一个任务吧 ↑',
    },
    filtered: {
        iconPath:
            'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
        title: '当前筛选下没有任务',
        subtitle: '试试切换到其他标签查看',
    },
} as const;

/** 页面顶部标题区：纯静态，不依赖任何 props/state */
const TodoPageHeader = () => (
    <header className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            待办事项 · Todo List
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            记录今天要完成的事情
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500">
            添加、勾选、双击或点击铅笔编辑，数据自动保存在浏览器本地。
        </p>
    </header>
);

/** 列表为空时的占位提示，根据 variant 切换图标与文案 */
const TodoEmptyState: React.FC<{ variant: keyof typeof EMPTY_STATE_CONFIG }> = ({
    variant,
}) => {
    const { iconPath, title, subtitle } = EMPTY_STATE_CONFIG[variant];
    return (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <svg
                className="h-12 w-12 mb-4 text-sky-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.2}
                    d={iconPath}
                />
            </svg>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
    );
};

const Todo: React.FC = () => {
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [filter, setFilter] = useState<FilterType>('all');
    const [confirmClearAll, setConfirmClearAll] = useState(false);
    const [todos, setTodos] = useLocalStorage<TodoItem[]>(TODO_STORAGE_KEY, []);

    useEffect(() => {
        if (!confirmClearAll) {return;}
        const t = setTimeout(() => setConfirmClearAll(false), 3000);
        return () => clearTimeout(t);
    }, [confirmClearAll]);

    // migrate old todos that lack priority field from earlier versions
    useEffect(() => {
        if (!todos.length) {return;}
        if (todos.some(t => !t.priority)) {
            setTodos(prev =>
                prev.map(t => ({
                    ...t,
                    priority: t.priority ?? 'medium',
                })),
            );
        }
    }, [todos, setTodos]);

    /* ---- actions ---- */

    const addTodo = useCallback(() => {
        const text = input.trim();
        if (!text) {return;}
        setTodos(prev => [
            { id: uid(), text, completed: false, priority, createdAt: Date.now() },
            ...prev,
        ]);
        setInput('');
    }, [input, priority, setTodos]);

    const toggleTodo = useCallback(
        (id: string) =>
            setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))),
        [setTodos],
    );

    const deleteTodo = useCallback(
        (id: string) => setTodos(prev => prev.filter(t => t.id !== id)),
        [setTodos],
    );

    const editTodo = useCallback(
        (id: string, text: string) =>
            setTodos(prev => prev.map(t => (t.id === id ? { ...t, text } : t))),
        [setTodos],
    );

    const changePriority = useCallback(
        (id: string, p: Priority) =>
            setTodos(prev => prev.map(t => (t.id === id ? { ...t, priority: p } : t))),
        [setTodos],
    );

    const toggleAll = useCallback(() => {
        setTodos(prev => {
            const allDone = prev.length > 0 && prev.every(t => t.completed);
            return prev.map(t => ({ ...t, completed: !allDone }));
        });
    }, [setTodos]);

    const clearCompleted = useCallback(
        () => setTodos(prev => prev.filter(t => !t.completed)),
        [setTodos],
    );

    const handleClearAll = useCallback(() => {
        if (confirmClearAll) {
            setTodos([]);
            setConfirmClearAll(false);
        } else {
            setConfirmClearAll(true);
        }
    }, [confirmClearAll, setTodos]);

    /* ---- derived ---- */

    const { filtered, completedCount, remainingCount, allCompleted } = useMemo(() => {
        const completed = todos.filter(t => t.completed).length;
        const list =
            filter === 'all'
                ? todos
                : filter === 'active'
                  ? todos.filter(t => !t.completed)
                  : todos.filter(t => t.completed);
        return {
            filtered: list,
            completedCount: completed,
            remainingCount: todos.length - completed,
            allCompleted: todos.length > 0 && completed === todos.length,
        };
    }, [todos, filter]);

    /* ---- render ---- */

    return (
        <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-4 py-6 sm:py-10">
            <div className="w-full max-w-xl">
                <TodoPageHeader />

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-sky-100 border border-sky-50 p-4 sm:p-6">
                    {/* 新任务输入区：文本输入、添加按钮、优先级选择 */}
                    <TodoComposer
                        value={input}
                        priority={priority}
                        onChange={setInput}
                        onPriorityChange={setPriority}
                        onAdd={addTodo}
                    />

                    {/* 筛选栏：tab 切换 + 任务数量统计 */}
                    {todos.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <TodoFilterBar
                                filter={filter}
                                remainingCount={remainingCount}
                                completedCount={completedCount}
                                onFilterChange={setFilter}
                            />
                        </div>
                    )}

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto pr-1">
                        {filtered.length === 0 ? (
                            <TodoEmptyState
                                variant={todos.length === 0 ? 'empty' : 'filtered'}
                            />
                        ) : (
                            <ul className="space-y-2">
                                {filtered.map(todo => (
                                    <TodoItemComponent
                                        key={todo.id}
                                        item={todo}
                                        onToggle={() => toggleTodo(todo.id)}
                                        onDelete={() => deleteTodo(todo.id)}
                                        onEdit={text => editTodo(todo.id, text)}
                                        onPriorityChange={p => changePriority(todo.id, p)}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer actions */}
                    {todos.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-xs sm:text-sm">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-slate-500 hover:text-sky-600 transition-colors"
                                >
                                    {allCompleted ? '取消全选' : '全部完成'}
                                </button>
                                {completedCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearCompleted}
                                        className="text-slate-500 hover:text-rose-500 transition-colors"
                                    >
                                        清除已完成 ({completedCount})
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className={`transition-all ${
                                    confirmClearAll
                                        ? 'text-rose-600 font-medium animate-pulse'
                                        : 'text-slate-400 hover:text-rose-500'
                                }`}
                            >
                                {confirmClearAll ? '再次点击确认清空' : '全部清空'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Todo;
