export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    priority: Priority;
    createdAt: number;
}

export type Priority = 'high' | 'medium' | 'low';
export type FilterType = 'all' | 'active' | 'completed';

export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_CONFIG: Record<
    Priority,
    { label: string; tag: string; tagActive: string; row: string; dot: string }
> = {
    high: {
        label: '高',
        tag: 'border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950',
        tagActive: 'bg-rose-500 text-white border-rose-500 shadow-sm',
        row: 'bg-rose-50/60 border-rose-100 hover:border-rose-200 hover:bg-rose-50/80 dark:bg-rose-950/40 dark:border-rose-900 dark:hover:border-rose-800 dark:hover:bg-rose-950/60',
        dot: 'bg-rose-500',
    },
    medium: {
        label: '中',
        tag: 'border-amber-200 text-amber-500 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950',
        tagActive: 'bg-amber-500 text-white border-amber-500 shadow-sm',
        row: 'bg-amber-50/60 border-amber-100 hover:border-amber-200 hover:bg-amber-50/80 dark:bg-amber-950/40 dark:border-amber-900 dark:hover:border-amber-800 dark:hover:bg-amber-950/60',
        dot: 'bg-amber-500',
    },
    low: {
        label: '低',
        tag: 'border-sky-200 text-sky-500 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950',
        tagActive: 'bg-sky-500 text-white border-sky-500 shadow-sm',
        row: 'bg-sky-50/60 border-sky-100 hover:border-sky-200 hover:bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-900 dark:hover:border-sky-800 dark:hover:bg-sky-950/60',
        dot: 'bg-sky-500',
    },
};

export const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '待完成' },
    { key: 'completed', label: '已完成' },
];

export const TODO_STORAGE_KEY = 'react-playground-todos';
