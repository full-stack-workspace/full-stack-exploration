/**
 * ============================================================================
 * 待办事项清单(/apps/todo)
 * ============================================================================
 *
 * 综合应用:任务增删改、筛选、优先级与本地持久化。
 *
 * 功能特点:
 * - 持有全局状态(任务列表、筛选、清空确认)
 * - 提供所有业务操作(增删改、切换完成状态、全选、清除等)
 * - 组织 TodoComposer / TodoItem / 筛选栏 / 底部操作区,骨架复用 TopicPage
 *
 * @module topics/apps/todo
 */
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
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
 * 空态展示的两种 variant 配置:
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

/** 列表为空时的占位提示,根据 variant 切换图标与文案 */
const TodoEmptyState = memo<{ variant: keyof typeof EMPTY_STATE_CONFIG }>(({
    variant,
}) => {
    const { iconPath, title, subtitle } = EMPTY_STATE_CONFIG[variant];
    return (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400 dark:text-slate-500">
            <svg
                className="h-12 w-12 mb-4 text-sky-200 dark:text-sky-800"
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
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
        </div>
    );
});

TodoEmptyState.displayName = 'TodoEmptyState';

const Todo = memo(() => {
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
        <TopicPage
            title="待办事项清单"
            description="增删改查、筛选、优先级与本地持久化 —— 添加、勾选、双击或点击铅笔编辑,数据自动保存在浏览器本地"
        >
            <TopicSection
                title="任务清单"
                note="输入框受控于页面状态;筛选、统计、批量操作全部由同一份 todos 派生,无冗余状态"
            >
                {/* 新任务输入区:文本输入、添加按钮、优先级选择 */}
                <TodoComposer
                    value={input}
                    priority={priority}
                    onChange={setInput}
                    onPriorityChange={setPriority}
                    onAdd={addTodo}
                />

                {/* 筛选栏:tab 切换 + 任务数量统计 */}
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
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
                            >
                                {allCompleted ? '取消全选' : '全部完成'}
                            </button>
                            {completedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearCompleted}
                                    className="text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
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
                                    ? 'text-rose-600 dark:text-rose-400 font-medium animate-pulse'
                                    : 'text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400'
                            }`}
                        >
                            {confirmClearAll ? '再次点击确认清空' : '全部清空'}
                        </button>
                    </div>
                )}
            </TopicSection>
        </TopicPage>
    );
});

Todo.displayName = 'Todo';

export default Todo;
