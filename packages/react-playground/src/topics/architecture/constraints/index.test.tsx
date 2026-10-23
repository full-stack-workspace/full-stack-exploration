import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ConstraintsPage from './index';

describe('设计约束', () => {
    it('同时呈现栈协调的等待和工作单元的让出', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ConstraintsPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: '原理与架构 · 设计约束' })).toBeInTheDocument();
        expect(screen.getByText('点击处于等待')).toBeInTheDocument();
        expect(screen.getByText('遍历尚未让出')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '走完调用栈' }));
        await user.click(screen.getByRole('button', { name: '让出当前单元' }));

        expect(screen.getByText('点击出现在遍历结束之后')).toBeInTheDocument();
        expect(screen.getByText('点击在让出时被处理')).toBeInTheDocument();
    });
});
