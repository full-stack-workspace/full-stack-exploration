import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { RecordTable } from './RecordTable';
import type { BookkeepingRecord, DateRange } from './types';
import dayjs from 'dayjs';

const mockRecords: BookkeepingRecord[] = [
    { id: '1', type: 'income', amount: 5000, category: '工资', description: '月薪', date: '2025-03-01' },
    { id: '2', type: 'expense', amount: 30, category: '餐饮', description: '午餐', date: '2025-03-02' },
    { id: '3', type: 'expense', amount: 200, category: '交通', description: '加油', date: '2025-02-15' },
];

describe('RecordTable', () => {
    const mockOnDelete = vi.fn();
    const mockOnDateRangeChange = vi.fn();

    beforeEach(() => {
        mockOnDelete.mockClear();
        mockOnDateRangeChange.mockClear();
    });

    const renderTable = (
        records: BookkeepingRecord[] = mockRecords,
        dateRange: DateRange = null,
    ) =>
        render(
            <RecordTable
                records={records}
                onDelete={mockOnDelete}
                dateRange={dateRange}
                onDateRangeChange={mockOnDateRangeChange}
            />,
        );

    describe('渲染', () => {
        it('应该渲染"收支明细"标题', () => {
            renderTable();
            expect(screen.getByText('收支明细')).toBeInTheDocument();
        });

        it('应该渲染包含所有记录的表格', () => {
            renderTable();
            expect(screen.getByText('月薪')).toBeInTheDocument();
            expect(screen.getByText('午餐')).toBeInTheDocument();
            expect(screen.getByText('加油')).toBeInTheDocument();
        });

        it('无记录时应显示空状态提示"暂无记录，开始记账吧！"', () => {
            renderTable([]);
            expect(screen.getByText('暂无记录，开始记账吧！')).toBeInTheDocument();
        });
    });

    describe('表格列展示', () => {
        it('应该正确显示每条记录的日期', () => {
            renderTable();
            expect(screen.getByText('2025-03-01')).toBeInTheDocument();
            expect(screen.getByText('2025-03-02')).toBeInTheDocument();
            expect(screen.getByText('2025-02-15')).toBeInTheDocument();
        });

        it('收入记录应显示"收入" Tag', () => {
            renderTable();
            const tags = document.querySelectorAll('.ant-tag');
            const incomeTag = Array.from(tags).find((t) => t.textContent === '收入');
            expect(incomeTag).toBeTruthy();
        });

        it('支出记录应显示"支出" Tag', () => {
            renderTable();
            const tags = document.querySelectorAll('.ant-tag');
            const expenseTags = Array.from(tags).filter((t) => t.textContent === '支出');
            expect(expenseTags.length).toBe(2);
        });

        it('收入金额应以 + 号前缀展示', () => {
            renderTable();
            expect(screen.getByText(/\+.*5,000\.00/)).toBeInTheDocument();
        });

        it('支出金额应以 - 号前缀展示', () => {
            renderTable();
            expect(screen.getByText(/-.*30\.00/)).toBeInTheDocument();
            expect(screen.getByText(/-.*200\.00/)).toBeInTheDocument();
        });

        it('应该显示记录的分类和备注', () => {
            renderTable();
            expect(screen.getByText('工资')).toBeInTheDocument();
            expect(screen.getByText('餐饮')).toBeInTheDocument();
            expect(screen.getByText('交通')).toBeInTheDocument();
        });
    });

    describe('删除操作', () => {
        it('点击删除按钮应弹出确认框', async () => {
            renderTable();
            const deleteButtons = document.querySelectorAll('.ant-btn-dangerous');
            fireEvent.click(deleteButtons[0]!);

            await waitFor(() => {
                expect(screen.getByText('确定删除这条记录吗？')).toBeInTheDocument();
            });
        });

        it('确认删除后应调用 onDelete 并传入对应记录 id', async () => {
            renderTable();
            const deleteButtons = document.querySelectorAll('.ant-btn-dangerous');
            fireEvent.click(deleteButtons[0]!);

            let confirmBtn: Element | null = null;
            await waitFor(() => {
                expect(screen.getByText('确定删除这条记录吗？')).toBeInTheDocument();
                const popover = document.querySelector('.ant-popconfirm');
                const btns = popover?.querySelectorAll('button') ?? [];
                confirmBtn = Array.from(btns).find(
                    (b) => b.textContent?.includes('确定') && !b.textContent?.includes('删除'),
                ) ?? null;
                if (!confirmBtn) {
                    confirmBtn = Array.from(btns).pop() ?? null;
                }
                expect(confirmBtn).toBeTruthy();
            });

            fireEvent.click(confirmBtn!);

            await waitFor(() => {
                expect(mockOnDelete).toHaveBeenCalledTimes(1);
                const calledId = mockOnDelete.mock.calls[0][0];
                expect(mockRecords.some((r) => r.id === calledId)).toBe(true);
            });
        });

        it('取消删除后不应调用 onDelete', async () => {
            renderTable();
            const deleteButtons = document.querySelectorAll('.ant-btn-dangerous');
            fireEvent.click(deleteButtons[0]!);

            let cancelBtn: Element | null = null;
            await waitFor(() => {
                expect(screen.getByText('确定删除这条记录吗？')).toBeInTheDocument();
                const popover = document.querySelector('.ant-popconfirm');
                const btns = popover?.querySelectorAll('button') ?? [];
                cancelBtn = Array.from(btns).find(
                    (b) => b.textContent?.includes('取消'),
                ) ?? null;
                if (!cancelBtn) {
                    cancelBtn = Array.from(btns)[0] ?? null;
                }
                expect(cancelBtn).toBeTruthy();
            });

            fireEvent.click(cancelBtn!);

            expect(mockOnDelete).not.toHaveBeenCalled();
        });
    });

    describe('日期筛选', () => {
        it('点击"清除筛选"按钮应调用 onDateRangeChange(null)', () => {
            renderTable(mockRecords, [dayjs('2025-03-01'), dayjs('2025-03-31')]);
            const clearBtn = screen.getByText('清除筛选');
            fireEvent.click(clearBtn);
            expect(mockOnDateRangeChange).toHaveBeenCalledWith(null);
        });

        it('无筛选条件时不应显示"清除筛选"按钮', () => {
            renderTable(mockRecords, null);
            expect(screen.queryByText('清除筛选')).not.toBeInTheDocument();
        });
    });
});
