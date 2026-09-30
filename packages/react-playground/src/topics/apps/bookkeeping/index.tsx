/**
 * ============================================================================
 * 记账本(/apps/bookkeeping)
 * ============================================================================
 *
 * 综合应用:表单校验、分类联动、汇总统计与表格展示。
 * 页面持有记录列表(localStorage 持久化)与日期筛选,
 * 汇总数据与筛选结果全部由 useMemo 派生,骨架复用 TopicPage / TopicSection。
 *
 * @module topics/apps/bookkeeping
 */
import { memo, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { SummaryCards } from './SummaryCards';
import { AddRecordForm } from './AddRecordForm';
import { RecordTable } from './RecordTable';
import { STORAGE_KEY, type BookkeepingRecord, type DateRange } from './types';

const Bookkeeping = memo(() => {
    const [records, setRecords] = useLocalStorage<BookkeepingRecord[]>(
        STORAGE_KEY,
        [],
    );
    const [dateRange, setDateRange] = useState<DateRange>(null);

    const filteredRecords = useMemo(() => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) { return records; }
        const start = dateRange[0].startOf('day');
        const end = dateRange[1].endOf('day');
        return records.filter((r) => {
            const d = dayjs(r.date);
            return (
                d.isAfter(start.subtract(1, 'millisecond')) &&
                d.isBefore(end.add(1, 'millisecond'))
            );
        });
    }, [records, dateRange]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = filteredRecords
            .filter((r) => r.type === 'income')
            .reduce((sum, r) => sum + r.amount, 0);
        const expense = filteredRecords
            .filter((r) => r.type === 'expense')
            .reduce((sum, r) => sum + r.amount, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [filteredRecords]);

    const handleAdd = useCallback(
        (record: BookkeepingRecord) => {
            setRecords((prev) => [record, ...prev]);
        },
        [setRecords],
    );

    const handleDelete = useCallback(
        (id: string) => {
            setRecords((prev) => prev.filter((r) => r.id !== id));
        },
        [setRecords],
    );

    return (
        <TopicPage
            title="记账本"
            description="表单校验、分类联动、汇总统计与表格展示 —— 管理你的收入与支出,掌握财务状况"
        >
            <TopicSection
                title="收支概览"
                note="总收入 / 总支出 / 余额全部由筛选后的记录派生,随日期筛选联动"
            >
                <SummaryCards
                    totalIncome={totalIncome}
                    totalExpense={totalExpense}
                    balance={balance}
                />
            </TopicSection>

            <TopicSection
                title="添加记录"
                note="类型切换联动分类选项;金额、分类、日期均带表单校验"
            >
                <AddRecordForm onAdd={handleAdd} />
            </TopicSection>

            <TopicSection
                title="收支明细"
                note="支持日期范围筛选、类型过滤与排序;删除带二次确认"
            >
                <RecordTable
                    records={filteredRecords}
                    onDelete={handleDelete}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
            </TopicSection>
        </TopicPage>
    );
});

Bookkeeping.displayName = 'Bookkeeping';

export default Bookkeeping;
