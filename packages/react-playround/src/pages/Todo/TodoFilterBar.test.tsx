/**
 * @file TodoFilterBar.test.tsx
 *
 * @description TodoFilterBar 组件单元测试
 * 验证筛选 tab 渲染、激活样式切换、回调触发及计数徽章显示。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import TodoFilterBar from './TodoFilterBar';
import type { FilterType } from './types';

const defaultProps = {
    filter: 'all' as FilterType,
    remainingCount: 3,
    completedCount: 2,
    onFilterChange: vi.fn(),
};

describe('TodoFilterBar', () => {
    it('渲染 3 个筛选 tab 和 2 个计数徽章', () => {
        render(<TodoFilterBar {...defaultProps} />);

        expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '待完成' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '已完成' })).toBeInTheDocument();
        // 计数徽章以 text 形式存在
        expect(screen.getByText(/3\s*待完成/)).toBeInTheDocument();
        expect(screen.getByText(/2\s*已完成/)).toBeInTheDocument();
    });

    it('当前 filter 对应的 tab 具有激活样式（text-sky-600）', () => {
        render(<TodoFilterBar {...defaultProps} filter="active" />);

        const activeTab = screen.getByRole('button', { name: '待完成' });
        expect(activeTab.className).toContain('text-sky-600');

        // 非激活 tab 不含激活色
        const inactiveTab = screen.getByRole('button', { name: '全部' });
        expect(inactiveTab.className).not.toContain('text-sky-600');
    });

    it('点击非激活 tab 触发 onFilterChange，参数为对应 key', () => {
        const onFilterChange = vi.fn();
        render(<TodoFilterBar {...defaultProps} onFilterChange={onFilterChange} />);

        fireEvent.click(screen.getByRole('button', { name: '待完成' }));
        expect(onFilterChange).toHaveBeenCalledWith('active');

        fireEvent.click(screen.getByRole('button', { name: '已完成' }));
        expect(onFilterChange).toHaveBeenCalledWith('completed');
    });

    it('待完成数量徽章显示正确数字', () => {
        render(<TodoFilterBar {...defaultProps} remainingCount={5} />);
        expect(screen.getByText(/5\s*待完成/)).toBeInTheDocument();
    });

    it('已完成数量徽章显示正确数字', () => {
        render(<TodoFilterBar {...defaultProps} completedCount={7} />);
        expect(screen.getByText(/7\s*已完成/)).toBeInTheDocument();
    });
});
