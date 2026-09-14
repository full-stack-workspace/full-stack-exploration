import type { Dayjs } from 'dayjs';

export interface BookkeepingRecord {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}

export type DateRange = [Dayjs | null, Dayjs | null] | null;

export const STORAGE_KEY = 'bookkeeping_records';

export const INCOME_CATEGORIES = [
    '工资',
    '奖金',
    '投资收益',
    '兼职',
    '红包',
    '其他收入',
];

export const EXPENSE_CATEGORIES = [
    '餐饮',
    '交通',
    '购物',
    '住房',
    '娱乐',
    '医疗',
    '教育',
    '其他支出',
];
