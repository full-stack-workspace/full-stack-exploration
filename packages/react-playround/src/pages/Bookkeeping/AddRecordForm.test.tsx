import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/utils';
import { AddRecordForm } from './AddRecordForm';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './types';

/**
 * Ant Design v6 Select helper: opens the dropdown by clicking on the
 * select's trigger area, then picks the option by title attribute.
 */
async function selectOption(container: HTMLElement, index: number, optionTitle: string) {
    const selects = container.querySelectorAll<HTMLElement>('.ant-select');
    const target = selects[index];
    fireEvent.mouseDown(target.querySelector('.ant-select-content')!);

    await waitFor(() => {
        const option = document.querySelector(`.ant-select-item[title="${optionTitle}"]`);
        expect(option).toBeTruthy();
        fireEvent.click(option!);
    });
}

describe('AddRecordForm', () => {
    const mockOnAdd = vi.fn();

    beforeEach(() => {
        mockOnAdd.mockClear();
    });

    describe('渲染', () => {
        it('应该渲染类型选择器，默认值为"支出"', () => {
            const { container } = render(<AddRecordForm onAdd={mockOnAdd} />);
            const typeValue = container.querySelector('.ant-select-content[title="支出"]');
            expect(typeValue).toBeTruthy();
            expect(typeValue!.textContent).toBe('支出');
        });

        it('应该渲染金额输入框', () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);
            expect(screen.getByPlaceholderText('金额')).toBeInTheDocument();
        });

        it('应该渲染分类选择器', () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);
            expect(screen.getByText('选择分类')).toBeInTheDocument();
        });

        it('应该渲染备注输入框', () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);
            expect(screen.getByPlaceholderText('备注（可选）')).toBeInTheDocument();
        });

        it('应该渲染"添加"按钮', () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);
            expect(screen.getByRole('button', { name: /添加/ })).toBeInTheDocument();
        });
    });

    describe('分类联动', () => {
        it('当类型为"支出"时，分类下拉应显示支出分类列表', async () => {
            const { container } = render(<AddRecordForm onAdd={mockOnAdd} />);
            const selects = container.querySelectorAll<HTMLElement>('.ant-select');
            fireEvent.mouseDown(selects[1].querySelector('.ant-select-content')!);

            await waitFor(() => {
                EXPENSE_CATEGORIES.forEach((cat) => {
                    expect(document.querySelector(`.ant-select-item[title="${cat}"]`)).toBeTruthy();
                });
            });
        });

        it('当类型切换为"收入"时，分类下拉应切换为收入分类列表', async () => {
            const { container } = render(<AddRecordForm onAdd={mockOnAdd} />);

            await selectOption(container, 0, '收入');

            const selects = container.querySelectorAll<HTMLElement>('.ant-select');
            fireEvent.mouseDown(selects[1].querySelector('.ant-select-content')!);

            await waitFor(() => {
                INCOME_CATEGORIES.forEach((cat) => {
                    expect(document.querySelector(`.ant-select-item[title="${cat}"]`)).toBeTruthy();
                });
            });
        });
    });

    describe('表单校验', () => {
        it('金额为空时点击添加，应显示校验错误提示', async () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);
            fireEvent.click(screen.getByRole('button', { name: /添加/ }));

            await waitFor(() => {
                expect(screen.getByText('请输入金额')).toBeInTheDocument();
            });
            expect(mockOnAdd).not.toHaveBeenCalled();
        });

        it('分类未选择时点击添加，应显示校验错误提示', async () => {
            render(<AddRecordForm onAdd={mockOnAdd} />);

            const amountInput = screen.getByPlaceholderText('金额');
            fireEvent.change(amountInput, { target: { value: '100' } });
            fireEvent.click(screen.getByRole('button', { name: /添加/ }));

            await waitFor(() => {
                expect(screen.getByText('请选择分类')).toBeInTheDocument();
            });
            expect(mockOnAdd).not.toHaveBeenCalled();
        });
    });

    describe('提交', () => {
        it('填写完整信息后点击添加，应调用 onAdd 并传入正确的记录对象', async () => {
            const { container } = render(<AddRecordForm onAdd={mockOnAdd} />);

            fireEvent.change(screen.getByPlaceholderText('金额'), { target: { value: '50' } });
            await selectOption(container, 1, EXPENSE_CATEGORIES[0]);
            fireEvent.change(screen.getByPlaceholderText('备注（可选）'), { target: { value: '测试备注' } });
            fireEvent.click(screen.getByRole('button', { name: /添加/ }));

            await waitFor(() => {
                expect(mockOnAdd).toHaveBeenCalledTimes(1);
            });

            const record = mockOnAdd.mock.calls[0][0];
            expect(record.type).toBe('expense');
            expect(record.amount).toBe(50);
            expect(record.category).toBe(EXPENSE_CATEGORIES[0]);
            expect(record.description).toBe('测试备注');
        });

        it('提交的记录应包含唯一 id、type、amount、category、description、date 字段', async () => {
            const { container } = render(<AddRecordForm onAdd={mockOnAdd} />);

            fireEvent.change(screen.getByPlaceholderText('金额'), { target: { value: '200' } });
            await selectOption(container, 1, EXPENSE_CATEGORIES[1]);
            fireEvent.click(screen.getByRole('button', { name: /添加/ }));

            await waitFor(() => {
                expect(mockOnAdd).toHaveBeenCalledTimes(1);
            });

            const record = mockOnAdd.mock.calls[0][0];
            expect(record).toHaveProperty('id');
            expect(record).toHaveProperty('type');
            expect(record).toHaveProperty('amount');
            expect(record).toHaveProperty('category');
            expect(record).toHaveProperty('description');
            expect(record).toHaveProperty('date');
            expect(record.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
