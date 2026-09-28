/**
 * ============================================================================
 * index.test.tsx — Error Boundary 专题
 * ============================================================================
 *
 * - 冒烟:页头与隔离演示能渲染
 * - 隔离:左侧引爆后右侧对照仍可交互
 * - 捕获范围:事件处理 throw 不启动边界
 * - 粒度:细粒度 A 崩 B 在;粗粒度整块一起降级
 * - 恢复:撤掉抛错条件能恢复,只清错误态不能
 *
 * @module topics/advanced/error-boundary/index.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import ErrorBoundaryTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <ErrorBoundaryTopic />
        </MemoryRouter>,
    );
}

describe('Error Boundary 专题', () => {
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('渲染页头与隔离演示', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'Error Boundary' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /局部崩溃,局部降级/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '小组件 A +1(到 3 会抛错)' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '小组件 B +1(不会抛错)' })).toBeInTheDocument();
    });

    it('左侧引爆后右侧对照仍可交互', async () => {
        const user = userEvent.setup();
        renderTopic();

        const bomb = screen.getByRole('button', { name: '小组件 A +1(到 3 会抛错)' });
        await user.click(bomb);
        await user.click(bomb);
        await user.click(bomb);

        expect(screen.getByTestId('boundary-fallback-左侧面板')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '小组件 A +1(到 3 会抛错)' })).not.toBeInTheDocument();

        const healthy = screen.getByRole('button', { name: '小组件 B +1(不会抛错)' });
        await user.click(healthy);
        expect(screen.getByLabelText('小组件 B当前计数')).toHaveTextContent('1');
    });

    it('事件处理 throw 不会替换边界 UI', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '事件处理 throw' }));

        expect(screen.getByText('边界没有介入')).toBeInTheDocument();
        expect(screen.getByTestId('boundary-frame-捕获范围')).toBeInTheDocument();
        expect(screen.queryByTestId('boundary-fallback-捕获范围')).not.toBeInTheDocument();
    });

    it('细粒度下 A 崩了 B 还在;粗粒度下整块一起降级', async () => {
        const user = userEvent.setup();
        renderTopic();

        const bombA = screen.getByRole('button', { name: '面板 A +1(到 2 会抛错)' });
        await user.click(bombA);
        await user.click(bombA);

        expect(screen.getByTestId('boundary-fallback-面板 A')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '面板 B +1(到 2 会抛错)' })).toBeInTheDocument();

        await user.click(screen.getByRole('switch', { name: '细粒度边界' }));

        const coarseA = screen.getByRole('button', { name: '面板 A +1(到 2 会抛错)' });
        await user.click(coarseA);
        await user.click(coarseA);

        expect(screen.getByTestId('boundary-fallback-整块面板')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: '面板 B +1(到 2 会抛错)' })).not.toBeInTheDocument();
    });

    it('撤掉抛错条件可以恢复,只清错误态不能恢复', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '用 props 引爆左栏' }));
        expect(screen.getByTestId('boundary-fallback-只清错误态')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '重置「只清错误态」' }));
        expect(screen.getByTestId('boundary-fallback-只清错误态')).toBeInTheDocument();
        expect(screen.queryByLabelText('左栏状态')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '用 props 引爆右栏' }));
        expect(screen.getByTestId('boundary-fallback-撤掉抛错条件')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '重置「撤掉抛错条件」' }));
        expect(screen.queryByTestId('boundary-fallback-撤掉抛错条件')).not.toBeInTheDocument();
        expect(screen.getByLabelText('右栏状态')).toHaveTextContent('右栏 正常(armed=false)');
    });
});
