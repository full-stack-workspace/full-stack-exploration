import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { SummaryCards } from './SummaryCards';
import { AddRecordForm } from './AddRecordForm';
import { RecordTable } from './RecordTable';
import { STORAGE_KEY, type BookkeepingRecord, type DateRange } from './types';

const Bookkeeping: React.FC = () => {
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
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">记账本</h1>
                <p className="text-gray-500 mt-1">
                    管理你的收入与支出，掌握财务状况
                </p>
            </div>

            <SummaryCards
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                balance={balance}
            />

            <AddRecordForm onAdd={handleAdd} />

            <RecordTable
                records={filteredRecords}
                onDelete={handleDelete}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
            />
        </div>
    );
};

export default Bookkeeping;
