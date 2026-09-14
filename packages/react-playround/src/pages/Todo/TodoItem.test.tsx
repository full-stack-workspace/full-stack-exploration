/**
 * @file TodoItem.test.tsx
 *
 * @description TodoItem 组件单元测试
 * 验证渲染状态、编辑交互、优先级循环切换等核心行为。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import TodoItemComponent from './TodoItem';
import type { TodoItem, Priority } from './types';

const makeItem = (overrides: Partial<TodoItem> = {}): TodoItem => ({
    id: 'test-id',
    text: '测试任务',
    completed: false,
    priority: 'medium',
    createdAt: Date.now(),
    ...overrides,
});

const defaultProps = {
    item: makeItem(),
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onPriorityChange: vi.fn(),
};

describe('TodoItem — 基础渲染', () => {
    it('渲染任务文本', () => {
        render(<TodoItemComponent {...defaultProps} />);
        expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('未完成状态：文本无删除线，checkbox aria-label 为"标记为已完成"', () => {
        render(<TodoItemComponent {...defaultProps} item={makeItem({ completed: false })} />);

        const text = screen.getByText('测试任务');
        expect(text.className).not.toContain('line-through');
        expect(screen.getByLabelText('标记为已完成')).toBeInTheDocument();
    });

    it('已完成状态：文本有删除线，checkbox aria-label 为"标记为未完成"', () => {
        render(<TodoItemComponent {...defaultProps} item={makeItem({ completed: true })} />);

        const text = screen.getByText('测试任务');
        expect(text.className).toContain('line-through');
        expect(screen.getByLabelText('标记为未完成')).toBeInTheDocument();
    });

    it('优先级徽章显示对应标签', () => {
        const priorities: { priority: Priority; label: string }[] = [
            { priority: 'high', label: '高' },
            { priority: 'medium', label: '中' },
            { priority: 'low', label: '低' },
        ];

        priorities.forEach(({ priority, label }) => {
            const { unmount } = render(
                <TodoItemComponent {...defaultProps} item={makeItem({ priority })} />,
            );
            expect(screen.getByTitle('点击切换优先级')).toHaveTextContent(label);
            unmount();
        });
    });
});

describe('TodoItem — 交互', () => {
    it('点击 checkbox 触发 onToggle', () => {
        const onToggle = vi.fn();
        render(<TodoItemComponent {...defaultProps} onToggle={onToggle} />);

        fireEvent.click(screen.getByLabelText('标记为已完成'));
        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('点击删除按钮触发 onDelete', () => {
        const onDelete = vi.fn();
        render(<TodoItemComponent {...defaultProps} onDelete={onDelete} />);

        fireEvent.click(screen.getByLabelText('删除任务'));
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('点击优先级徽章触发 onPriorityChange，参数为下一级（循环）', () => {
        const onPriorityChange = vi.fn();

        // high → medium
        const { unmount: u1 } = render(
            <TodoItemComponent
                {...defaultProps}
                item={makeItem({ priority: 'high' })}
                onPriorityChange={onPriorityChange}
            />,
        );
        fireEvent.click(screen.getByTitle('点击切换优先级'));
        expect(onPriorityChange).toHaveBeenCalledWith('medium');
        u1();

        onPriorityChange.mockClear();

        // low → high（循环回头）
        render(
            <TodoItemComponent
                {...defaultProps}
                item={makeItem({ priority: 'low' })}
                onPriorityChange={onPriorityChange}
            />,
        );
        fireEvent.click(screen.getByTitle('点击切换优先级'));
        expect(onPriorityChange).toHaveBeenCalledWith('high');
    });

    it('双击文本进入编辑模式，出现输入框', () => {
        render(<TodoItemComponent {...defaultProps} />);

        fireEvent.dblClick(screen.getByText('测试任务'));
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('编辑后按 Enter 提交，触发 onEdit 并传入新文本', () => {
        const onEdit = vi.fn();
        render(<TodoItemComponent {...defaultProps} onEdit={onEdit} />);

        fireEvent.dblClick(screen.getByText('测试任务'));
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '修改后的任务' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onEdit).toHaveBeenCalledWith('修改后的任务');
    });

    it('编辑后按 Escape 取消，不触发 onEdit，文本恢复原值', () => {
        const onEdit = vi.fn();
        render(<TodoItemComponent {...defaultProps} onEdit={onEdit} />);

        fireEvent.dblClick(screen.getByText('测试任务'));
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '未提交的内容' } });
        fireEvent.keyDown(input, { key: 'Escape' });

        expect(onEdit).not.toHaveBeenCalled();
        expect(screen.getByText('测试任务')).toBeInTheDocument();
    });

    it('编辑内容与原文相同，失焦后不触发 onEdit', () => {
        const onEdit = vi.fn();
        render(<TodoItemComponent {...defaultProps} onEdit={onEdit} />);

        fireEvent.dblClick(screen.getByText('测试任务'));
        const input = screen.getByRole('textbox');
        // 内容未变，直接失焦
        fireEvent.blur(input);

        expect(onEdit).not.toHaveBeenCalled();
    });

    it('点击铅笔按钮进入编辑模式，出现输入框', () => {
        render(<TodoItemComponent {...defaultProps} />);

        fireEvent.click(screen.getByLabelText('编辑任务'));
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
});
