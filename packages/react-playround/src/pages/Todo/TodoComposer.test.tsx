/**
 * @file TodoComposer.test.tsx
 *
 * @description TodoComposer 组件单元测试
 * 验证输入框、添加按钮、优先级 tag 选择器的渲染与交互。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import TodoComposer from './TodoComposer';
import type { Priority } from './types';

const defaultProps = {
    value: '',
    priority: 'medium' as Priority,
    onChange: vi.fn(),
    onPriorityChange: vi.fn(),
    onAdd: vi.fn(),
};

describe('TodoComposer', () => {
    it('渲染输入框、添加按钮和 3 个优先级 tag', () => {
        render(<TodoComposer {...defaultProps} />);

        expect(screen.getByPlaceholderText('输入新任务，回车添加…')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '添加' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '高' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '中' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '低' })).toBeInTheDocument();
    });

    it('输入框为空时添加按钮为 disabled', () => {
        render(<TodoComposer {...defaultProps} value="" />);
        expect(screen.getByRole('button', { name: '添加' })).toBeDisabled();
    });

    it('输入文字后 onChange 被调用，参数为输入值', () => {
        const onChange = vi.fn();
        render(<TodoComposer {...defaultProps} onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText('输入新任务，回车添加…'), {
            target: { value: '新任务' },
        });
        expect(onChange).toHaveBeenCalledWith('新任务');
    });

    it('输入框内按 Enter 触发 onAdd', () => {
        const onAdd = vi.fn();
        render(<TodoComposer {...defaultProps} value="任务内容" onAdd={onAdd} />);

        fireEvent.keyDown(screen.getByPlaceholderText('输入新任务，回车添加…'), {
            key: 'Enter',
        });
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('点击添加按钮触发 onAdd', () => {
        const onAdd = vi.fn();
        render(<TodoComposer {...defaultProps} value="任务内容" onAdd={onAdd} />);

        fireEvent.click(screen.getByRole('button', { name: '添加' }));
        expect(onAdd).toHaveBeenCalledTimes(1);
    });

    it('点击优先级 tag 触发 onPriorityChange，参数为对应 key', () => {
        const onPriorityChange = vi.fn();
        render(<TodoComposer {...defaultProps} onPriorityChange={onPriorityChange} />);

        fireEvent.click(screen.getByRole('button', { name: '高' }));
        expect(onPriorityChange).toHaveBeenCalledWith('high');

        fireEvent.click(screen.getByRole('button', { name: '低' }));
        expect(onPriorityChange).toHaveBeenCalledWith('low');
    });

    it('当前 priority 对应的 tag 具有激活样式，其余无', () => {
        render(<TodoComposer {...defaultProps} priority="high" />);

        // 激活态：bg-rose-500（高优先级）
        const highBtn = screen.getByRole('button', { name: '高' });
        expect(highBtn.className).toContain('bg-rose-500');

        // 未激活：无填充色，仅边框（medium / low）
        const medBtn = screen.getByRole('button', { name: '中' });
        expect(medBtn.className).not.toContain('bg-amber-500');

        const lowBtn = screen.getByRole('button', { name: '低' });
        expect(lowBtn.className).not.toContain('bg-sky-500');
    });
});
