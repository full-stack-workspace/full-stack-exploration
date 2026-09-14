import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { SummaryCards } from './SummaryCards';

describe('SummaryCards', () => {
    describe('渲染', () => {
        it('应该渲染三张汇总卡片：总收入、总支出、余额', () => {
            render(
                <SummaryCards totalIncome={0} totalExpense={0} balance={0} />,
            );
            expect(screen.getByText('总收入')).toBeInTheDocument();
            expect(screen.getByText('总支出')).toBeInTheDocument();
            expect(screen.getByText('余额')).toBeInTheDocument();
        });

        it('应该正确显示传入的总收入金额', () => {
            render(
                <SummaryCards
                    totalIncome={5000}
                    totalExpense={0}
                    balance={5000}
                />,
            );
            const incomeCard = screen.getByText('总收入').closest('div[class*="rounded"]')!;
            expect(incomeCard).toHaveTextContent('5,000.00');
        });

        it('应该正确显示传入的总支出金额', () => {
            render(
                <SummaryCards
                    totalIncome={0}
                    totalExpense={3000}
                    balance={-3000}
                />,
            );
            const expenseCard = screen.getByText('总支出').closest('div[class*="rounded"]')!;
            expect(expenseCard).toHaveTextContent('3,000.00');
        });

        it('应该正确显示传入的余额', () => {
            render(
                <SummaryCards
                    totalIncome={8000}
                    totalExpense={3000}
                    balance={5000}
                />,
            );
            const balanceCard = screen.getByText('余额').closest('div[class*="rounded"]')!;
            expect(balanceCard).toHaveTextContent('5,000.00');
        });
    });

    describe('金额格式化', () => {
        it('金额应该保留两位小数', () => {
            render(
                <SummaryCards totalIncome={100} totalExpense={0} balance={100} />,
            );
            const incomeCard = screen.getByText('总收入').closest('div[class*="rounded"]')!;
            expect(incomeCard).toHaveTextContent('100.00');
        });

        it('金额应该带有 ¥ 前缀', () => {
            render(
                <SummaryCards totalIncome={100} totalExpense={0} balance={100} />,
            );
            const incomeCard = screen.getByText('总收入').closest('div[class*="rounded"]')!;
            expect(incomeCard).toHaveTextContent('¥');
        });

        it('传入 0 时应显示 ¥ 0.00', () => {
            render(
                <SummaryCards totalIncome={0} totalExpense={0} balance={0} />,
            );
            const cards = screen.getAllByText(/¥/);
            cards.forEach((card) => {
                expect(card).toHaveTextContent('0.00');
            });
        });

        it('大数字应该有千分位分隔符', () => {
            render(
                <SummaryCards
                    totalIncome={12345.6}
                    totalExpense={0}
                    balance={12345.6}
                />,
            );
            const incomeCard = screen.getByText('总收入').closest('div[class*="rounded"]')!;
            expect(incomeCard).toHaveTextContent('12,345.60');
        });
    });
});
